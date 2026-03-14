/**
 * API Constants
 * Consolidated from src/config/constants.ts
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://content.bhuexpert.com/api/v1/data";

export const API_ENDPOINTS = {
  BRANDS:           "/brands",
  BRAND_CONTEXT:    (id: string | number) => `/brands/${id}/context`,
  BRAND_CLAIM:      (id: string | number) => `/brands/${id}/claim`,
  BRAND_VARIATIONS: (id: string | number) => `/brands/${id}/ad-variations`,
} as const;

export const STORAGE_KEYS = {
  PENDING_BRAND_ID: "adforge_pending_brand_id",
  PENDING_ACTION:   "adforge_pending_action",
} as const;
