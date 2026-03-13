import type { AuthUser } from "@/types/onboarding.types";

export interface ToolNavbarProps {
  user: AuthUser | null;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogout: () => void;
  onHome: () => void;
}
