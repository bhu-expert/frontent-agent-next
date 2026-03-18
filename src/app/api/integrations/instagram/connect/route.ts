import { NextRequest, NextResponse } from "next/server";

// Backend base URL — the FastAPI server that owns the registered redirect URI
// Derived from NEXT_PUBLIC_API_URL by stripping the path suffix
const BACKEND_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1/data")
    .replace(/\/api\/v1\/data.*$/, "");

/**
 * GET /api/integrations/instagram/connect?user_id=<uuid>
 *
 * Receives user_id from the client (already authenticated) and forwards
 * the browser to the FastAPI backend which builds the signed OAuth URL.
 *
 * The registered Meta redirect URI points to the backend:
 *   https://content.bhuexpert.com/api/integrations/instagram/callback
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("user_id");

  if (!userId) {
    return NextResponse.redirect(
      new URL("/login?next=/dashboard?tab=integrations", request.url)
    );
  }

  const backendUrl = `${BACKEND_BASE_URL}/api/integrations/instagram/connect?user_id=${encodeURIComponent(userId)}`;
  return NextResponse.redirect(backendUrl);
}
