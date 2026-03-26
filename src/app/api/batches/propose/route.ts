import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ── Auth helpers ─────────────────────────────────────────────────────────────

async function getAuthUser(request: NextRequest) {
  const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Try Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await adminSupabase.auth.getUser(token);
    if (user) return { user, token };
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
        if (user) return { user, token };
      }
    } catch {
      // skip unparseable cookies
    }
  }

  return null;
}

// ── Route handler ─────────────────────────────────────────────────────────────

/**
 * POST /api/batches/propose
 *
 * Proxies the batch proposal request to the FastAPI agent endpoint.
 * The AI analyses the brand's asset inventory and proposes a posting schedule.
 *
 * Body (forwarded verbatim to FastAPI):
 *   brand_id:        string
 *   cadence:         "weekly" | "biweekly"
 *   start_date:      ISO date string (YYYY-MM-DD)
 *   post_count:      number (3-14)
 *   available_assets: AssetInventoryItem[]
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser(request);
    if (!authResult) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { token } = authResult;

    const body = await request.json();

    const fastapiResponse = await fetch(`${API_BASE_URL}/agent/batch/propose`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const responseData = await fastapiResponse.json();

    if (!fastapiResponse.ok) {
      return NextResponse.json(
        { error: responseData.detail || responseData.error || "Proposal failed" },
        { status: fastapiResponse.status }
      );
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Batch propose failed";
    console.error("Batch propose error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
