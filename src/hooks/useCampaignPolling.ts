"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listCampaigns, pollCampaignStatus, getCampaignAssets } from "@/api";
import type { CampaignStatus, CampaignAsset } from "@/types/onboarding.types";

const POLL_INTERVAL_MS_ACTIVE = 2000;   // fast while generating
const POLL_INTERVAL_MS_IDLE   = 6000;   // slow once all done (shouldn't happen, but safe)
const POLL_INTERVAL_MS = POLL_INTERVAL_MS_ACTIVE;

export interface CampaignTracker {
  campaignId: string;
  contextIndex: number;
  contextTitle: string;
  templateId: string;
  templateLabel: string;
}

export interface CampaignState {
  /** All campaigns being tracked */
  trackers: CampaignTracker[];
  /** Merged status across all campaigns */
  statuses: Record<string, CampaignStatus>;
  /** Completed assets grouped by campaignId */
  assets: Record<string, CampaignAsset[]>;
  /** Overall progress 0-100 */
  progress: number;
  /** true while any campaign is still running */
  isPolling: boolean;
  /** Error message if polling fails */
  error: string | null;
}

export function useCampaignPolling(
  token: string | undefined,
  brandId?: string,
  onFirstAsset?: () => void,
) {
  const [trackers, setTrackers] = useState<CampaignTracker[]>([]);
  const [statuses, setStatuses] = useState<Record<string, CampaignStatus>>({});
  const [assets, setAssets] = useState<Record<string, CampaignAsset[]>>({});
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchedCampaigns = useRef<Set<string>>(new Set());
  const firstAssetFired = useRef(false);

  // Load existing campaigns from DB on mount
  useEffect(() => {
    if (!token || !brandId || loaded) return;

    (async () => {
      try {
        const { campaigns } = await listCampaigns(token, brandId);
        if (campaigns.length === 0) {
          setLoaded(true);
          return;
        }

        const restoredTrackers: CampaignTracker[] = campaigns.map((c) => ({
          campaignId: c.campaign_id,
          contextIndex: c.context_index,
          contextTitle: `Context ${c.context_index}`,
          templateId: c.ad_type || "awareness",
          templateLabel: c.ad_type?.replace("_", " ") || "Awareness",
        }));

        setTrackers(restoredTrackers);

        // Fetch assets for completed campaigns immediately
        const completedIds = campaigns.filter((c) => c.status === "complete").map((c) => c.campaign_id);
        for (const cid of completedIds) {
          fetchedCampaigns.current.add(cid);
          try {
            const assetData = await getCampaignAssets(cid, token);
            const allAssets = Object.values(assetData.by_context).flat();
            setAssets((prev) => ({ ...prev, [cid]: allAssets }));
          } catch {
            // ignore
          }
        }

        // Set statuses from the list response
        const statusMap: Record<string, CampaignStatus> = {};
        for (const c of campaigns) {
          statusMap[c.campaign_id] = {
            campaign_id: c.campaign_id,
            total: c.total,
            complete: c.complete,
            status: c.status,
            by_context: {},
          };
        }
        setStatuses(statusMap);

        // Start polling if any campaigns are still running
        const hasActive = campaigns.some((c) => c.status !== "complete");
        if (hasActive) {
          setIsPolling(true);
        }
      } catch {
        // Failed to load campaigns, not critical
      } finally {
        setLoaded(true);
      }
    })();
  }, [token, brandId, loaded]);

  const addCampaign = useCallback((tracker: CampaignTracker) => {
    setTrackers((prev) => {
      if (prev.some((t) => t.campaignId === tracker.campaignId)) return prev;
      return [...prev, tracker];
    });
    setIsPolling(true);
    setError(null);
  }, []);

  const clearCampaigns = useCallback(() => {
    setTrackers([]);
    setStatuses({});
    setAssets({});
    setIsPolling(false);
    setError(null);
    fetchedCampaigns.current.clear();
    firstAssetFired.current = false;
  }, []);

  // Compute overall progress
  const progress = (() => {
    const allStatuses = Object.values(statuses);
    if (allStatuses.length === 0) return 0;
    const totalComplete = allStatuses.reduce((sum, s) => sum + s.complete, 0);
    const totalJobs = allStatuses.reduce((sum, s) => sum + s.total, 0);
    if (totalJobs === 0) return 0;
    return Math.round((totalComplete / totalJobs) * 100);
  })();

  // Poll loop
  useEffect(() => {
    if (!token || trackers.length === 0) return;

    const poll = async () => {
      const activeCampaignIds = trackers
        .map((t) => t.campaignId)
        .filter((id) => !fetchedCampaigns.current.has(id));

      if (activeCampaignIds.length === 0) {
        setIsPolling(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      console.debug("[Poll] checking", activeCampaignIds.length, "campaigns:", activeCampaignIds);

      try {
        const results = await Promise.all(
          activeCampaignIds.map((id) => pollCampaignStatus(id, token))
        );

        for (const status of results) {
          console.log(
            `[Poll] ${status.campaign_id} → status=${status.status} ` +
            `complete=${status.complete}/${status.total} failed=${(status as any).failed ?? 0}`
          );
        }

        setStatuses((prev) => {
          const next = { ...prev };
          for (const status of results) {
            next[status.campaign_id] = status;
          }
          return next;
        });

        // Fetch assets for campaigns that have any completed images
        for (const status of results) {
          if (status.complete > 0) {
            try {
              console.debug(`[Poll] fetching assets for ${status.campaign_id}`);
              const assetData = await getCampaignAssets(status.campaign_id, token);
              const allAssets = Object.values(assetData.by_context).flat();
              console.log(`[Poll] ${status.campaign_id} → ${allAssets.length} assets received`);
              setAssets((prev) => {
                const next = { ...prev, [status.campaign_id]: allAssets };
                if (!firstAssetFired.current && allAssets.length > 0 && onFirstAsset) {
                  firstAssetFired.current = true;
                  onFirstAsset();
                }
                return next;
              });
            } catch (err) {
              console.error(`[Poll] assets fetch failed for ${status.campaign_id}:`, err);
            }
          }
          // Mark fully complete or fully failed campaigns so we stop polling them
          if (status.status === "complete" || status.status === "failed") {
            console.log(`[Poll] ${status.campaign_id} → DONE (${status.status}), stopping poll`);
            fetchedCampaigns.current.add(status.campaign_id);
            if (status.status === "failed") {
              console.error(`[Poll] ${status.campaign_id} → all jobs failed`);
              setError("Image generation failed for one or more campaigns. Please try generating again.");
            }
          }
        }
      } catch (err) {
        console.error("[Poll] polling error:", err);
        setError(err instanceof Error ? err.message : "Polling failed");
      }
    };

    // Initial poll immediately
    poll();

    // Use faster interval while actively generating
    const interval = isPolling ? POLL_INTERVAL_MS_ACTIVE : POLL_INTERVAL_MS_IDLE;
    intervalRef.current = setInterval(poll, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, trackers, isPolling, onFirstAsset]);

  return {
    trackers,
    statuses,
    assets,
    progress,
    isPolling,
    error,
    addCampaign,
    clearCampaigns,
  };
}
