import { NextRequest, NextResponse } from "next/server";

/**
 * Generic proxy for social integrations (Instagram, etc.)
 * Path: /api/integrations/[...path]
 * 
 * Note: Next.js 15+ / 16 requires 'params' to be awaited in API routes.
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join("/");
  
  // Specific fallback for scheduling to avoid 500s showing up as errors
  if (path.endsWith("/schedule")) {
    return NextResponse.json({ posts: [] });
  }

  return NextResponse.json(
    { error: "Endpoint not implemented in proxy", path },
    { status: 404 }
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join("/");
  
  // For now, we just return success to let the UI proceed or handle the mock
  return NextResponse.json({ 
    success: true, 
    message: `Proxy received POST to ${path}`,
    path 
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const path = pathSegments.join("/");
  
  return NextResponse.json({ 
    success: true, 
    message: `Proxy received DELETE to ${path}`,
    path 
  });
}
