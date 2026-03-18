/**
 * Route Constants
 */

export const APP_NAME = "plug and play agents" as const;

export const ROUTES = {
  HOME: "/",
  ONBOARDING: "/onboarding",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  CREATIVES: "/creatives",
} as const;

export const STORAGE_KEYS = {
  PENDING_BRAND_ID: "plug_and_play_agents_pending_brand_id",
  PENDING_ACTION: "plug_and_play_agents_pending_action",
  CLAIMED_BRAND_ID: "plug_and_play_agents_claimed_brand_id",
} as const;

export const SUPABASE_PROJECT_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://cjkovzjojvcjborahmgr.supabase.co";
