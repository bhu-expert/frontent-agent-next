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

// ── Type definitions ──────────────────────────────────────────────────────────

interface ConfirmedSlot {
  slot_index: number;
  day_offset: number;
  day_label: string;
  scheduled_at: string;
  post_format: string;
  media_type: string;
  ad_type: string;
  asset_url: string;
  slide_asset_urls?: string[];  // all slide URLs for carousel posts
  caption?: string;
}

// ── Route handlers ────────────────────────────────────────────────────────────

/**
 * POST /api/batches
 *
 * Creates a batch and all its scheduled posts directly in Supabase.
 *
 * Body:
 *   brand_id:           string
 *   batch_name:         string
 *   cadence:            "weekly" | "biweekly"
 *   starts_at:          ISO datetime string
 *   ends_at:            ISO datetime string
 *   confirmed_slots:    ConfirmedSlot[]
 *   composition_config: Record<string, unknown>
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

    const {
      brand_id,
      batch_name,
      cadence,
      starts_at,
      ends_at,
      confirmed_slots,
      composition_config,
    } = await request.json();

    if (!batch_name || !cadence || !starts_at || !ends_at || !confirmed_slots?.length) {
      return NextResponse.json(
        { error: "batch_name, cadence, starts_at, ends_at, and confirmed_slots are required" },
        { status: 400 }
      );
    }

    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Insert the batch record
    const { data: batchData, error: batchInsertError } = await adminSupabase
      .from("scheduled_batch")
      .insert({
        user_id: user.id,
        brand_id: brand_id || null,
        name: batch_name,
        status: "active",
        cadence,
        starts_at,
        ends_at,
        composition_config: composition_config || null,
        timing_strategy: "heuristic_cold_start",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (batchInsertError) {
      console.error("Batch insert error:", batchInsertError);
      throw new Error(batchInsertError.message);
    }

    const batchId = batchData.id;

    // Build all post rows for bulk insert
    const postRows = (confirmed_slots as ConfirmedSlot[]).map((slot) => ({
      user_id: user.id,
      ig_user_id: igCreds.ig_user_id,
      access_token: igCreds.access_token,
      batch_id: batchId,
      slot_index: slot.slot_index,
      media_type: slot.media_type,
      media_url: slot.media_type !== "CAROUSEL" ? slot.asset_url : null,
      carousel_urls: slot.media_type === "CAROUSEL"
        ? (slot.slide_asset_urls?.length ? slot.slide_asset_urls : [slot.asset_url])
        : null,
      caption: slot.caption || null,
      scheduled_at: slot.scheduled_at,
      status: "scheduled",
    }));

    const { error: postsInsertError } = await adminSupabase
      .from("scheduled_instagram_posts")
      .insert(postRows);

    if (postsInsertError) {
      // Attempt to clean up the orphaned batch record
      await adminSupabase.from("scheduled_batch").delete().eq("id", batchId);
      console.error("Batch posts insert error:", postsInsertError);
      throw new Error(postsInsertError.message);
    }

    return NextResponse.json({
      success: true,
      batch_id: batchId,
      post_count: postRows.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Batch creation failed";
    console.error("Batch create error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/batches
 *
 * Returns all batches for the authenticated user, ordered by starts_at descending.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const adminSupabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error: fetchError } = await adminSupabase
      .from("scheduled_batch")
      .select(
        "id, name, status, cadence, starts_at, ends_at, composition_config, timing_strategy, created_at, brand_id"
      )
      .eq("user_id", user.id)
      .order("starts_at", { ascending: false });

    if (fetchError) throw new Error(fetchError.message);

    return NextResponse.json({ batches: data || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Fetch batches failed";
    console.error("Batch list error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
