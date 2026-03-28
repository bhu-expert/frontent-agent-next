import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getAuthUser(request: NextRequest) {
  const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Try Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await adminSupabase.auth.getUser(token);
    if (user) return user;
  }

  // Try cookies
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").filter(Boolean).map(c => {
      const [k, ...v] = c.split("=");
      return [k, v.join("=")];
    })
  );

  // Find Supabase auth token cookie
  const tokenCookieNames = Object.keys(cookies).filter(
    k => k.includes("auth-token") || k.startsWith("sb-")
  );

  for (const name of tokenCookieNames) {
    try {
      let value = decodeURIComponent(cookies[name]);
      if (value.startsWith("base64-")) {
        value = Buffer.from(value.slice(7), "base64").toString("utf-8");
      }
      const parsed = JSON.parse(value);
      const token = parsed.access_token || parsed[0]?.access_token;
      if (token) {
        const { data: { user } } = await adminSupabase.auth.getUser(token);
        if (user) return user;
      }
    } catch {
      // skip unparseable cookies
    }
  }

  return null;
}

/**
 * POST /api/integrations/instagram/disconnect
 * Removes the Instagram connection from the current user.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const userRes = await adminSupabase.auth.admin.getUserById(user.id);

    const meta = { ...(userRes.data.user?.user_metadata || {}) };
    delete meta.ig_connection;

    await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: meta,
    });

    try {
      await adminSupabase
        .from("integrations")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", "instagram");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Instagram disconnect error:", err);
    return NextResponse.json({ error: err.message || "Disconnect failed" }, { status: 500 });
  }
}
