import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase";
import { SUPABASE_PROJECT_URL } from "@/config";

const SUPABASE_URL = SUPABASE_PROJECT_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const IG_GRAPH_BASE = "https://graph.instagram.com";
const API_VERSION = "v21.0";

type MediaType = "IMAGE" | "VIDEO" | "REELS" | "STORIES" | "CAROUSEL";

// ── Auth helpers ─────────────────────────────────────────────────────────────

async function getAuthUser(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie");
  const supabase = createServerClient(cookieHeader);

  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Session error:", error);
    return null;
  }
  
  if (!session) {
    console.warn("No session found. Cookies:", cookieHeader);
    return null;
  }
  
  return session.user;
}

async function getIgCredentials(userId: string) {
  console.log("Looking up Instagram credentials for user:", userId);
  const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Primary: integrations table
  const { data: integration, error: integrationError } = await adminSupabase
    .from("integrations")
    .select("connected_account")
    .eq("user_id", userId)
    .eq("provider", "instagram")
    .eq("status", "active")
    .maybeSingle();

  if (integrationError) {
    console.error("Error fetching integration:", integrationError);
  }

  console.log("Integration lookup result:", integration ? "Found" : "Not found");

  if (integration?.connected_account) {
    const account = integration.connected_account as Record<string, unknown>;
    if (account.access_token) {
      console.log("Found Instagram access token for user:", userId);
      return {
        ig_user_id: account.ig_user_id as string,
        access_token: account.access_token as string,
      };
    }
  }

  // Fallback: user_metadata
  const { data: { user }, error: userError } = await adminSupabase.auth.admin.getUserById(userId);
  if (userError) {
    console.error("Error fetching user:", userError);
  }
  
  const igConn = (user as unknown as Record<string, unknown>)?.user_metadata as Record<string, unknown> | undefined;
  const igConnection = igConn?.ig_connection as Record<string, unknown> | undefined;
  if (igConnection?.access_token) {
    console.log("Found Instagram token in user_metadata");
    return {
      ig_user_id: igConnection.ig_user_id as string,
      access_token: igConnection.access_token as string,
    };
  }

  console.warn("No Instagram credentials found for user:", userId);
  return null;
}

// ── Route handler ────────────────────────────────────────────────────────────

/**
 * POST /api/integrations/instagram/publish
 *
 * Immediately publishes content to Instagram.
 *
 * Body:
 *   media_type: IMAGE | VIDEO | REELS | STORIES | CAROUSEL
 *   media_url:  publicly accessible URL (required for single posts)
 *   carousel_urls: string[] (required for CAROUSEL, max 10)
 *   caption:    string (not supported for STORIES)
 *
 * Flow: Create container -> poll until FINISHED -> media_publish
 */
export async function POST(request: NextRequest) {
  try {
    console.log("Instagram publish request received");
    const user = await getAuthUser(request);
    if (!user) {
      console.error("User not authenticated");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.log("Authenticated user:", user.id, user.email);

    const igCreds = await getIgCredentials(user.id);
    if (!igCreds) {
      console.error("Instagram not connected for user:", user.id);
      return NextResponse.json({ error: "Instagram not connected" }, { status: 400 });
    }
    console.log("Instagram credentials found for user:", user.id);

    const { media_type, media_url, carousel_urls, caption } =
      (await request.json()) as {
        media_type: MediaType;
        media_url?: string;
        carousel_urls?: string[];
        caption?: string;
      };

    if (!media_type) {
      return NextResponse.json({ error: "media_type is required" }, { status: 400 });
    }

    const { ig_user_id, access_token } = igCreds;
    const base = `${IG_GRAPH_BASE}/${API_VERSION}/${ig_user_id}`;

    let containerId: string;

    if (media_type === "CAROUSEL") {
      if (!carousel_urls?.length) {
        return NextResponse.json({ error: "carousel_urls required for CAROUSEL" }, { status: 400 });
      }
      containerId = await createCarouselContainer(
        base, access_token, carousel_urls, caption
      );
    } else {
      if (!media_url) {
        return NextResponse.json({ error: "media_url is required" }, { status: 400 });
      }
      containerId = await createSingleContainer(
        base, access_token, media_type, media_url, caption
      );
    }

    // Poll container status until FINISHED (max 30 attempts x 2 s = 60 s)
    await pollContainerStatus(containerId, access_token);

    // Publish
    const publishRes = await fetch(`${base}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: containerId, access_token }),
    });
    const publishData = await publishRes.json();

    if (!publishRes.ok || publishData.error) {
      throw new Error(publishData.error?.message || "Publish failed");
    }

    const igPostId = publishData.id as string;

    // Store record using service role client
    try {
      const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await adminSupabase.from("published_posts").insert({
        user_id: user.id,
        platform: "instagram",
        platform_post_id: igPostId,
        post_url: `https://www.instagram.com/p/${igPostId}/`,
        content: caption,
        media_url: media_url || carousel_urls?.[0],
        status: "published",
        published_at: new Date().toISOString(),
      });
    } catch {
      // non-critical: don't fail the publish if record storage fails
    }

    return NextResponse.json({
      success: true,
      id: igPostId,
      post_url: `https://www.instagram.com/p/${igPostId}/`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Publish failed";
    console.error("Instagram publish error:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function createSingleContainer(
  base: string,
  accessToken: string,
  mediaType: MediaType,
  mediaUrl: string,
  caption?: string
): Promise<string> {
  const body: Record<string, string> = {
    access_token: accessToken,
    media_type: mediaType,
  };

  if (mediaType === "IMAGE") {
    body.image_url = mediaUrl;
  } else {
    // VIDEO, REELS, STORIES (video)
    body.video_url = mediaUrl;
  }

  if (caption && mediaType !== "STORIES") {
    body.caption = caption;
  }

  const res = await fetch(`${base}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "Container creation failed");
  }
  return data.id as string;
}

async function createCarouselContainer(
  base: string,
  accessToken: string,
  mediaUrls: string[],
  caption?: string
): Promise<string> {
  // Step 1: Create a container for each carousel item
  const itemIds: string[] = [];

  for (const url of mediaUrls.slice(0, 10)) {
    const isVideo = /\.(mp4|mov|avi)$/i.test(url);
    const body: Record<string, string> = {
      access_token: accessToken,
      is_carousel_item: "true",
    };
    if (isVideo) {
      body.media_type = "VIDEO";
      body.video_url = url;
    } else {
      body.image_url = url;
    }

    const res = await fetch(`${base}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error?.message || "Carousel item creation failed");
    }
    itemIds.push(data.id as string);
  }

  // Step 2: Create the carousel container
  const carouselBody: Record<string, string> = {
    access_token: accessToken,
    media_type: "CAROUSEL",
    children: itemIds.join(","),
  };
  if (caption) carouselBody.caption = caption;

  const res = await fetch(`${base}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(carouselBody),
  });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || "Carousel container creation failed");
  }
  return data.id as string;
}

async function pollContainerStatus(
  containerId: string,
  accessToken: string,
  maxAttempts = 30
): Promise<void> {
  const base = `${IG_GRAPH_BASE}/${containerId}`;

  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${base}?fields=status_code,status&access_token=${accessToken}`
    );
    const data = await res.json();
    const statusCode = data.status_code as string;

    if (statusCode === "FINISHED") return;
    if (statusCode === "ERROR" || statusCode === "EXPIRED") {
      throw new Error(`Container status: ${statusCode} — ${data.status || ""}`);
    }

    // IN_PROGRESS: wait 2 s and retry
    await new Promise((r) => setTimeout(r, 2000));
  }

  throw new Error("Container did not become FINISHED within timeout");
}
