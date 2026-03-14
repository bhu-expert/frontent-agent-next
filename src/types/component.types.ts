/**
 * Component Property Types
 * Consolidated from src/props/ folder
 * These are React component prop interfaces.
 */

import { DiscoveryStatus } from "./api.types";

export interface AgentThoughtsPopoverProps {
  thoughts: string[];
  status: DiscoveryStatus;
  onClose: () => void;
}

export interface AgentThoughtsPopupProps {
  thoughts: string[];
  status: DiscoveryStatus;
  isOpen: boolean;
  onClose: () => void;
}

export interface BrandIdentityCardsProps {
  contexts: string[];
  status: DiscoveryStatus;
}

export interface BrowserViewportProps {
  imageUrl?: string;
  status: DiscoveryStatus;
}

export interface Page2AnalysingProps {
  url: string;
  brandName?: string;
  onDone: (contexts: string[]) => void;
}
