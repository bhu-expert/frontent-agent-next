import { Instagram} from "lucide-react";

export const CARD_STYLE = {
  bg: "white",
  border: "1px solid",
  borderColor: "#ECECEC",
  borderRadius: "24px",
  p: { base: 5, md: 8 } as Record<string, number>,
  boxShadow: "0 12px 48px rgba(0,0,0,0.04)",
} as const;

export const INPUT_STYLE = {
  border: "1px solid",
  borderColor: "#E5E7EB",
  borderRadius: "12px",
  px: "14px",
  py: "10px",
  fontSize: "14px",
  color: "#374151",
  bg: "#FAFAFA",
  w: "full",
} as const;

export const SECTION_LABEL_STYLE = {
  fontSize: "11px" as const,
  fontWeight: "700" as const,
  textTransform: "uppercase" as const,
  color: "#9CA3AF",
  letterSpacing: "0.06em",
  mb: 1,
} as const;

export const PLAN_FEATURE_COLORS = {
  bg: "#ECFDF5",
  icon: "#16A34A",
} as const;

export const TOGGLE_COLORS = {
  active: "#4F46E5",
  inactive: "#E5E7EB",
  thumb: "white",
} as const;

export const PLATFORMS_METADATA = {
  instagram: {
    label: "Instagram",
    color: "#E1306C",
    bg: "#FFF0F5",
    icon: Instagram,
  },
} as const;

export const DEFAULT_NOTIFICATION_SETTINGS = {
  emailDigests: true,
  postAlerts: true,
  weeklyReport: false,
} as const;
