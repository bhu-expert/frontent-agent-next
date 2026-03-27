/**
 * API Related Constants
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const API_ENDPOINTS = {
  SIGNUP: "/auth/signup",
  SIGNIN: "/auth/signin",
  BRANDS: "/brands",
  BRAND_CONTEXT: (id: string | number) => `/brands/${id}/context`,
  BRAND_CONTEXT_FEEDBACK: (id: string | number) =>
    `/brands/${id}/context-feedback`,
  BRAND_DELETE: (id: string | number) => `/brands/${id}`,
  BRAND_CLAIM: (id: string | number) => `/brands/${id}/claim`,
  BRAND_VARIATIONS: (id: string | number) => `/brands/${id}/ad-variations`,
  BRAND_VARIATIONS_BULK: (id: string | number) =>
    `/brands/${id}/ad-variations/bulk`,

  // ── Campaigns ────────────────────────────────────────────────────────────
  CAMPAIGNS: "/campaigns",
  CAMPAIGN_STATUS: (id: string) => `/campaigns/${id}/status`,
  CAMPAIGN_ASSETS: (id: string) => `/campaigns/${id}/assets`,

  // ── Dashboard ────────────────────────────────────────────────────────────
  DASHBOARD_STATUS:          "/dashboard/status",
  DASHBOARD_METRICS:         "/dashboard/metrics",
  DASHBOARD_DNA:             "/dashboard/dna",
  DASHBOARD_LOGS:            "/dashboard/logs",
  DASHBOARD_SCHEDULED_POSTS: "/dashboard/scheduled-posts",
  DASHBOARD_HEADER:          "/dashboard/header",

  // ── User Profile ─────────────────────────────────────────────────────────
  USER_ME:       "/users/me",
  USER_STATS:    "/users/me/stats",
  USER_AVATAR:   "/users/me/avatar",
  USER_PASSWORD: "/users/me/change-password",

  // ── Integrations ─────────────────────────────────────────────────────────
  INTEGRATIONS_STATUS:      "/integrations/status",
  INTEGRATIONS_DISCONNECT:  (platform: string) =>
    `/integrations/${platform}/disconnect`,

  // ── Instagram Integration ────────────────────────────────────────────────
  INSTAGRAM_CONNECT:    "/integrations/instagram/connect",
  INSTAGRAM_DISCONNECT: "/integrations/instagram/disconnect",
  INSTAGRAM_STATUS:     "/integrations/instagram/status",
  INSTAGRAM_PUBLISH:    "/integrations/instagram/publish",
  INSTAGRAM_SCHEDULE:   "/integrations/instagram/schedule",

  // ── Contact ──────────────────────────────────────────────────────────────
  CONTACT_PROXY: "/api/contact",
  CONTACT:       "/contact/",

  // ── Auth ─────────────────────────────────────────────────────────────────
  FORGOT_PASSWORD:  "/users/forgot-password",
  RESET_PASSWORD:   "/users/reset-password",

  // ── Agent ────────────────────────────────────────────────────────────────
  CAROUSEL_GENERATE: "/agent/carousel/generate",
} as const;