/**
 * @/types/instagram.types.ts
 *
 * TypeScript types for the Instagram dashboard.
 *
 * These mirror the exact JSON shape returned by:
 *   GET /api/v1/integrations/instagram/dashboard
 *
 * Import in your component:
 *   import type { InstagramDashboardData, … } from "@/types/instagram.types";
 */

// ─────────────────────────────────────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────────────────────────────────────

export interface InstagramProfile {
  id: string;
  username: string;
  name: string;
  profile_picture_url: string | null;
  biography: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  is_business_account: boolean;
  account_type: "BUSINESS" | "CREATOR" | "PERSONAL";
}

// ─────────────────────────────────────────────────────────────────────────────
// Insights  (Business / Creator only)
// ─────────────────────────────────────────────────────────────────────────────

export interface InstagramInsights {
  /** Unique accounts reached in the last 24 h */
  reach: number;
  /** Total impressions in the last 24 h */
  impressions: number;
  /** Profile-page views in the last 24 h */
  profile_views: number;
  /** Follower count snapshot from insights */
  follower_count: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand Strength
// ─────────────────────────────────────────────────────────────────────────────

export interface BrandStrengthMetrics {
  /** Weighted composite score 0–100 */
  overall_score: number;
  /** Interaction rate score 0–100 */
  engagement_score: number;
  /** Follower growth score 0–100 */
  growth_score: number;
  /** Post quality score 0–100 */
  content_quality_score: number;
  /** Repeat-engagement score 0–100 */
  audience_loyalty_score: number;
  /** Reach-to-follower ratio score 0–100 */
  reach_score: number;
  /** Engagement rate % (raw; used as trend label) */
  engagement_trend: number;
  /** Follower growth % delta (0 when history unavailable) */
  follower_growth_trend: number;
  /** Reach delta % (0 when history unavailable) */
  reach_trend: number;
  /** "IMAGE" | "VIDEO" | "REELS" | "CAROUSEL_ALBUM" */
  top_performing_content_type: string;
  /** E.g. "10:00 AM" */
  best_posting_time: string;
  recommendations: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Performance
// ─────────────────────────────────────────────────────────────────────────────

export interface PostingFrequency {
  posts_per_week: number;
  most_active_day: string;
  most_active_hour: number;
}

export interface ContentPerformance {
  total_posts: number;
  /** e.g. { IMAGE: 8, VIDEO: 2, REELS: 2 } */
  posts_by_type: Record<string, number>;
  avg_likes: number;
  avg_comments: number;
  /** Average total interactions per post */
  avg_engagement_rate: number;
  top_posts: InstagramMedia[];
  recent_posts: InstagramMedia[];
  posting_frequency: PostingFrequency;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audience Demographics
// ─────────────────────────────────────────────────────────────────────────────

export interface GenderDistribution {
  male: number;
  female: number;
  other: number;
}

export interface AgeRange {
  age_range: string;
  percentage: number;
}

export interface TopLocation {
  name: string;
  percentage: number;
}

export interface OnlineActivity {
  /** 24-element array, index = hour 0-23, value = relative activity */
  by_hour: number[];
  by_day: Record<string, number>;
  peak_hour: number;
  peak_day: string;
}

export interface AudienceDemographics {
  total_followers: number;
  /** % delta over last 7 days (0 when history unavailable) */
  follower_growth_7d: number;
  /** % delta over last 28 days (0 when history unavailable) */
  follower_growth_28d: number;
  gender_distribution: GenderDistribution;
  age_distribution: AgeRange[];
  top_locations: TopLocation[];
  online_activity: OnlineActivity;
}

// ─────────────────────────────────────────────────────────────────────────────
// Media
// ─────────────────────────────────────────────────────────────────────────────

export type InstagramMediaType =
  | "IMAGE"
  | "VIDEO"
  | "REELS"
  | "CAROUSEL_ALBUM"
  | "STORIES";

export interface InstagramMedia {
  id: string;
  media_type: InstagramMediaType;
  media_url: string | null;
  /** Fallback for VIDEO / REELS when media_url is a video file */
  thumbnail_url: string | null;
  permalink: string;
  timestamp: string;   // ISO-8601
  caption: string | null;
  like_count: number | undefined;
  comments_count: number | undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scheduled post  (from GET /integrations/instagram/schedule)
// ─────────────────────────────────────────────────────────────────────────────

export interface ScheduledInstagramPost {
  id: string;
  ig_user_id: string;
  caption: string;
  media_url: string;
  media_type: InstagramMediaType;
  scheduled_at: string;  // ISO-8601
  status: "scheduled" | "published" | "failed";
}

// ─────────────────────────────────────────────────────────────────────────────
// Full dashboard payload  (from GET /integrations/instagram/dashboard)
// ─────────────────────────────────────────────────────────────────────────────

export interface InstagramDashboardData {
  connected: boolean;
  profile:             InstagramProfile        | null;
  insights:            InstagramInsights       | null;
  brand_strength:      BrandStrengthMetrics    | null;
  content_performance: ContentPerformance      | null;
  audience:            AudienceDemographics    | null;
  recent_media:        InstagramMedia[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Schedule request  (POST /integrations/instagram/schedule body)
// ─────────────────────────────────────────────────────────────────────────────

export interface ScheduleIGPostPayload {
  caption: string;
  media_url: string;
  media_type: InstagramMediaType;
  scheduled_at: string;  // ISO-8601
}
