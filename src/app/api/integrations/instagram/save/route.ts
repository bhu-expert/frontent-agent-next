/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * GET /api/integrations/instagram/save?payload=<base64>&sig=<hmac>
 *
 * TEMPORARY DEBUG MODE: Returns JSON instead of redirecting.
 * Remove debug mode after confirming it works.
 */

const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const debug: Record<string, any> = {
    ts: new Date().toISOString(),
    route_reached: true,
    full_url: request.nextUrl.toString().slice(0, 200) + "...",
  };

  const { searchParams } = request.nextUrl;
  const payload = searchParams.get("payload");
  const sig = searchParams.get("sig");

  debug.has_payload = !!payload;
  debug.has_sig = !!sig;
  debug.payload_len = payload?.length ?? 0;

  if (!payload || !sig) {
    debug.error = "missing_save_params";
    return NextResponse.json(debug, { status: 400 });
  }

  // ── Verify HMAC signature ──────────────────────────────────────────────────
  try {
    const expectedSig = crypto
      .createHmac("sha256", INSTAGRAM_APP_SECRET)
      .update(payload)
      .digest("hex");

    debug.sig_match = sig === expectedSig;
    debug.sig_first8 = sig.slice(0, 8);
    debug.expected_first8 = expectedSig.slice(0, 8);

    if (sig !== expectedSig) {
      debug.error = "invalid_signature";
      return NextResponse.json(debug, { status: 403 });
    }
  } catch (e: any) {
    debug.error = `hmac_error: ${e.message}`;
    return NextResponse.json(debug, { status: 500 });
  }

  // ── Decode payload ─────────────────────────────────────────────────────────
  let data: any;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    debug.decoded = {
      user_id: data.user_id,
      ig_user_id: data.ig_user_id,
      username: data.username,
      name: data.name,
      has_access_token: !!data.access_token,
      access_token_len: data.access_token?.length ?? 0,
      expires_at: data.expires_at,
    };
  } catch (e: any) {
    debug.error = `decode_error: ${e.message}`;
    return NextResponse.json(debug, { status: 400 });
  }

  if (!data.user_id || !data.access_token) {
    debug.error = "incomplete_payload";
    return NextResponse.json(debug, { status: 400 });
  }

  // ── Store connection using JS admin client ─────────────────────────────────
  const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const igConnection = {
    provider: "instagram",
    connected_at: new Date().toISOString(),
    ig_user_id: data.ig_user_id,
    username: data.username,
    name: data.name,
    profile_picture_url: data.profile_picture_url,
    access_token: data.access_token,
    expires_at: data.expires_at,
  };

  // 1. Update user_metadata
  try {
    const userRes = await adminSupabase.auth.admin.getUserById(data.user_id);
    debug.getUserById = { ok: !userRes.error, err: userRes.error?.message ?? null };

    if (userRes.error) {
      debug.error = "user_not_found";
      return NextResponse.json(debug, { status: 404 });
    }

    const currentMeta = (userRes.data as any).user?.user_metadata || {};
    const updateRes = await adminSupabase.auth.admin.updateUserById(data.user_id, {
      user_metadata: { ...currentMeta, ig_connection: igConnection },
    });

    debug.updateUserById = {
      ok: !updateRes.error,
      err: updateRes.error?.message ?? null,
      has_ig_now: !!(updateRes.data as any)?.user?.user_metadata?.ig_connection,
    };
  } catch (e: any) {
    debug.updateUserById = { exception: e.message };
  }

  // 2. Upsert to integrations table
  try {
    const upsertRes = await adminSupabase.from("integrations").upsert(
      {
        user_id: data.user_id,
        provider: "instagram",
        provider_account_id: data.ig_user_id,
        connected_account: igConnection,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" }
    );
    debug.upsertIntegrations = { ok: !upsertRes.error, err: upsertRes.error?.message ?? null, http: upsertRes.status };
  } catch (e: any) {
    debug.upsertIntegrations = { exception: e.message };
  }

  debug.success = true;
  debug.would_redirect_to = `${APP_URL}/dashboard?tab=integrations&ig_connected=success`;
  debug.message = "DEBUG MODE: Returning JSON instead of redirecting. Check results above. If all OK, remove debug mode.";

  return NextResponse.json(debug, { status: 200 });
}
