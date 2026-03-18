/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/integrations/instagram/debug-save
 * Diagnostic endpoint — tests every step of the Instagram save flow.
 * DELETE THIS ROUTE AFTER DEBUGGING.
 */
export async function GET() {
  const log: Record<string, any> = { ts: new Date().toISOString() };

  // 1. Env vars
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const secret = process.env.INSTAGRAM_APP_SECRET || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  log["1_env"] = {
    SUPABASE_URL: url ? url.slice(0, 30) + "..." : "MISSING",
    SERVICE_ROLE_KEY: key ? `${key.slice(0, 10)}...(len=${key.length})` : "MISSING",
    IG_APP_SECRET: secret ? `${secret.slice(0, 6)}...(len=${secret.length})` : "MISSING",
    APP_URL: appUrl || "MISSING",
  };

  if (!url || !key) {
    log["FATAL"] = "Missing SUPABASE_URL or SERVICE_ROLE_KEY";
    return NextResponse.json(log, { status: 500 });
  }

  const sb = createClient(url, key);
  const uid = "cbce4526-32e1-490a-96de-a299a68827c3";

  // 2. Admin listUsers
  try {
    const r = await sb.auth.admin.listUsers({ page: 1, perPage: 1 });
    log["2_listUsers"] = { ok: !r.error, err: r.error?.message ?? null, count: r.data?.users?.length ?? 0 };
  } catch (e: any) {
    log["2_listUsers"] = { ok: false, exception: e.message };
  }

  // 3. getUserById
  try {
    const r = await sb.auth.admin.getUserById(uid);
    log["3_getUser"] = {
      ok: !r.error,
      err: r.error?.message ?? null,
      id: (r.data as any)?.user?.id ?? null,
      metaKeys: Object.keys((r.data as any)?.user?.user_metadata ?? {}),
      has_ig: !!(r.data as any)?.user?.user_metadata?.ig_connection,
    };
  } catch (e: any) {
    log["3_getUser"] = { ok: false, exception: e.message };
  }

  // 4. updateUserById (write test)
  try {
    const g = await sb.auth.admin.getUserById(uid);
    const meta = (g.data as any)?.user?.user_metadata ?? {};
    const r = await sb.auth.admin.updateUserById(uid, {
      user_metadata: { ...meta, _dbg: Date.now() },
    });
    log["4_updateUser"] = {
      ok: !r.error,
      err: r.error?.message ?? null,
      has_dbg: !!(r.data as any)?.user?.user_metadata?._dbg,
    };
    // cleanup
    if (!r.error) {
      const clean = { ...(r.data as any).user.user_metadata };
      delete clean._dbg;
      await sb.auth.admin.updateUserById(uid, { user_metadata: clean });
    }
  } catch (e: any) {
    log["4_updateUser"] = { ok: false, exception: e.message };
  }

  // 5. Read integrations table
  try {
    const r = await sb.from("integrations").select("*").eq("provider", "instagram").maybeSingle();
    log["5_readTable"] = {
      ok: !r.error,
      err: r.error?.message ?? null,
      hasRow: !!r.data,
      status: (r.data as any)?.status ?? null,
    };
  } catch (e: any) {
    log["5_readTable"] = { ok: false, exception: e.message };
  }

  // 6. Upsert integrations table
  try {
    const r = await sb.from("integrations").upsert(
      {
        user_id: uid,
        provider: "instagram",
        provider_account_id: "dbg",
        connected_account: { debug: true },
        status: "debug_test",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider" }
    );
    log["6_upsertTable"] = { ok: !r.error, err: r.error?.message ?? null, http: r.status };
    // cleanup
    if (!r.error) {
      await sb.from("integrations").delete().eq("user_id", uid).eq("status", "debug_test");
    }
  } catch (e: any) {
    log["6_upsertTable"] = { ok: false, exception: e.message };
  }

  // Summary
  log["summary"] = {
    env_ok: !!url && !!key && !!secret,
    admin_works: log["2_listUsers"]?.ok === true,
    can_read_user: log["3_getUser"]?.ok === true,
    can_write_user: log["4_updateUser"]?.ok === true,
    can_read_table: log["5_readTable"]?.ok === true,
    can_write_table: log["6_upsertTable"]?.ok === true,
  };

  return NextResponse.json(log);
}
