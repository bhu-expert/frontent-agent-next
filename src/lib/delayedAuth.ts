import type { PendingAction } from "@/types/onboarding.types";
import { STORAGE_KEYS } from "@/constants/routes";

// ─── Keys ────────────────────────────────────────────────────────────

const KEY_BRAND_ID = STORAGE_KEYS.PENDING_BRAND_ID;
const KEY_ACTION = STORAGE_KEYS.PENDING_ACTION;
const KEY_CLAIMED_BRAND_ID = STORAGE_KEYS.CLAIMED_BRAND_ID;

// ─── Brand ID helpers ────────────────────────────────────────────────

export function savePendingBrandId(id: string): void {
  console.log("Saving pending brand ID:", id);
  localStorage.setItem(KEY_BRAND_ID, id);
}

export function getPendingBrandId(): string | null {
  const id = localStorage.getItem(KEY_BRAND_ID);
  console.log("Getting pending brand ID:", id);
  return id;
}

export function clearPendingBrandId(): void {
  console.log("Clearing pending brand ID");
  localStorage.removeItem(KEY_BRAND_ID);
}

// ─── Claimed brand helpers ───────────────────────────────────────────

export function saveClaimedBrandId(id: string): void {
  console.log("Saving claimed brand ID:", id);
  localStorage.setItem(KEY_CLAIMED_BRAND_ID, id);
}

export function getClaimedBrandId(): string | null {
  const id = localStorage.getItem(KEY_CLAIMED_BRAND_ID);
  console.log("Getting claimed brand ID:", id);
  return id;
}

export function clearClaimedBrandId(): void {
  console.log("Clearing claimed brand ID");
  localStorage.removeItem(KEY_CLAIMED_BRAND_ID);
}

// ─── Pending action helpers ──────────────────────────────────────────

export function savePendingAction(action: PendingAction): void {
  localStorage.setItem(KEY_ACTION, JSON.stringify(action));
}

export function getPendingAction(): PendingAction | null {
  const raw = localStorage.getItem(KEY_ACTION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingAction;
  } catch {
    return null;
  }
}

export function clearPendingAction(): void {
  localStorage.removeItem(KEY_ACTION);
}

// ─── Clear all delayed auth state ────────────────────────────────────

export function clearDelayedAuthState(): void {
  clearPendingBrandId();
  clearPendingAction();
}
