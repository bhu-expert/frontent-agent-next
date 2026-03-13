import { BrandContext } from "@/types/onboarding.types";

export interface ContextSelectorProps {
  ctx: BrandContext[];
  selCtx: number | null;
  onSelect: (id: number) => void;
  onBack: () => void;
  onNext: () => void;
}
