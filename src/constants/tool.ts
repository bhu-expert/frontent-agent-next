/**
 * Tool Steps and Progress Constants
 * Consolidated from src/config/constants.ts and src/constants/page2.ts
 */

export const TOOL_STEPS = [
  "URL",
  "Analyse",
  "Results",
  "Template",
  "Generate",
  "Output",
] as const;

export type ToolStep = typeof TOOL_STEPS[number];
export const TOTAL_STEPS = TOOL_STEPS.length;

export const ANALYSIS_PROGRESS_STEPS = [
  "Scraping website content",
  "Extracting brand signals",
  "Analysing tone & positioning",
  "Generating 5 brand contexts",
  "Finalising output",
] as const;

export const GENERATION_PROGRESS_STEPS = [
  "Loading selected context",
  "Applying template structure",
  "Composing slides",
  "Writing caption & hashtags",
  "Finalising output",
] as const;

export const CONTEXT_INDEX_TITLES = {
  1: "Brand Overview",
  2: "Target Audience",
  3: "Value Proposition",
  4: "Tone & Voice",
  5: "Key Differentiators",
} as const;

export type ContextIndex = keyof typeof CONTEXT_INDEX_TITLES;
