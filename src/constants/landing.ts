/**
 * Landing Page Constants
 */

import { Globe, BrainCircuit, LayoutTemplate, CalendarClock } from "lucide-react";

export const USE_CASES = [
  {
    title: "Know Your Brand Before You Advertise",
    tags: [
      { label: "brand analysis", color: "#8a2ce2", bg: "#f3e8ff" },
      { label: "AI insights", color: "#ea580c", bg: "#fff7ed" },
      { label: "competitor scan", color: "#0891b2", bg: "#ecfeff" },
    ],
    description:
      "AdForge reads your website and generates a full brand analysis report — your tone of voice, target audience, core messaging, and competitive positioning — all before you spend a dollar on ads.",
    image: "/usecase-website-ads.png",
    bgColor: "#f3e8ff",
    direction: "row" as const,
  },
  {
    title: "Launch Campaigns in Minutes, Not Days",
    tags: [
      { label: "quick launch", color: "#ea580c", bg: "#fff7ed" },
      { label: "multi-platform", color: "#d946ef", bg: "#fdf4ff" },
      { label: "auto-schedule", color: "#059669", bg: "#ecfdf5" },
    ],
    description:
      "Go from brand analysis to a live, scheduled ad campaign in under 10 minutes. AdForge handles the creative strategy, copywriting, and publishing so you can focus on results.",
    image: "/usecase-campaign-launch.png",
    bgColor: "#fff7ed",
    direction: "row-reverse" as const,
  },
  {
    title: "Multi-Platform Ad Distribution",
    tags: [
      { label: "Instagram", color: "#d946ef", bg: "#fdf4ff" },
      { label: "Facebook", color: "#2563eb", bg: "#eff6ff" },
      { label: "LinkedIn", color: "#0891b2", bg: "#ecfeff" },
      { label: "Twitter/X", color: "#374151", bg: "#f3f4f6" },
    ],
    description:
      "Generate and schedule ads optimized for every major platform simultaneously. AdForge ensures each ad is perfectly formatted, timed, and targeted for the right audience on each channel.",
    image: "/usecase-social-ads.png",
    bgColor: "#ecfeff",
    direction: "row" as const,
  },
  {
    title: "AI-Powered Ad Creative Generation",
    tags: [
      { label: "smart copy", color: "#059669", bg: "#ecfdf5" },
      { label: "visual ads", color: "#2563eb", bg: "#eff6ff" },
      { label: "A/B variants", color: "#ea580c", bg: "#fff7ed" },
    ],
    description:
      "Select your campaign context and goals. AdForge generates multiple ad creative variations — compelling visuals and high-conversion copy — all aligned with your brand voice and audience.",
    image: "/usecase-html-banners.png",
    bgColor: "#ecfdf5",
    direction: "row-reverse" as const,
  },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    num: "01",
    icon: Globe,
    title: "Paste Your Website URL",
    description: "Enter your website URL and AdForge instantly crawls your brand — scanning your messaging, colors, tone, and identity to build a complete brand profile.",
    color: "#8a2ce2",
    bgColor: "#f3e8ff",
  },
  {
    num: "02",
    icon: BrainCircuit,
    title: "Get Your Brand Analysis Report",
    description: "Receive a detailed AI-generated brand analysis report covering your audience, tone of voice, key value propositions, and competitor positioning.",
    color: "#ea580c",
    bgColor: "#fff7ed",
  },
  {
    num: "03",
    icon: LayoutTemplate,
    title: "Generate Tailored Ad Creatives",
    description: "Select your campaign goals and target context. AdForge generates multiple ad creatives — images, copy, and formats — precisely matched to your brand.",
    color: "#0891b2",
    bgColor: "#ecfeff",
  },
  {
    num: "04",
    icon: CalendarClock,
    title: "Schedule & Run Your Campaign",
    description: "Pick your platforms, set your schedule, and launch. AdForge publishes and manages your ad campaign automatically across all selected channels.",
    color: "#059669",
    bgColor: "#ecfdf5",
  },
] as const;

// Animation Variants
export const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

export const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export const CARD_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};
