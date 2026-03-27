import { useEffect, useRef, useState, useCallback } from "react";
import {
  getDashboardStatus,
  getDashboardMetrics,
  getActiveCampaigns,
  getBrandDNA,
  getAgentLogs,
  getScheduledPosts,
  getDashboardHeaderData,
} from "@/api/dashboard"; 

import type {
  AgentStatus,
  Campaign,
  HeaderData,
} from "@/constants/dashboard-overview";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardData {
  status:         AgentStatus | null;
  statusConfig:   any | null;
  metrics:        any | null;
  campaigns:      Campaign[];
  dnaAxes:        { label: string; score: number }[];
  dnaTags:        any[];
  logs:           any[];
  scheduledPosts: any[];
  header:         HeaderData | null;
}

interface UseDashboardReturn extends DashboardData {
  loading: boolean;
  error:   string | null;
  refresh: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDashboardData(
  brandId: string | null | undefined,
  token:   string | null | undefined
): UseDashboardReturn {
  const [data, setData] = useState<DashboardData>({
    status:         null,
    statusConfig:   null,
    metrics:        null,
    campaigns:      [],
    dnaAxes:        [],
    dnaTags:        [],
    logs:           [],
    scheduledPosts: [],
    header:         null,
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Use a ref to track the current fetch so stale responses are discarded
  const fetchIdRef = useRef(0);

  // ── core fetch — stable reference via useCallback ──────────────────────────
  const fetchAll = useCallback(async () => {
    if (!brandId || !token) return;

    const thisFetch = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    try {
      // Fire all requests in parallel — much faster than sequential awaits
      const [
        statusRes,
        metricsRes,
        campaignsRes,
        dnaRes,
        logsRes,
        postsRes,
        headerRes,
      ] = await Promise.allSettled([
        getDashboardStatus(brandId, token),
        getDashboardMetrics(brandId, token),
        getActiveCampaigns(brandId, token),
        getBrandDNA(brandId, token),
        getAgentLogs(brandId, token),
        getScheduledPosts(brandId, token),
        getDashboardHeaderData(brandId, token),
      ]);

      // Discard if a newer fetch has already started
      if (thisFetch !== fetchIdRef.current) return;

      setData({
        status:         statusRes.status === "fulfilled"    ? statusRes.value.status      : null,
        statusConfig:   statusRes.status === "fulfilled"    ? statusRes.value.config       : null,
        metrics:        metricsRes.status === "fulfilled"   ? metricsRes.value             : null,
        campaigns:      campaignsRes.status === "fulfilled" ? campaignsRes.value           : [],
        dnaAxes:        dnaRes.status === "fulfilled"       ? dnaRes.value.axes            : [],
        dnaTags:        dnaRes.status === "fulfilled"       ? dnaRes.value.tags            : [],
        logs:           logsRes.status === "fulfilled"      ? (logsRes.value as any)       : [],
        scheduledPosts: postsRes.status === "fulfilled"     ? (postsRes.value as any)      : [],
        header:         headerRes.status === "fulfilled"    ? headerRes.value              : null,
      });

    } catch (err) {
      if (thisFetch !== fetchIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      if (thisFetch === fetchIdRef.current) setLoading(false);
    }
  // ⚠️ Only re-run when brandId or token actually change — NOT on every render
  }, [brandId, token]);

  // ── trigger fetch — stable dep array prevents infinite loop ───────────────
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...data, loading, error, refresh: fetchAll };
}
