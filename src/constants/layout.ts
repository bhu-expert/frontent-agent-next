/**
 * Layout Constants
 */

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
] as const;

export const FOOTER_LINKS = {
  Product: [
    { label: "Updates", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Resources: [
    { label: "Support", href: "#" },
    { label: "Affiliate program", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Preferences", href: "#" },
    { label: "Terms of service", href: "#" },
    { label: "Contacts", href: "#" },
  ],
  Download: [
    { label: "iOS", href: "#" },
    { label: "Android", href: "#" },
    { label: "Mac", href: "#" },
    { label: "Sign In", href: "#" },
  ],
  "Get in touch": [
    { label: "hi@adforge.ai", href: "#" },
    { label: "Discord", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "X", href: "#" },
  ],
} as const;

export const HEADING_COLORS: Record<string, string> = {
  Product: "#a78bfa",
  Resources: "#34d399",
  Download: "#fbbf24",
  "Get in touch": "#fb923c",
} as const;
