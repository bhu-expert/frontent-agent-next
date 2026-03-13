export interface AuthModalProps {
  open: boolean;
  mode: "login" | "signup";
  onClose: () => void;
  onSwitch: (mode: "login" | "signup") => void;
  onAuthSuccess: () => void;
}
