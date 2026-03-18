import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

/**
 * GET /api/integrations/instagram/save?payload=<base64>&sig=<hmac>
 *
 * Called by the Python backend after successful Instagram OAuth token exchange.
 * The backend signs the connection data with HMAC-SHA256 using INSTAGRAM_APP_SECRET.
 * This route verifies the signature and stores the data using the JS admin client
 * (which works reliably, unlike the Python supabase client).
 */

const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const payload = searchParams.get("payload");
  const sig = searchParams.get("sig");

  const errorRedirect = (msg: string) =>
    NextResponse.redirect(
      `${APP_URL}/dashboard?tab=integrations&ig_error=${encodeURIComponent(msg)}`
    );

  if (!payload || !sig) {
    return errorRedirect("missing_save_params");
  }

  // ── Verify HMAC signature ──────────────────────────────────────────────────
  const expectedSig = crypto
    .createHmac("sha256", INSTAGRAM_APP_SECRET)
    .update(payload)
    .digest("hex");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(sig, "hex"),
      Buffer.from(expectedSig, "hex")
    )
  ) {
    console.error("Instagram save: invalid HMAC signature");
    return errorRedirect("invalid_signature");
  }

  // ── Decode payload ─────────────────────────────────────────────────────────
  let data: {
    user_id: string;
    ig_user_id: string;
    username: string;
    name: string;
    profile_picture_url: string;
    access_token: string;
    expires_at: string;
  };

  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch (e) {
    console.error("Instagram save: failed to decode payload", e);
    return errorRedirect("invalid_payload");
  }

  if (!data.user_id || !data.access_token) {
    return errorRedirect("incomplete_payload");
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

  try {
    // 1. Update user_metadata
    const userRes = await adminSupabase.auth.admin.getUserById(data.user_id);
    if (userRes.error) {
      console.error("Instagram save: getUserById failed:", userRes.error);
      return errorRedirect("user_not_found");
    }

    const currentMeta = userRes.data.user?.user_metadata || {};
    const updateRes = await adminSupabase.auth.admin.updateUserById(
      data.user_id,
      {
        user_metadata: {
          ...currentMeta,
          ig_connection: igConnection,
        },
      }
    );

    if (updateRes.error) {
      console.error(
        "Instagram save: updateUserById failed:",
        updateRes.error
      );
      return errorRedirect("metadata_update_failed");
    }

    console.log(
      `Instagram save: user_metadata updated for user ${data.user_id}`
    );

    // 2. Upsert to integrations table
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

    if (upsertRes.error) {
      console.error(
        "Instagram save: integrations upsert failed (non-fatal):",
        upsertRes.error
      );
    } else {
      console.log(
        `Instagram save: integrations table updated for user ${data.user_id}`
      );
    }

    return NextResponse.redirect(
      `${APP_URL}/dashboard?tab=integrations&ig_connected=success`
    );
  } catch (err: any) {
    console.error("Instagram save: unexpected error:", err);
    return errorRedirect(err.message || "save_failed");
  }
}
