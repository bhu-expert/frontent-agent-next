/**
 * API Related Constants
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Campaign status/assets endpoints live under /data
export const API_ENDPOINTS = {
  SIGNUP: "/auth/signup",
  SIGNIN: "/auth/signin",
  BRANDS: "/data/brands",
  BRAND_CONTEXT: (id: string | number) => `/data/brands/${id}/context`,
  BRAND_CONTEXT_FEEDBACK: (id: string | number) =>
    `/data/brands/${id}/context-feedback`,
  BRAND_DELETE: (id: string | number) => `/data/brands/${id}`,
  BRAND_CLAIM: (id: string | number) => `/data/brands/${id}/claim`,
  BRAND_VARIATIONS: (id: string | number) => `/data/brands/${id}/ad-variations`,
  BRAND_VARIATIONS_BULK: (id: string | number) => `/data/brands/${id}/ad-variations/bulk`,
  CAMPAIGNS: "/data/campaigns",
  CAMPAIGN_STATUS: (id: string) => `/data/campaigns/${id}/status`,
  CAMPAIGN_ASSETS: (id: string) => `/data/campaigns/${id}/assets`,
  // User Profile endpoints
  USER_ME: "/users/me",
  USER_STATS: "/users/me/stats",
  USER_AVATAR: "/users/me/avatar",
  USER_PASSWORD: "/users/me/change-password",
} as const;
