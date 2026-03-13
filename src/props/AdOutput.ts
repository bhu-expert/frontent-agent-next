import { GeneratedContent } from "@/types/onboarding.types";

export interface AdOutputProps {
  gen: GeneratedContent;
  onCopy: (text: string) => void;
  onBack: () => void;
  onNewAnalysis: () => void;
}
