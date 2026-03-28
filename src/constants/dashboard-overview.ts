export type Status = "live" | "draft" | "paused";
export type AgentStatus = "generating" | "optimal" | "action_required";

export type Campaign = {
  name: string;
  type: string;
  reach: string;
  eng: string;
  status: Status;
};

export type HeaderData = {
  brandId: string;
  brandName: string;
  logoUrl?: string;
  websiteUrl?: string;
  userEmail: string;
  userFullName: string;
  plan: string;
  integrationStatus: "connected" | "disconnected" | "error";
  integrationName: string;
};

// ── Data ──────────────────────────────────────────────────────────────────────

export const DEFAULT_AGENT_STATUS: AgentStatus = "generating";

export const STATUS_CFG = {
  generating: {
    color: "#3b82f6", // Blue
    label: "AI is generating & optimizing",
    glow: "rgba(59,130,246,0.1)", // Light blue glow
  },
  optimal: {
    color: "#22c55e",
    label: "Everything running optimally",
    glow: "rgba(34,197,94,0.1)",
  },
  action_required: {
    color: "#f59e0b",
    label: "Action required — draft ready",
    glow: "rgba(245,158,11,0.1)",
  },
} as const;

export const DEFAULT_METRICS = [
  { label: "Total Reach", value: "48.2K", delta: "+12% this week", up: true, spark: [28, 35, 30, 42, 38, 46, 48] },
  { label: "Avg Engagement", value: "6.4%", delta: "+2.1% vs last", up: true, spark: [4.1, 5.0, 4.8, 5.5, 5.9, 6.1, 6.4] },
  { label: "Ads Generated", value: "127", delta: "+23 this month", up: true, spark: [60, 72, 85, 90, 100, 115, 127] },
  { label: "Scheduled Posts", value: "9", delta: "Next in 3 hrs", up: null, spark: [3, 5, 7, 6, 8, 7, 9] },
];

export const DEFAULT_CAMPAIGNS: Campaign[] = [
  { name: "Brand Awareness #4", type: "Awareness", reach: "14.3K", eng: "7.2%", status: "live" },
  { name: "Flash Sale – Diwali", type: "Sales", reach: "22.1K", eng: "9.5%", status: "live" },
  { name: "Product Launch v2", type: "Launch", reach: "—", eng: "—", status: "draft" },
  { name: "Story Narrative #2", type: "Story", reach: "8.6K", eng: "4.1%", status: "paused" },
  { name: "Engagement Drive", type: "Engagement", reach: "3.2K", eng: "11.8%", status: "live" },
];

export const DEFAULT_DNA_AXES = [
  { label: "Visual", score: 88 },
  { label: "Tone", score: 74 },
  { label: "Audience", score: 91 },
  { label: "CTA", score: 62 },
  { label: "Recall", score: 79 },
  { label: "Clarity", score: 85 },
];

export const DEFAULT_DNA_TAGS = [
  { label: "Bold", weight: 95 },
  { label: "Growth-focused", weight: 88 },
  { label: "Instagram-native", weight: 82 },
  { label: "Young adults", weight: 78 },
  { label: "SaaS", weight: 70 },
  { label: "Minimal", weight: 60 },
  { label: "Direct CTA", weight: 55 },
];

export const DEFAULT_AGENT_LOGS = [
  { icon: "✦", bg: "rgba(79,70,229,0.1)", color: "#4F46E5", msg: "Generated 5 ad variants for Flash Sale – Diwali", time: "2 min ago" },
  { icon: "⦿", bg: "rgba(59,130,246,0.1)", color: "#3b82f6", msg: "Brand DNA re-scored after new post analysis", time: "18 min ago" },
  { icon: "⊕", bg: "rgba(34,197,94,0.1)", color: "#22c55e", msg: "Scheduled 3 posts for tomorrow 10 AM – 6 PM", time: "1 hr ago" },
  { icon: "⚠", bg: "rgba(245,158,11,0.1)", color: "#f59e0b", msg: "Engagement drop on Story Narrative #2 — auto-paused", time: "3 hr ago" },
];

export const DEFAULT_SCHEDULED_POSTS = [
  { time: "10:00", title: "Flash Sale – Image Ad #3", sub: "Feed · Today", today: true },
  { time: "14:30", title: "Brand Awareness – Reel", sub: "Reel · Today", today: true },
  { time: "09:00", title: "Engagement Drive – Carousel", sub: "Carousel · Tomorrow", today: false },
  { time: "18:00", title: "Product Launch v2 – Story", sub: "Story · Tomorrow", today: false },
];

export const DEFAULT_HEADER_DATA: HeaderData = {
  brandId: "",
  brandName: "My Brand",
  userEmail: "",
  userFullName: "User",
  plan: "free",
  integrationStatus: "connected",
  integrationName: "Instagram",
};
