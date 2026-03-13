/**
 * Route Constants
 */

export const APP_NAME = "AdForge" as const;

export const ROUTES = {
  HOME: "/",
  ONBOARDING: "/onboarding",
} as const;

export const STORAGE_KEYS = {
  PENDING_BRAND_ID: "adforge_pending_brand_id",
  PENDING_ACTION: "adforge_pending_action",
} as const;

export const SUPABASE_PROJECT_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://cjkovzjojvcjborahmgr.supabase.co";
