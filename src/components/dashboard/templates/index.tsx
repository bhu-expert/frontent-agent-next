/**
 * Instagram Ad Templates
 * 
 * A collection of professionally designed Instagram post templates
 * optimized for 4:5 aspect ratio (1080x1350px)
 * 
 * Each ad type has 5 unique variations following Instagram best practices:
 * - Safe zone padding for UI elements
 * - Readable typography with proper line heights
 * - High contrast for accessibility
 * - Brand-consistent color usage
 */

// Base types and utilities
export type { TemplateProps } from "./base";
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
} from "./base";

// Awareness templates - Brand storytelling, lifestyle content
export {
  AwarenessVariation1,
  AwarenessVariation2,
  AwarenessVariation3,
  AwarenessVariation4,
  AwarenessVariation5,
} from "./awareness";

// Sale templates - Promotions, discounts, offers
export {
  SaleVariation1,
  SaleVariation2,
  SaleVariation3,
  SaleVariation4,
  SaleVariation5,
} from "./sale";

// Launch templates - Product launches, announcements
export {
  LaunchVariation1,
  LaunchVariation2,
  LaunchVariation3,
  LaunchVariation4,
  LaunchVariation5,
} from "./launch";

// Engagement templates - Questions, polls, interactive content
export {
  EngagementVariation1,
  EngagementVariation2,
  EngagementVariation3,
  EngagementVariation4,
  EngagementVariation5,
} from "./engagement";

// Story Narrative templates - Storytelling, testimonials
export {
  StoryNarrativeVariation1,
  StoryNarrativeVariation2,
  StoryNarrativeVariation3,
  StoryNarrativeVariation4,
  StoryNarrativeVariation5,
} from "./story_narrative";
