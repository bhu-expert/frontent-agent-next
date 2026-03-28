import {
  DEFAULT_AGENT_STATUS,
  STATUS_CFG,
  DEFAULT_METRICS,
  DEFAULT_CAMPAIGNS,
  DEFAULT_DNA_AXES,
  DEFAULT_DNA_TAGS,
  DEFAULT_AGENT_LOGS,
  DEFAULT_SCHEDULED_POSTS,
  DEFAULT_HEADER_DATA,
  AgentStatus,
  Campaign,
  HeaderData,
} from "@/constants/dashboard-overview";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";

// ── Shared fetch helper ────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  token: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${path}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ── getDashboardStatus ─────────────────────────────────────────────────────────

export async function getDashboardStatus(
  brandId: string,
  token: string
): Promise<{ status: AgentStatus; config: (typeof STATUS_CFG)[AgentStatus] }> {
  try {
    const data = await apiFetch<{
      status: AgentStatus;
      config: (typeof STATUS_CFG)[AgentStatus];
    }>(API_ENDPOINTS.DASHBOARD_STATUS, token, { brand_id: brandId });

    return data;
  } catch (err) {
    console.error("[getDashboardStatus]", err);
    return { status: DEFAULT_AGENT_STATUS, config: STATUS_CFG[DEFAULT_AGENT_STATUS] };
  }
}

// ── getDashboardMetrics ────────────────────────────────────────────────────────

export async function getDashboardMetrics(
  brandId: string,
  token: string
): Promise<any> {
  try {
    const data = await apiFetch<any>(
      API_ENDPOINTS.DASHBOARD_METRICS,
      token,
      { brand_id: brandId }
    );

    return data;
  } catch (err) {
    console.error("[getDashboardMetrics]", err);
    return DEFAULT_METRICS;
  }
}

// ── getActiveCampaigns ─────────────────────────────────────────────────────────

export async function getActiveCampaigns(
  brandId: string,
  token: string
): Promise<Campaign[]> {
  try {
    const data = await apiFetch<{ campaigns: Campaign[] }>(
      API_ENDPOINTS.CAMPAIGNS,
      token,
      { brand_id: brandId }
    );

    return data.campaigns ?? [];
  } catch (err) {
    console.error("[getActiveCampaigns]", err);
    return DEFAULT_CAMPAIGNS;
  }
}

// ── getBrandDNA ────────────────────────────────────────────────────────────────

export async function getBrandDNA(
  brandId: string,
  token: string
): Promise<{ axes: typeof DEFAULT_DNA_AXES; tags: typeof DEFAULT_DNA_TAGS }> {
  try {
    const data = await apiFetch<{
      axes: typeof DEFAULT_DNA_AXES;
      tags: typeof DEFAULT_DNA_TAGS;
    }>(API_ENDPOINTS.DASHBOARD_DNA, token, { brand_id: brandId });

    return data;
  } catch (err) {
    console.error("[getBrandDNA]", err);
    return { axes: DEFAULT_DNA_AXES, tags: DEFAULT_DNA_TAGS };
  }
}

// ── getAgentLogs ───────────────────────────────────────────────────────────────

export async function getAgentLogs(
  brandId: string,
  token: string
): Promise<typeof DEFAULT_AGENT_LOGS> {
  try {
    const data = await apiFetch<{ logs: typeof DEFAULT_AGENT_LOGS }>(
      API_ENDPOINTS.DASHBOARD_LOGS,
      token,
      { brand_id: brandId }
    );

    return data.logs ?? [];
  } catch (err) {
    console.error("[getAgentLogs]", err);
    return DEFAULT_AGENT_LOGS;
  }
}

// ── getScheduledPosts ──────────────────────────────────────────────────────────

export async function getScheduledPosts(
  brandId: string,
  token: string
): Promise<typeof DEFAULT_SCHEDULED_POSTS> {
  try {
    const data = await apiFetch<{ posts: typeof DEFAULT_SCHEDULED_POSTS }>(
      API_ENDPOINTS.DASHBOARD_SCHEDULED_POSTS,
      token,
      { brand_id: brandId }
    );

    return data.posts ?? [];
  } catch (err) {
    console.error("[getScheduledPosts]", err);
    return DEFAULT_SCHEDULED_POSTS;
  }
}

// ── getDashboardHeaderData ─────────────────────────────────────────────────────

export async function getDashboardHeaderData(
  brandId: string,
  token: string
): Promise<HeaderData> {
  try {
    const data = await apiFetch<HeaderData>(
      API_ENDPOINTS.DASHBOARD_HEADER,
      token,
      { brand_id: brandId }
    );

    return data;
  } catch (err) {
    console.error("[getDashboardHeaderData]", err);
    return DEFAULT_HEADER_DATA;
  }
}
