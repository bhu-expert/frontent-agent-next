import { BrandContext } from "@/types/onboarding.types";

export interface TemplateOptionsProps {
  ctx: BrandContext[];
  selCtx: number | null;
  selTpl: string | null;
  selIgTpl: string | null;
  platform: string;
  tone: string | null;
  emoji: string;
  cta: string;
  offer: string;
  slideN: number;
  userBrief: string;
  isLoggedIn: boolean;
  onBack: () => void;
  onSelPlatform: (p: string) => void;
  onSelTpl: (id: string) => void;
  onSelIgTpl: (id: string) => void;
  onSelTone: (t: string) => void;
  onSelEmoji: (e: string) => void;
  onSetCta: (v: string) => void;
  onSetOffer: (v: string) => void;
  onSetSlideN: (n: number) => void;
  onSetUserBrief: (v: string) => void;
  onSetField: (key: string, val: string) => void;
  onGenerate: () => void;
  onOpenLogin: () => void;
}
