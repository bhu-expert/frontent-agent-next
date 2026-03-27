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
  BRAND_VARIATIONS_BULK: (id: string | number) => `/brands/${id}/ad-variations/bulk`,
  CAMPAIGNS: "/campaigns",
  CAMPAIGN_STATUS: (id: string) => `/campaigns/${id}/status`,
  CAMPAIGN_ASSETS: (id: string) => `/campaigns/${id}/assets`,
  // User Profile endpoints
  USER_ME: "/users/me",
  USER_STATS: "/users/me/stats",
  USER_AVATAR: "/users/me/avatar",
  USER_PASSWORD: "/users/me/change-password",
  // Integration endpoints
  INTEGRATIONS_STATUS: "/integrations/status",
  INTEGRATIONS_DISCONNECT: (platform: string) =>
    `/integrations/${platform}/disconnect`,
  // Contact endpoints
  CONTACT_PROXY: "/api/contact",
  CONTACT: "/contact/",
  // Auth endpoints
  FORGOT_PASSWORD: "/users/forgot-password",
  RESET_PASSWORD: "/users/reset-password",
  CAROUSEL_GENERATE: "/agent/carousel/generate",
  REEL_SCRIPT_IDEATE: "/agent/reel-script/ideate",
} as const;
