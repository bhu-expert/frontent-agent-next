/**
 * Page2Analysing Component Props
 */
export interface Page2AnalysingProps {
  url: string;
  brandName?: string;
  guardrails?: string;
  description?: string;
  onDone: (contexts: string[]) => void;
}
