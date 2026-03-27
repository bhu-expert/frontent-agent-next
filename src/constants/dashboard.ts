import { LayoutGrid, FileText, ImageIcon, Calendar, Grid2X2, Settings, LifeBuoy, Sparkles } from "lucide-react";

export const navItems = [
  { label: "Brands", icon: LayoutGrid, active: true },
  { label: "Content", icon: FileText, active: false },
  { label: "Assets", icon: ImageIcon, active: false },
  { label: "Calendar", icon: Calendar, active: false },
  { label: "Schedule", icon: Sparkles, active: false },
  { label: "Integrations", icon: Grid2X2, active: false },
  { label: "Support", icon: LifeBuoy, active: false },
  { label: "Settings", icon: Settings, active: false },
];
