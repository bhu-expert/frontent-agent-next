import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/integrations/instagram/debug-save
 *
 * Diagnostic endpoint — tests every step of the Instagram save flow.
 * Returns JSON with detailed results for each operation.
 *
 * DELETE THIS ROUTE AFTER DEBUGGING.
 */

export async function GET(request: NextRequest) {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    steps: {} as Record<string, unknown>,
  };

  // ── Step 1: Check env vars ────────────────────────────────────────────────
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

  (results.steps as Record<string, unknown>)["1_env_vars"] = {
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL ? `${SUPABASE_URL.slice(0, 30)}...` : "MISSING",
    SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY
      ? `${SUPABASE_SERVICE_ROLE_KEY.slice(0, 10)}...${SUPABASE_SERVICE_ROLE_KEY.slice(-5)} (len=${SUPABASE_SERVICE_ROLE_KEY.length})`
      : "MISSING",
    INSTAGRAM_APP_SECRET: INSTAGRAM_APP_SECRET
      ? `${INSTAGRAM_APP_SECRET.slice(0, 6)}...(len=${INSTAGRAM_APP_SECRET.length})`
      : "MISSING",
    NEXT_PUBLIC_APP_URL: APP_URL || "MISSING (will default to localhost:3000)",
  };

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    (results.steps as Record<string, unknown>)["FATAL"] = "Missing SUPABASE_URL or SERVICE_ROLE_KEY";
    return NextResponse.json(results, { status: 500 });
  }

  // ── Step 2: Create admin client ───────────────────────────────────────────
  let adminSupabase: ReturnType<typeof createClient>;
  try {
    adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    (results.steps as Record<string, unknown>)["2_admin_client"] = "OK — created";
  } catch (e: any) {
    (results.steps as Record<string, unknown>)["2_admin_client"] = `FAILED: ${e.message}`;
    return NextResponse.json(results, { status: 500 });
  }

  // ── Step 3: List users (test admin access) ────────────────────────────────
  try {
    const listRes = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    (results.steps as Record<string, unknown>)["3_admin_listUsers"] = {
      success: !listRes.error,
      error: listRes.error?.message || null,
      userCount: listRes.data?.users?.length ?? 0,
      firstUserId: listRes.data?.users?.[0]?.id?.slice(0, 8) + "..." || null,
    };
  } catch (e: any) {
    (results.steps as Record<string, unknown>)["3_admin_listUsers"] = `EXCEPTION: ${e.message}`;
  }

  // ── Step 4: Get specific user ─────────────────────────────────────────────
  const TEST_USER_ID = "cbce4526-32e1-490a-96de-a299a68827c3";
  try {
    const userRes = await adminSupabase.auth.admin.getUserById(TEST_USER_ID);
    (results.steps as Record<string, unknown>)["4_getUserById"] = {
      success: !userRes.error,
      error: userRes.error?.message || null,
      userId: userRes.data?.user?.id || null,
      email: userRes.data?.user?.email || null,
      has_ig_connection: !!userRes.data?.user?.user_metadata?.ig_connection,
      metadata_keys: Object.keys(userRes.data?.user?.user_metadata || {}),
    };
  } catch (e: any) {
    (results.steps as Record<string, unknown>)["4_getUserById"] = `EXCEPTION: ${e.message}`;
  }

  // ── Step 5: Test updateUserById with dummy data ───────────────────────────
  try {
    const userRes = await adminSupabase.auth.admin.getUserById(TEST_USER_ID);
    const currentMeta = userRes.data?.user?.user_metadata || {};

    const updateRes = await adminSupabase.auth.admin.updateUserById(TEST_USER_ID, {
      user_metadata: {
        ...currentMeta,
        _debug_test: new Date().toISOString(),
      },
    });

    (results.steps as Record<string, unknown>)["5_updateUserById"] = {
      success: !updateRes.error,
      error: updateRes.error?.message || null,
      updatedMetaKeys: Object.keys(updateRes.data?.user?.user_metadata || {}),
      has_debug_test: !!updateRes.data?.user?.user_metadata?._debug_test,
    };

    // Clean up: remove debug test key
    if (!updateRes.error) {
      const cleanMeta = { ...updateRes.data.user.user_metadata };
      delete cleanMeta._debug_test;
      await adminSupabase.auth.admin.updateUserById(TEST_USER_ID, {
        user_metadata: cleanMeta,
      });
    }
  } catch (e: any) {
    (results.steps as Record<string, unknown>)["5_updateUserById"] = `EXCEPTION: ${e.message}`;
  }

  // ── Step 6: Test integrations table read ──────────────────────────────────
  try {
    const readRes = await adminSupabase
      .from("integrations")
      .select("*")
      .eq("provider", "instagram")
      .maybeSingle();

    (results.steps as Record<string, unknown>)["6_integrations_read"] = {
      success: !readRes.error,
      error: readRes.error?.message || null,
      hasData: !!readRes.data,
      data: readRes.data
        ? {
            user_id: (readRes.data as any).user_id,
            provider: (readRes.data as any).provider,
            status: (readRes.data as any).status,
            has_connected_account: !!(readRes.data as any).connected_account,
          }
        : null,
    };
  } catch (e: any) {
    (results.steps as Record<string, unknown>)["6_integrations_read"] = `EXCEPTION: ${e.message}`;
  }

  // ── Step 7: Test integrations table upsert ────────────────────────────────
  try {
    const upsertRes = await adminSupabase.from("integrations").upsert(
      {
        user_id: TEST_USER_ID,
        provider: "instagram",
        provider_account_id: "debug_test",
        connected_account: { debug: true, timestamp: new Date().toISOString() },
        status: "debug_test",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" }
    );

    (results.steps as Record<string, unknown>)["7_integrations_upsert"] = {
      success: !upsertRes.error,
      error: upsertRes.error?.message || null,
      status: upsertRes.status,
      statusText: upsertRes.statusText,
    };

    // Clean up: delete debug row
    if (!upsertRes.error) {
      await adminSupabase
        .from("integrations")
        .delete()
        .eq("user_id", TEST_USER_ID)
        .eq("provider", "instagram")
        .eq("status", "debug_test");
    }
  } catch (e: any) {
    (results.steps as Record<string, unknown>)["7_integrations_upsert"] = `EXCEPTION: ${e.message}`;
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const steps = results.steps as Record<string, any>;
  results.summary = {
    env_ok: !String(steps["1_env_vars"]?.SUPABASE_SERVICE_ROLE_KEY).includes("MISSING"),
    admin_access: steps["3_admin_listUsers"]?.success === true,
    get_user: steps["4_getUserById"]?.success === true,
    update_user: steps["5_updateUserById"]?.success === true,
    read_integrations: steps["6_integrations_read"]?.success === true,
    write_integrations: steps["7_integrations_upsert"]?.success === true,
  };

  return NextResponse.json(results, { status: 200 });
}
