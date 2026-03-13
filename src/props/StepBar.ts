export interface StepBarProps {
  curStep: number;
  maxReached: number;
  onNav: (step: number) => void;
}
