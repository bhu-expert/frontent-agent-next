import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";

const BASE_URL = API_BASE_URL.replace(/\/$/, "");

// ─── Types ────────────────────────────────────────────────────────────────────

export type MediaType = "IMAGE" | "VIDEO" | "REELS" | "STORIES" | "CAROUSEL";

export interface IgConnection {
  connected: boolean;
  username?: string;
  name?: string;
  ig_user_id?: string;
  profile_picture_url?: string;
  expires_at?: string;
  connected_at?: string;
}

export interface ScheduledPost {
  id: string;
  media_type: MediaType;
  media_url?: string;
  carousel_urls?: string[];
  caption?: string;
  scheduled_at: string;
  status: "scheduled" | "published" | "failed";
  ig_post_id?: string;
  error_message?: string;
}

export interface SchedulePostPayload {
  media_type: MediaType;
  media_url?: string;
  carousel_urls?: string[];
  caption?: string;
  scheduled_at?: string;
}

export interface ScheduledPostsResponse {
  posts: ScheduledPost[];
}

export interface PublishResponse {
  post_url: string;
  ig_post_id: string;
}

// ─── Instagram endpoints ──────────────────────────────────────────────────────

/**
 * Gets the Instagram connection URL for OAuth flow
 */
export function getInstagramConnectUrl(userId: string): string {
  return `${BASE_URL}${API_ENDPOINTS.INSTAGRAM_CONNECT}?user_id=${encodeURIComponent(userId)}`;
}

/**
 * Fetches the current Instagram connection status
 * Uses Supabase user metadata - no auth token needed as it reads from current session
 */
export async function getInstagramConnection(): Promise<IgConnection> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.INSTAGRAM_STATUS}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    return { connected: false };
  }

  return res.json();
}

/**
 * Disconnects Instagram from the current user
 */
export async function disconnectInstagram(token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.INSTAGRAM_DISCONNECT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Disconnect failed");
  }
}

/**
 * Fetches scheduled Instagram posts for the current user
 */
export async function getScheduledInstagramPosts(token: string): Promise<ScheduledPost[]> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.INSTAGRAM_SCHEDULE}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to fetch scheduled posts");
  }

  const data = await res.json();
  return data.posts || [];
}

/**
 * Schedules a new Instagram post
 */
export async function scheduleInstagramPost(
  payload: SchedulePostPayload,
  token: string
): Promise<ScheduledPost> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.INSTAGRAM_SCHEDULE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to schedule post");
  }

  return res.json();
}

/**
 * Publishes an Instagram post immediately
 */
export async function publishInstagramPost(
  payload: Omit<SchedulePostPayload, "scheduled_at">,
  token: string
): Promise<PublishResponse> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.INSTAGRAM_PUBLISH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to publish post");
  }

  return res.json();
}

/**
 * Cancels/deletes a scheduled Instagram post
 */
export async function cancelScheduledInstagramPost(
  postId: string,
  token: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.INSTAGRAM_SCHEDULE}?id=${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to cancel scheduled post");
  }
}

/**
 * Updates a scheduled Instagram post (caption and/or scheduled time)
 */
export async function updateScheduledInstagramPost(
  postId: string,
  payload: { caption?: string; scheduled_at?: string },
  token: string
): Promise<ScheduledPost> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.INSTAGRAM_SCHEDULE}?id=${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to update scheduled post");
  }

  return res.json();
}
