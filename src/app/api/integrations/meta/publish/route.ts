import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const META_GRAPH_API_VERSION = "v18.0";

/**
 * POST /api/integrations/meta/publish
 * 
 * Publishes content to Facebook Page or Instagram using stored access token.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = session.user;
    const body = await request.json();
    const { page_id, access_token, message, media_url, media_type, post_type = "facebook" } = body;

    if (!page_id || !access_token) {
      return NextResponse.json(
        { error: "Page ID and access token are required" },
        { status: 400 }
      );
    }

    let result;

    if (post_type === "instagram") {
      // Instagram Publishing
      const instagramContainerId = await createInstagramContainer(
        media_url,
        media_type,
        message,
        access_token,
        page_id
      );

      // Publish the container
      const publishResponse = await fetch(
        `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${instagramContainerId}/media?publish=true&access_token=${access_token}`
      );
      const publishData = await publishResponse.json();

      result = {
        id: publishData.id,
        post_url: `https://www.instagram.com/p/${publishData.id}`,
      };
    } else {
      // Facebook Page Publishing
      const feedEndpoint = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${page_id}/feed`;
      
      const publishData: any = {
        message: message || "",
        access_token: access_token,
      };

      // Add media if provided
      if (media_url) {
        if (media_type === "photo") {
          publishData.url = media_url;
          publishData.message = message || "";
        } else if (media_type === "video") {
          // For video, we'd need to upload first - simplified for now
          publishData.file_url = media_url;
          publishData.description = message || "";
        }
      }

      const publishResponse = await fetch(feedEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(publishData),
      });

      const resultData = await publishResponse.json();

      if (!publishResponse.ok) {
        console.error("Facebook publish error:", resultData);
        return NextResponse.json(
          { error: resultData.error?.message || "Failed to publish to Facebook" },
          { status: 500 }
        );
      }

      result = {
        id: resultData.id,
        post_url: `https://www.facebook.com/${resultData.id}`,
      };
    }

    // Store published post in database
    try {
      await supabase.from("published_posts").insert({
        user_id: user.id,
        platform: post_type,
        platform_post_id: result.id,
        post_url: result.post_url,
        content: message,
        media_url: media_url,
        status: "published",
        published_at: new Date().toISOString(),
      });
    } catch (e) {
      console.log("Could not store published post:", e);
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error publishing content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to publish content" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to create Instagram media container
 */
async function createInstagramContainer(
  media_url: string,
  media_type: string,
  caption: string,
  access_token: string,
  page_id: string
): Promise<string> {
  const containerEndpoint = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${page_id}/media`;
  
  const containerData: any = {
    image_url: media_type === "photo" ? media_url : undefined,
    video_url: media_type === "video" ? media_url : undefined,
    caption: caption || "",
    access_token: access_token,
  };

  // For carousel, we'd need to handle children array
  if (media_type === "carousel") {
    // Simplified - in production, handle multiple media items
    containerData.media_type = "CAROUSEL";
  }

  const response = await fetch(containerEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(containerData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to create Instagram container");
  }

  return data.id;
}
