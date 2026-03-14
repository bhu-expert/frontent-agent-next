/**
 * API Related Types and Interfaces
 * Consolidated from src/lib/api/types.ts and src/interfaces/discovery.ts
 */

import type { BrandEvent } from "./onboarding.types";

export type Platform = 'FB' | 'IG' | 'LI' | 'TW';
export type CampaignStatus = 'draft' | 'scheduled' | 'live' | 'completed';

export interface DashboardTemplate {
  id: string;
  label: string;
  description: string;
}

export interface DashboardStats {
  brandDnaScore: number;
  brandDnaLabel: string;
  campaignsActive: number;
  campaignsLiveCount: number;
  scheduledPostsThisWeek: number;
  totalReach: string;
  reachGrowthPct: string;
  contentPiecesGenerated: number;
  contentPiecesPending: number;
}

export interface Campaign {
  id: string;
  name: string;
  color: string;
  platforms: Platform[];
  status: CampaignStatus;
  postsCount: number;
  reach: string | null;
}

export interface BrandDNA {
  id: string;
  score: number;
  tone: string;
  audience: string;
  voice: string;
  positioning: string;
  lastUpdated: string;
  usps: string[];
}

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
}

export interface ContentPiece {
  id: string;
  platform: Platform;
  caption: string;
  scheduledAt: string;
  status: 'pending' | 'approved' | 'published';
  imageUrl: string | null;
}

export interface CampaignDetail extends Campaign {
  contentPieces: ContentPiece[];
  brandDnaId: string;
  uspsSelected: string[];
  templatesSelected: string[];
  goal: string;
}

// ─── Discovery Types (from src/interfaces/discovery.ts) ──────────────────────

export interface DiscoveryEvent {
  thought?: string;
  image?: string;
  message?: string;
  step?: string;
  chunk?: string;
  brand_id?: string;
  progress?: number;
}

export type DiscoveryStatus = "idle" | "browsing" | "generating" | "finished" | "error";

export interface DiscoveryStreamResult {
  isRunning: boolean;
  status: DiscoveryStatus;
  thoughts: string[];
  contexts: string[];
  browserImage: string;
  error: string | null;
  brandId: string | null;
  startDiscovery: (url: string, brandName: string) => void;
  stopDiscovery: () => void;
  resetDiscovery: () => void;
}

export interface GenerateCampaignPayload {
  name: string;
  objective: string;
  platform: Platform;
  budget: number;
  startDate: string;
  endDate: string;
  brandContextId: string;
}
