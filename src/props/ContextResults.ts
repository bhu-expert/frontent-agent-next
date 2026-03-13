import { BrandContext } from "@/types/onboarding.types";

export interface ContextResultsProps {
  url: string;
  ctx: BrandContext[];
  ratings: Record<number, number>;
  bm: Set<number>;
  likes: Set<number>;
  selCtx: number | null;
  onSelect: (id: number) => void;
  onRate: (id: number, stars: number) => void;
  onToggleBm: (id: number) => void;
  onToggleLike: (id: number) => void;
  onUseSelected: () => void;
  onNewAnalysis: () => void;
  onCopy: (text: string) => void;
  isClaiming?: boolean;
}
