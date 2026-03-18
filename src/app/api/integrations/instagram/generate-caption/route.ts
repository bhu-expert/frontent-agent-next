import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1/data"
).replace(/\/api\/v1\/data.*$/, "");

/**
 * Extract Supabase access token from cookies or Authorization header.
 */
function getAccessToken(request: NextRequest): string | null {
  // 1. Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // 2. Check Supabase auth cookies (sb-<ref>-auth-token)
  const cookies = request.cookies.getAll();
  const authCookie = cookies.find((c) => c.name.match(/^sb-.*-auth-token/));
  if (authCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(authCookie.value));
      if (typeof parsed === "string") return parsed;
      if (parsed?.access_token) return parsed.access_token;
      // base64 chunked cookies: [access_token, refresh_token]
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
      // Cookie may be a plain token string
      return authCookie.value;
    }
  }

  // 3. Check chunked cookies (sb-<ref>-auth-token.0, .1, etc.)
  const chunks = cookies
    .filter((c) => c.name.match(/^sb-.*-auth-token\.\d+$/))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((c) => c.value);
  if (chunks.length > 0) {
    try {
      const joined = chunks.join("");
      const parsed = JSON.parse(decodeURIComponent(joined));
      if (typeof parsed === "string") return parsed;
      if (parsed?.access_token) return parsed.access_token;
      if (Array.isArray(parsed) && parsed[0]) return parsed[0];
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * POST /api/integrations/instagram/generate-caption
 *
 * Proxies to the backend caption generation agent with auth forwarding.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = getAccessToken(request);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(
      `${BACKEND_BASE_URL}/api/v1/agent/generate-caption`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || "Caption generation failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Caption generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
