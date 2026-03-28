// ─────────────────────────────────────────────────────────────────────────────
// Instagram API Functions
// Calls the aggregated backend endpoint:
//   GET /api/v1/integrations/instagram/dashboard
// ─────────────────────────────────────────────────────────────────────────────

import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import type {
  InstagramDashboardData,
  InstagramMedia,
  BrandStrengthMetrics,
  ContentPerformance,
  AudienceDemographics,
} from "@/types/instagram.types";

const BASE_URL = API_BASE_URL.replace(/\/$/, "");

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Call
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the complete Instagram dashboard data in a single call.
 * The backend aggregates profile, media, insights, brand strength,
 * content performance, and audience data.
 */
export async function getInstagramDashboardData(
  token: string
): Promise<InstagramDashboardData> {
  try {
    console.log('[Instagram API] Fetching dashboard data from:', API_ENDPOINTS.INSTAGRAM_DASHBOARD);
    const result = await apiFetch<InstagramDashboardData>(
      API_ENDPOINTS.INSTAGRAM_DASHBOARD,
      token
    );
    console.log('[Instagram API] Dashboard response:', result);
    return result;
  } catch (error) {
    console.warn("[getInstagramDashboardData] Handled error:", error);
    return {
      connected: false,
      profile: null,
      insights: null,
      brand_strength: null,
      content_performance: null,
      audience: null,
      recent_media: [],
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate engagement rate from raw numbers
 */
export function calculateEngagementRate(
  likes: number,
  comments: number,
  followers: number
): number {
  if (followers === 0) return 0;
  return ((likes + comments) / followers) * 100;
}

/**
 * Format metric value for display (e.g. 1500 → "1.5K")
 */
export function formatMetricValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Calculate brand strength score from raw metrics
 */
export function calculateBrandStrengthScore(
  engagementRate: number,
  growthRate: number,
  postFrequency: number,
  avgReach: number,
  followers: number
): number {
  const engagementScore = Math.min(100, engagementRate * 20);
  const growthScore = Math.min(100, growthRate * 10);
  const frequencyScore = Math.min(100, postFrequency * 14);
  const reachScore = Math.min(100, (avgReach / followers) * 100);

  const overallScore =
    engagementScore * 0.35 +
    growthScore * 0.25 +
    frequencyScore * 0.15 +
    reachScore * 0.25;

  return Math.round(overallScore);
}

// Re-export types for convenience
export type {
  InstagramDashboardData,
  InstagramMedia,
  BrandStrengthMetrics,
  ContentPerformance,
  AudienceDemographics,
};
