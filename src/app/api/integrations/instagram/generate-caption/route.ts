import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1/data"
).replace(/\/api\/v1\/data.*$/, "");

/**
 * POST /api/integrations/instagram/generate-caption
 *
 * Proxies to the backend caption generation agent.
 *
 * Body: { image_url: string, brand_name?: string, tone?: string }
 * Returns: { caption: string, hashtags: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/agent/generate-caption`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || "Caption generation failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Caption generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
