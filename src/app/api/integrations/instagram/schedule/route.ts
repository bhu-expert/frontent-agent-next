import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ── Auth helpers ─────────────────────────────────────────────────────────────

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

async function getIgCredentials(userId: string) {
  const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Primary: integrations table
  const { data: integration } = await adminSupabase
    .from("integrations")
    .select("connected_account")
    .eq("user_id", userId)
    .eq("provider", "instagram")
    .eq("status", "active")
    .maybeSingle();

  if (integration?.connected_account) {
    const account = integration.connected_account as Record<string, unknown>;
    if (account.access_token) {
      return {
        ig_user_id: account.ig_user_id as string,
        access_token: account.access_token as string,
      };
    }
  }

  // Fallback: user_metadata
  const { data: { user } } = await adminSupabase.auth.admin.getUserById(userId);
  const igConn = (user as unknown as Record<string, unknown>)?.user_metadata as Record<string, unknown> | undefined;
  const igConnection = igConn?.ig_connection as Record<string, unknown> | undefined;
  if (igConnection?.access_token) {
    return {
      ig_user_id: igConnection.ig_user_id as string,
      access_token: igConnection.access_token as string,
    };
  }

  return null;
}

// ── Route handlers ───────────────────────────────────────────────────────────

/**
 * POST /api/integrations/instagram/schedule
 *
 * Stores a post for scheduled publishing. The backend APScheduler
 * will pick it up and call the Instagram API at the scheduled time.
 *
 * Body:
 *   media_type:    IMAGE | VIDEO | REELS | STORIES | CAROUSEL
 *   media_url:     string (single post)
 *   carousel_urls: string[] (carousel only)
 *   caption:       string
 *   scheduled_at:  ISO 8601 datetime string (must be in the future)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const igCreds = await getIgCredentials(user.id);
    if (!igCreds) {
      return NextResponse.json({ error: "Instagram not connected" }, { status: 400 });
    }

    const { media_type, media_url, carousel_urls, caption, scheduled_at } =
      await request.json();

    if (!media_type || !scheduled_at) {
      return NextResponse.json(
        { error: "media_type and scheduled_at are required" },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(scheduled_at);
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: "scheduled_at must be in the future" },
        { status: 400 }
      );
    }

    if (media_type === "CAROUSEL" && !carousel_urls?.length) {
      return NextResponse.json(
        { error: "carousel_urls required for CAROUSEL" },
        { status: 400 }
      );
    }

    if (media_type !== "CAROUSEL" && !media_url) {
      return NextResponse.json(
        { error: "media_url is required" },
        { status: 400 }
      );
    }

    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error: insertError } = await adminSupabase
      .from("scheduled_instagram_posts")
      .insert({
        user_id: user.id,
        ig_user_id: igCreds.ig_user_id,
        access_token: igCreds.access_token,
        media_type,
        media_url: media_url || null,
        carousel_urls: carousel_urls || null,
        caption: caption || null,
        scheduled_at: scheduledDate.toISOString(),
        status: "scheduled",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Schedule insert error:", insertError);
      throw new Error(insertError.message);
    }

    return NextResponse.json({ success: true, id: data.id, scheduled_at: data.scheduled_at });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Schedule failed";
    console.error("Instagram schedule error:", err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/instagram/schedule
 * Returns all scheduled posts for the current user.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error: fetchError } = await adminSupabase
      .from("scheduled_instagram_posts")
      .select(
        "id, media_type, media_url, carousel_urls, caption, scheduled_at, status, ig_post_id, error_message, created_at"
      )
      .eq("user_id", user.id)
      .order("scheduled_at", { ascending: true });

    if (fetchError) throw new Error(fetchError.message);

    return NextResponse.json({ posts: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Fetch failed";
    console.error("Instagram scheduled list error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/integrations/instagram/schedule?id=<uuid>
 * Cancels a scheduled post (only if still in 'scheduled' status).
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { error: deleteError } = await adminSupabase
      .from("scheduled_instagram_posts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status", "scheduled"); // Prevent cancelling already-published posts

    if (deleteError) throw new Error(deleteError.message);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cancel failed";
    console.error("Instagram cancel schedule error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
