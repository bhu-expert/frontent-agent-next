"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { listCampaigns, getCampaignAssets, pollCampaignStatus } from "@/api";
import type { CampaignStatus, CampaignAsset } from "@/types/onboarding.types";

// Safety-net timeout: if Realtime stalls, fall back to a single REST poll after this long
const REALTIME_STALL_TIMEOUT_MS = 60_000;

export interface CampaignTracker {
  campaignId: string;
  contextIndex: number;
  contextTitle: string;
  templateId: string;
  templateLabel: string;
  /** Total jobs in this campaign — returned by the generate API immediately. */
  total: number;
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
  /** Error message if any */
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

  // campaignId → Realtime channel
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
  // campaignId → (variationId → status string)
  const jobRowsRef = useRef<Map<string, Map<string, string>>>(new Map());
  // campaignId → total job count (seeded from tracker or listCampaigns)
  const totalsRef = useRef<Map<string, number>>(new Map());
  // campaignIds whose assets have already been fetched
  const fetchedRef = useRef<Set<string>>(new Set());
  const firstAssetFired = useRef(false);
  // campaignId → stall-timeout handle
  const stallTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Reset when brand changes
  const prevBrandIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (prevBrandIdRef.current === brandId) return;
    prevBrandIdRef.current = brandId;
    unsubscribeAll(); // also clears stallTimersRef
    setTrackers([]);
    setStatuses({});
    setAssets({});
    setIsPolling(false);
    setError(null);
    setLoaded(false);
    jobRowsRef.current.clear();
    totalsRef.current.clear();
    fetchedRef.current.clear();
    firstAssetFired.current = false;
  }, [brandId]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function unsubscribeAll() {
    channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
    channelsRef.current.clear();
    stallTimersRef.current.forEach((t) => clearTimeout(t));
    stallTimersRef.current.clear();
  }

  function unsubscribe(campaignId: string) {
    const ch = channelsRef.current.get(campaignId);
    if (ch) {
      supabase.removeChannel(ch);
      channelsRef.current.delete(campaignId);
    }
    const t = stallTimersRef.current.get(campaignId);
    if (t) { clearTimeout(t); stallTimersRef.current.delete(campaignId); }
  }

  /** Finalise a campaign: fetch its assets once, close the channel, check if all done. */
  async function finaliseCampaign(campaignId: string, tokenStr: string, failed: boolean) {
    if (failed) {
      setError("Image generation failed for one or more campaigns. Please try generating again.");
    }
    if (!fetchedRef.current.has(campaignId)) {
      fetchedRef.current.add(campaignId);
      try {
        const assetData = await getCampaignAssets(campaignId, tokenStr);
        const all = Object.values(assetData.by_context).flat();
        setAssets((prev) => {
          const next = { ...prev, [campaignId]: all };
          if (!firstAssetFired.current && all.length > 0 && onFirstAsset) {
            firstAssetFired.current = true;
            onFirstAsset();
          }
          return next;
        });
      } catch {
        // Surface asset load failure — don't leave spinner running silently
        setError("Assets could not be loaded. Please refresh the page.");
      }
    }
    unsubscribe(campaignId);
    if (channelsRef.current.size === 0) setIsPolling(false);
  }

  /**
   * Fallback REST poll used when the Realtime channel stalls or fails to subscribe.
   * Runs once, resolves the final status, then closes the campaign.
   */
  async function fallbackPoll(campaignId: string, tokenStr: string) {
    try {
      const status = await pollCampaignStatus(campaignId, tokenStr);
      const complete = status.complete;
      const t        = totalsRef.current.get(campaignId) ?? status.total;
      setStatuses((prev) => ({
        ...prev,
        [campaignId]: {
          campaign_id: campaignId,
          total:       t,
          complete,
          status:      status.status as CampaignStatus["status"],
          by_context:  {},
        },
      }));
      if (status.status === "complete" || status.status === "failed") {
        await finaliseCampaign(campaignId, tokenStr, status.status === "failed");
      } else {
        // Still running — keep stall timer going for another interval
        const handle = setTimeout(() => fallbackPoll(campaignId, tokenStr), REALTIME_STALL_TIMEOUT_MS);
        stallTimersRef.current.set(campaignId, handle);
      }
    } catch {
      setError("Could not reach the server. Please check your connection and refresh.");
      unsubscribe(campaignId);
      if (channelsRef.current.size === 0) setIsPolling(false);
    }
  }

  /**
   * Open a Supabase Realtime subscription for one campaign.
   * Each UPDATE/INSERT on generation_jobs where campaign_id matches
   * drives the status + assets state.
   * Falls back to a REST poll if the channel fails to connect or stalls.
   */
  function subscribe(campaignId: string, total: number, tokenStr: string) {
    if (channelsRef.current.has(campaignId)) return;

    totalsRef.current.set(campaignId, total);
    if (!jobRowsRef.current.has(campaignId)) {
      jobRowsRef.current.set(campaignId, new Map());
    }

    // Stall safety-net: if no Realtime event arrives within the timeout, fall back to REST poll
    const stallHandle = setTimeout(() => fallbackPoll(campaignId, tokenStr), REALTIME_STALL_TIMEOUT_MS);
    stallTimersRef.current.set(campaignId, stallHandle);

    const channel = supabase
      .channel(`jobs:${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "generation_jobs",
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          // Reset stall timer on every event — we're alive
          const existing = stallTimersRef.current.get(campaignId);
          if (existing) clearTimeout(existing);
          const newHandle = setTimeout(() => fallbackPoll(campaignId, tokenStr), REALTIME_STALL_TIMEOUT_MS);
          stallTimersRef.current.set(campaignId, newHandle);

          const row = (payload.new ?? payload.old) as Record<string, unknown> | null;
          if (!row) return;

          const variationId = row.variation_id as string;
          const rowStatus   = row.status as string;
          if (!variationId) return;

          const jobMap = jobRowsRef.current.get(campaignId) ?? new Map<string, string>();
          jobMap.set(variationId, rowStatus);
          jobRowsRef.current.set(campaignId, jobMap);

          const completeCount = [...jobMap.values()].filter((s) => s === "complete").length;
          const failedCount   = [...jobMap.values()].filter((s) => s === "failed").length;
          const t             = totalsRef.current.get(campaignId) ?? total;
          const allDone       = completeCount + failedCount >= t;
          const newStatus     = allDone
            ? (failedCount > 0 && completeCount === 0 ? "failed" : "complete")
            : "running";

          setStatuses((prev) => ({
            ...prev,
            [campaignId]: {
              campaign_id: campaignId,
              total: t,
              complete: completeCount,
              status: newStatus as CampaignStatus["status"],
              by_context: {},
            },
          }));

          if (allDone) {
            finaliseCampaign(campaignId, tokenStr, newStatus === "failed");
          }
        },
      )
      .subscribe((status, err) => {
        // Channel subscription status callback
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error(`[Realtime] channel ${campaignId} ${status}:`, err);
          // Cancel the stall timer and immediately fall back to REST poll
          const t = stallTimersRef.current.get(campaignId);
          if (t) { clearTimeout(t); stallTimersRef.current.delete(campaignId); }
          supabase.removeChannel(channel);
          channelsRef.current.delete(campaignId);
          fallbackPoll(campaignId, tokenStr);
        }
      });

    channelsRef.current.set(campaignId, channel);
  }

  // ── Load existing campaigns from DB on mount ───────────────────────────────
  useEffect(() => {
    if (!token || !brandId || loaded) return;

    (async () => {
      try {
        const { campaigns } = await listCampaigns(token, brandId);
        if (campaigns.length === 0) { setLoaded(true); return; }

        const restoredTrackers: CampaignTracker[] = campaigns.map((c) => ({
          campaignId:     c.campaign_id,
          contextIndex:   c.context_index,
          contextTitle:   `Context ${c.context_index}`,
          templateId:     c.ad_type || "awareness",
          templateLabel:  c.ad_type?.replace("_", " ") || "Awareness",
          total:          c.total,
        }));

        setTrackers(restoredTrackers);

        // Seed status map from DB data
        const statusMap: Record<string, CampaignStatus> = {};
        for (const c of campaigns) {
          totalsRef.current.set(c.campaign_id, c.total);
          statusMap[c.campaign_id] = {
            campaign_id: c.campaign_id,
            total:       c.total,
            complete:    c.complete,
            status:      c.status as CampaignStatus["status"],
            by_context:  {},
          };
        }
        setStatuses(statusMap);

        // Fetch assets for completed campaigns immediately; subscribe to running ones
        const completedIds = campaigns.filter((c) => c.status === "complete").map((c) => c.campaign_id);
        const activeIds    = campaigns.filter((c) => c.status !== "complete").map((c) => c.campaign_id);

        for (const cid of completedIds) {
          fetchedRef.current.add(cid);
          getCampaignAssets(cid, token)
            .then((assetData) => {
              const all = Object.values(assetData.by_context).flat();
              setAssets((prev) => ({ ...prev, [cid]: all }));
            })
            .catch(() => {/* ignore — not critical on cold load */});
        }

        if (activeIds.length > 0) {
          setIsPolling(true);
          for (const c of campaigns.filter((c) => c.status !== "complete")) {
            subscribe(c.campaign_id, c.total, token);
          }
        }
      } catch {
        // Failed to load campaigns — not critical
      } finally {
        setLoaded(true);
      }
    })();
  }, [token, brandId, loaded]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const addCampaign = useCallback(
    (tracker: CampaignTracker) => {
      if (!token) return;
      totalsRef.current.set(tracker.campaignId, tracker.total);

      // Seed status immediately so totalJobs > 0 before any Realtime event arrives
      setStatuses((prev) => ({
        ...prev,
        [tracker.campaignId]: {
          campaign_id: tracker.campaignId,
          total:       tracker.total,
          complete:    0,
          status:      "running" as CampaignStatus["status"],
          by_context:  {},
        },
      }));

      setTrackers((prev) => {
        if (prev.some((t) => t.campaignId === tracker.campaignId)) return prev;
        return [...prev, tracker];
      });

      setIsPolling(true);
      setError(null);
      subscribe(tracker.campaignId, tracker.total, token);
    },
    [token],
  );

  const clearCampaigns = useCallback(() => {
    unsubscribeAll(); // also clears stallTimersRef
    setTrackers([]);
    setStatuses({});
    setAssets({});
    setIsPolling(false);
    setError(null);
    jobRowsRef.current.clear();
    totalsRef.current.clear();
    fetchedRef.current.clear();
    firstAssetFired.current = false;
  }, []);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => () => { unsubscribeAll(); }, []);

  // ── Compute overall progress ───────────────────────────────────────────────
  const progress = (() => {
    const all = Object.values(statuses);
    if (all.length === 0) return 0;
    const totalComplete = all.reduce((sum, s) => sum + s.complete, 0);
    const totalJobs     = all.reduce((sum, s) => sum + s.total,    0);
    if (totalJobs === 0) return 0;
    return Math.round((totalComplete / totalJobs) * 100);
  })();

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
