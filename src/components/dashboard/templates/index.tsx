/**
 * Instagram Ad Templates
 *
 * 10 universal layout templates (ProcessStack … SplitQuote) that replace
 * the old 25-template (5 ad_types × 5 variations) system.
 *
 * All layouts:
 *  - Accept a `format` prop ("feed_4_5" | "feed" | "stories")
 *  - Scale entirely via percentage-based dimensions — no fixed px
 *  - Show imageUrl in every image zone; fall back to primary→secondary gradient
 */

// ─── Base types & utilities ────────────────────────────────────────────────────
export type { TemplateProps, ImageFormat } from "./base";
export {
  TemplateWrapper,
  InstagramText,
  BackgroundImage,
  GradientOverlay,
  VignetteOverlay,
  BrandName,
  TemplateBadge,
  AccentDot,
  SafeZone,
  INSTAGRAM_ASPECT_RATIO,
  SAFE_ZONE_PADDING,
  MAX_CHARS,
  ASPECT_RATIO_MAP,
} from "./base";

// ─── 10 Layout templates ───────────────────────────────────────────────────────
export {
  ProcessStack,
  TitleSandwich,
  GridDuo,
  LFrameNarrative,
  DataTableau,
  CinematicLetterbox,
  DiagonalSplit,
  SidebarSocial,
  MinimalistFrame,
  SplitQuote,
} from "./layouts";

// ─── Backwards-compat re-exports (old per-type variation names) ────────────────
// Awareness
export {
  AwarenessVariation1,
  AwarenessVariation2,
  AwarenessVariation3,
  AwarenessVariation4,
  AwarenessVariation5,
} from "./awareness";

// Sale
export {
  SaleVariation1,
  SaleVariation2,
  SaleVariation3,
  SaleVariation4,
  SaleVariation5,
} from "./sale";

// Launch
export {
  LaunchVariation1,
  LaunchVariation2,
  LaunchVariation3,
  LaunchVariation4,
  LaunchVariation5,
} from "./launch";

// Engagement
export {
  EngagementVariation1,
  EngagementVariation2,
  EngagementVariation3,
  EngagementVariation4,
  EngagementVariation5,
} from "./engagement";

// Story Narrative
export {
  StoryNarrativeVariation1,
  StoryNarrativeVariation2,
  StoryNarrativeVariation3,
  StoryNarrativeVariation4,
  StoryNarrativeVariation5,
} from "./story_narrative";

// ─── Helper: map adType + variationIndex → one of the 10 layout components ─────

import type { ImageFormat } from "./base";
import {
  ProcessStack,
  TitleSandwich,
  GridDuo,
  LFrameNarrative,
  DataTableau,
  CinematicLetterbox,
  DiagonalSplit,
  SidebarSocial,
  MinimalistFrame,
  SplitQuote,
} from "./layouts";

const LAYOUTS = [
  ProcessStack,
  TitleSandwich,
  GridDuo,
  LFrameNarrative,
  DataTableau,
  CinematicLetterbox,
  DiagonalSplit,
  SidebarSocial,
  MinimalistFrame,
  SplitQuote,
] as const;

/**
 * Returns one of the 10 layout components based on ad type + variation index.
 *
 * Each ad type starts at a different offset so the layouts are spread across
 * types and variations do not repeat the same template within one type.
 *
 * @param adType         - e.g. "awareness", "sale", "launch", "story_narrative", "engagement"
 * @param variationIndex - 1-based variation index (1–5)
 * @param contextIndex   - optional extra offset (0-based) for additional spread
 */
export function getTemplateComponent(
  adType: string,
  variationIndex: number,
  contextIndex?: number,
) {
  const typeOffset: Record<string, number> = {
    awareness:       0,
    sale:            2,
    launch:          4,
    story_narrative: 6,
    engagement:      8,
  };
  const offset = typeOffset[adType] ?? 0;
  const idx =
    (offset + ((variationIndex - 1) % 5) + (contextIndex ?? 0)) % LAYOUTS.length;
  return LAYOUTS[idx];
}

/**
 * Returns the ImageFormat that corresponds to a given variation index.
 *
 * Convention (mirrors backend variation generation):
 *   variationIndex 1 → feed_4_5 (4:5)
 *   variationIndex 2 → feed_4_5 (4:5)
 *   variationIndex 3 → feed     (1:1)
 *   variationIndex 4 → stories  (9:16)
 *   variationIndex 5 → stories  (9:16)
 */
export function getVariationFormat(variationIndex: number): ImageFormat {
  if (variationIndex === 3) return "feed";
  if (variationIndex >= 4) return "stories";
  return "feed_4_5";
}

// ─── Format maps (convenience re-exports) ─────────────────────────────────────

export const FORMAT_ASPECT_MAP: Record<ImageFormat, string> = {
  feed_4_5: "4/5",
  feed:     "1/1",
  stories:  "9/16",
};

export const FORMAT_LABELS_MAP: Record<ImageFormat, string> = {
  feed_4_5: "Feed 4:5",
  feed:     "Feed 1:1",
  stories:  "Stories 9:16",
};
