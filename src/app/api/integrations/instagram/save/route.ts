/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * GET /api/integrations/instagram/save?payload=<base64>&sig=<hmac>
 *
 * Receives HMAC-signed Instagram connection data from the Python backend,
 * verifies the signature, stores the connection in Supabase, and redirects
 * to the dashboard.
 */

const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const payload = searchParams.get("payload");
  const sig = searchParams.get("sig");

  const redirectError = (msg: string) =>
    NextResponse.redirect(
      `${APP_URL}/dashboard?tab=integrations&ig_error=${encodeURIComponent(msg)}`
    );

  if (!payload || !sig) {
    return redirectError("missing_save_params");
  }

  // ── Verify HMAC signature ──────────────────────────────────────────────────
  const expectedSig = crypto
    .createHmac("sha256", INSTAGRAM_APP_SECRET)
    .update(payload)
    .digest("hex");

  if (sig !== expectedSig) {
    return redirectError("invalid_signature");
  }

  // ── Decode payload ─────────────────────────────────────────────────────────
  let data: any;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch {
    return redirectError("invalid_payload");
  }

  if (!data.user_id || !data.access_token) {
    return redirectError("incomplete_payload");
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
    if (userRes.error) {
      console.error("Save route: getUserById failed:", userRes.error.message);
      return redirectError("user_not_found");
    }

    const currentMeta = (userRes.data as any).user?.user_metadata || {};
    await adminSupabase.auth.admin.updateUserById(data.user_id, {
      user_metadata: { ...currentMeta, ig_connection: igConnection },
    });
  } catch (e: any) {
    console.error("Save route: updateUserById exception:", e.message);
  }

  // 2. Upsert to integrations table
  try {
    await adminSupabase.from("integrations").upsert(
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
  } catch (e: any) {
    console.error("Save route: upsert integrations exception:", e.message);
  }

  return NextResponse.redirect(
    `${APP_URL}/dashboard?tab=integrations&ig_connected=success`
  );
}
