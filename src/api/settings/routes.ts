import { API_BASE_URL, API_ENDPOINTS } from "@/constants";

const BASE_URL = API_BASE_URL.replace(/\/$/, "");

// ─── Error helper ────────────────────────────────────────────────────

function apiError(message: string, status: number): never {
  throw { message, status } as { message: string; status: number };
}

// ─── Profile Endpoints ──────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface UserStats {
  brand_count: number;
  plan: string;
}

/**
 * Returns the authenticated user's profile.
 */
export async function getProfile(token: string): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.USER_ME}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.detail || body.message || "Failed to fetch profile", res.status);
  }
  const data = await res.json();
  return data.data;
}

/**
 * Returns the authenticated user's stats.
 */
export async function getUserStats(token: string): Promise<UserStats> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.USER_STATS}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.detail || body.message || "Failed to fetch stats", res.status);
  }
  const data = await res.json();
  return data.data;
}

/**
 * Updates the authenticated user's profile.
 */
export async function updateProfile(
  payload: { full_name?: string },
  token: string
): Promise<UserProfile> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.USER_ME}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.detail || body.message || "Failed to update profile", res.status);
  }
  const data = await res.json();
  return data.data;
}

/**
 * Uploads a new avatar for the authenticated user.
 */
export async function uploadAvatar(
  file: File,
  token: string
): Promise<UserProfile> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.USER_AVATAR}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.detail || body.message || "Failed to upload avatar", res.status);
  }
  const data = await res.json();
  return data.data;
}

/**
 * Changes the user's password.
 */
export async function changePassword(
  newPassword: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.USER_PASSWORD}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ new_password: newPassword }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.detail || body.message || "Failed to change password", res.status);
  }
  return res.json();
}
