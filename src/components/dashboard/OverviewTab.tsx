"use client";

import {
  Box,
  Flex,
  Grid,
  Text,
  Button,
  HStack,
  VStack,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useMemo } from "react";
import type { HeaderData } from "@/constants/dashboard-overview";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface OverviewTabProps {
  brandId: string | null;
  session?: any;
  metrics?: any;
  campaigns?: any[];
  dna?: { axes: any[]; tags: any[] };
  logs?: any[];
  schedule?: any[];
  agentStatus?: any | null;
  headerData?: HeaderData | null;
  isLoading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tokens
// ─────────────────────────────────────────────────────────────────────────────

const PURPLE = "#6366F1";
const PURPLE_LIGHT = "#EEF2FF";
const PURPLE_MID = "#C7D2FE";
const BORDER = "#E5E7EB";
const SURFACE = "#FAFAFA";
const TEXT_PRIMARY = "#111827";
const TEXT_SECONDARY = "#6B7280";
const TEXT_TERTIARY = "#9CA3AF";
const RADIUS_CARD = "20px";
const RADIUS_INNER = "12px";

// ─────────────────────────────────────────────────────────────────────────────
// Keyframes
// ─────────────────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulseDot = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.6); }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Sparkline
// ─────────────────────────────────────────────────────────────────────────────

function Sparkline({ data, positive }: { data: number[]; positive: boolean | null }) {
  const W = 72, H = 28;
  if (!data?.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 6) - 3,
  }));
  const stroke = positive === true ? "#10B981" : positive === false ? "#EF4444" : "#9CA3AF";
  const poly = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `M0,${H} ` + pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + ` L${W},${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id={`spark-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.15" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${positive})`} />
      <polyline points={poly} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="3" fill={stroke} stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Radar (Brand DNA)
// ─────────────────────────────────────────────────────────────────────────────

function RadarChart({ axes }: { axes: { label: string; score: number }[] }) {
  if (!axes?.length || axes.length < 3) {
    return (
      <Flex w="full" h="180px" align="center" justify="center">
        <Text fontSize="12px" color={TEXT_TERTIARY}>Not enough data</Text>
      </Flex>
    );
  }
  const cx = 90, cy = 90, R = 68;
  const n = axes.length;
  const ang = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, r: number): [number, number] => [
    cx + r * Math.cos(ang(i)),
    cy + r * Math.sin(ang(i)),
  ];

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPath =
    axes.map((a, i) => {
      const [x, y] = pt(i, (Math.max(5, a.score) / 100) * R);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ") + " Z";

  return (
    <svg width="180" height="180" viewBox="0 0 180 180" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PURPLE} stopOpacity="0.25" />
          <stop offset="100%" stopColor={PURPLE} stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* Grid rings */}
      {rings.map((lvl) => {
        const rPath = axes.map((_, i) => {
          const [x, y] = pt(i, lvl * R);
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(" ") + " Z";
        return <path key={lvl} d={rPath} fill="none" stroke="#E5E7EB" strokeWidth="1" />;
      })}

      {/* Spokes */}
      {axes.map((_, i) => {
        const [ox, oy] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={ox.toFixed(1)} y2={oy.toFixed(1)} stroke="#E5E7EB" strokeWidth="1" />;
      })}

      {/* Data shape */}
      <path d={dataPath} fill="url(#rg)" stroke={PURPLE} strokeWidth="2" strokeLinejoin="round" />

      {/* Data dots */}
      {axes.map((a, i) => {
        const [dx, dy] = pt(i, (Math.max(5, a.score) / 100) * R);
        return <circle key={i} cx={dx.toFixed(1)} cy={dy.toFixed(1)} r="3.5" fill={PURPLE} stroke="white" strokeWidth="1.5" />;
      })}

      {/* Labels */}
      {axes.map((a, i) => {
        const [lx, ly] = pt(i, R + 18);
        return (
          <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="600" fill={TEXT_SECONDARY}
            style={{ textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "inherit" }}>
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const map: Record<string, { bg: string; color: string }> = {
    complete:  { bg: "#D1FAE5", color: "#065F46" },
    live:      { bg: "#D1FAE5", color: "#065F46" },
    running:   { bg: "#DBEAFE", color: "#1E40AF" },
    queued:    { bg: "#F3F4F6", color: "#374151" },
    draft:     { bg: "#F3F4F6", color: "#374151" },
    failed:    { bg: "#FEE2E2", color: "#991B1B" },
    paused:    { bg: "#FEF3C7", color: "#92400E" },
    scheduled: { bg: "#EDE9FE", color: "#4C1D95" },
  };
  const { bg, color } = map[s] || map.queued;
  return (
    <Box
      display="inline-block"
      px="8px" py="3px"
      borderRadius="6px"
      bg={bg}
      fontSize="11px"
      fontWeight="700"
      color={color}
      letterSpacing="0.02em"
      textTransform="uppercase"
    >
      {status}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Panel shell
// ─────────────────────────────────────────────────────────────────────────────

function Panel({
  title, subtitle, action, onAction, children, delay = "0s", flush = false,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
  delay?: string;
  flush?: boolean;
}) {
  return (
    <Box
      bg="white"
      border={`1px solid ${BORDER}`}
      borderRadius={RADIUS_CARD}
      overflow="hidden"
      animation={`${fadeUp} 0.45s ease-out forwards`}
      style={{ animationDelay: delay, opacity: 0 }}
      transition="box-shadow 0.25s"
      _hover={{ boxShadow: "0 6px 24px rgba(0,0,0,0.06)" }}
    >
      <Flex
        px="20px" py="14px"
        borderBottom={`1px solid ${BORDER}`}
        align="center"
        justify="space-between"
      >
        <Box>
          <Text fontSize="14px" fontWeight="600" color={TEXT_PRIMARY} lineHeight="1.2">{title}</Text>
          {subtitle && <Text fontSize="11px" color={TEXT_TERTIARY} mt="2px">{subtitle}</Text>}
        </Box>
        {action && (
          <Button
            onClick={onAction}
            variant="ghost"
            size="xs"
            fontSize="12px"
            fontWeight="600"
            color={PURPLE}
            px="10px"
            h="28px"
            borderRadius="8px"
            _hover={{ bg: PURPLE_LIGHT }}
          >
            {action}
          </Button>
        )}
      </Flex>
      <Box p={flush ? 0 : "20px"}>{children}</Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, delta, positive, spark, delay,
}: {
  label: string;
  value: string;
  delta: string;
  positive: boolean | null;
  spark: number[];
  delay: string;
}) {
  const deltaColor = positive === true ? "#059669" : positive === false ? "#DC2626" : TEXT_TERTIARY;
  const deltaBg    = positive === true ? "#ECFDF5" : positive === false ? "#FEF2F2" : "#F3F4F6";

  return (
    <Box
      bg="white"
      border={`1px solid ${BORDER}`}
      borderRadius={RADIUS_CARD}
      p="20px"
      animation={`${fadeUp} 0.45s ease-out forwards`}
      style={{ animationDelay: delay, opacity: 0 }}
      transition="all 0.25s"
      _hover={{ borderColor: PURPLE_MID, boxShadow: "0 4px 20px rgba(99,102,241,0.08)", transform: "translateY(-2px)" }}
      cursor="pointer"
    >
      {/* Label row */}
      <Flex justify="space-between" align="flex-start" mb="12px">
        <Text fontSize="11px" fontWeight="700" color={TEXT_TERTIARY} textTransform="uppercase" letterSpacing="0.06em">
          {label}
        </Text>
        <Box mt="-4px" mr="-4px">
          <Sparkline data={spark} positive={positive} />
        </Box>
      </Flex>

      {/* Value */}
      <Text fontSize="34px" fontWeight="700" color={TEXT_PRIMARY} letterSpacing="-0.04em" lineHeight="1" mb="12px">
        {value}
      </Text>

      {/* Delta pill */}
      <Box
        display="inline-flex"
        alignItems="center"
        gap="4px"
        px="8px" py="3px"
        borderRadius="20px"
        bg={deltaBg}
      >
        {positive !== null && (
          <Box color={deltaColor}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              {positive
                ? <path d="M2 8L8 2M8 2H3.5M8 2V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                : <path d="M2 2L8 8M8 8V3.5M8 8H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              }
            </svg>
          </Box>
        )}
        <Text fontSize="11px" fontWeight="600" color={deltaColor}>{delta}</Text>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function OverviewTab({
  brandId,
  metrics: rawMetrics,
  campaigns: rawCampaigns = [],
  dna: rawDna = { axes: [], tags: [] },
  logs: rawLogs = [],
  schedule: rawSchedule = [],
  agentStatus,
  headerData,
  isLoading,
}: OverviewTabProps) {

  // ── Derived data ────────────────────────────────────────────────────────────

  const metrics = useMemo(() => [
    {
      label: "Total Reach",
      value: rawMetrics?.reach > 0 ? Number(rawMetrics.reach).toLocaleString() : "—",
      delta: "+0% this week",
      positive: null as boolean | null,
      spark: [10, 15, 12, 18, 14, 22, rawMetrics?.reach > 0 ? 28 : 20],
    },
    {
      label: "Avg Engagement",
      value: rawMetrics?.engagement > 0 ? `${rawMetrics.engagement}%` : "—",
      delta: "+0% vs last",
      positive: null as boolean | null,
      spark: [4, 5, 5, 6, 5, 7, rawMetrics?.engagement > 0 ? 8 : 7],
    },
    {
      label: "Ads Generated",
      value: Number(rawMetrics?.totalAssets || 0).toLocaleString(),
      delta: `+${rawMetrics?.totalAssets || 0} total`,
      positive: true as boolean | null,
      spark: [0, 10, 22, 45, 70, 95, rawMetrics?.totalAssets || 0],
    },
    {
      label: "Campaigns",
      value: Number(rawMetrics?.totalCampaigns || 0).toLocaleString(),
      delta: "Active",
      positive: true as boolean | null,
      spark: [1, 1, 2, 2, 3, 3, rawMetrics?.totalCampaigns || 0],
    },
  ], [rawMetrics]);

  const campaigns = useMemo(() =>
    (rawCampaigns || []).slice(0, 8).map((c: any) => {
      const type = (c.ad_type || "Ad").replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
      return {
        id: c.campaign_id,
        name: c.name || `${type} Campaign`,
        type,
        reach: c.reach ? Number(c.reach).toLocaleString() : "—",
        eng: c.engagement ? `${c.engagement}%` : "—",
        status: c.status || "queued",
      };
    }), [rawCampaigns]);

  const dnaAxes = useMemo(() =>
    (rawDna.axes || []).map((a: any) => ({ label: a.label, score: a.value ?? a.score ?? 50 })),
    [rawDna.axes]);

  const dnaTags = useMemo(() =>
    (rawDna.tags || []).map((t: any, i: number) => ({
      label: typeof t === "string" ? t : t.label,
      weight: typeof t === "object" ? t.weight : Math.max(40, 85 - i * 6),
    })), [rawDna.tags]);

  const logs = useMemo(() =>
    (rawLogs || []).slice(0, 5).map((l: any) => {
      const time = l.timestamp
        ? new Date(l.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "Recently";
      const styles: Record<string, { bg: string; color: string; icon: string }> = {
        success: { bg: "#D1FAE5", color: "#065F46", icon: "✓" },
        error:   { bg: "#FEE2E2", color: "#991B1B", icon: "✕" },
        info:    { bg: "#DBEAFE", color: "#1E40AF", icon: "i" },
        default: { bg: PURPLE_LIGHT, color: "#4338CA", icon: "⚡" },
      };
      const s = styles[l.level] || styles.default;
      return { ...l, time, ...s };
    }), [rawLogs]);

  // ── Guards ──────────────────────────────────────────────────────────────────

  if (!brandId) {
    return (
      <Flex minH="60vh" align="center" justify="center" direction="column" gap={3}>
        <Text fontSize="15px" fontWeight="600" color={TEXT_PRIMARY}>No brand selected</Text>
        <Text fontSize="13px" color={TEXT_SECONDARY}>Select or create a brand to view your overview</Text>
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex minH="60vh" align="center" justify="center" direction="column" gap={4}>
        <Spinner size="xl" color={PURPLE} borderWidth="3px" />
        <Text fontSize="13px" fontWeight="500" color={TEXT_SECONDARY}>Syncing agent data…</Text>
      </Flex>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box w="full" pb={16} minH="100vh" bg={SURFACE}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <Box
        px="28px" pt="28px" pb="24px"
        animation={`${fadeUp} 0.4s ease-out forwards`}
        style={{ opacity: 0 }}
      >
        {/* Breadcrumb */}
        <HStack gap="6px" mb="10px">
          <Text fontSize="11px" fontWeight="700" color={PURPLE} textTransform="uppercase" letterSpacing="0.06em">
            AI Dashboard
          </Text>
          <Text fontSize="11px" color={TEXT_TERTIARY}>›</Text>
          <Text fontSize="11px" fontWeight="500" color={TEXT_TERTIARY}>
            {headerData?.brandName || "Workspace"}
          </Text>
        </HStack>

        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Box>
            <Text fontSize="26px" fontWeight="700" color={TEXT_PRIMARY} letterSpacing="-0.03em" lineHeight="1.15">
              Performance Overview
            </Text>
            <Text fontSize="13px" color={TEXT_SECONDARY} mt="4px">
              {headerData?.brandName
                ? `Showing data for ${headerData.brandName}`
                : "Your AI agent workspace at a glance"}
            </Text>
          </Box>

          {/* Agent status pill */}
          {agentStatus?.config && (
            <HStack
              gap="10px" px="16px" py="10px"
              borderRadius="14px"
              bg="white"
              border={`1px solid ${BORDER}`}
              boxShadow="0 1px 4px rgba(0,0,0,0.05)"
            >
              <Box
                w="8px" h="8px" borderRadius="full"
                bg={agentStatus.config.color || "#10B981"}
                boxShadow={`0 0 0 3px ${agentStatus.config.color}22`}
                animation={`${pulseDot} 2s ease-in-out infinite`}
              />
              <Box>
                <Text fontSize="12px" fontWeight="600" color={TEXT_PRIMARY} lineHeight="1.2">
                  {agentStatus.config.label || "All Systems Operational"}
                </Text>
                <Text fontSize="10px" color={TEXT_TERTIARY} mt="1px">Last synced: Just now</Text>
              </Box>
            </HStack>
          )}
        </Flex>
      </Box>

      <Box px="28px">

        {/* ── KPI row ──────────────────────────────────────────────────────── */}
        <Grid
          templateColumns={{ base: "1fr", sm: "repeat(2,1fr)", xl: "repeat(4,1fr)" }}
          gap="14px"
          mb="20px"
        >
          {metrics.map((m, i) => (
            <KpiCard key={m.label} {...m} delay={`${i * 0.07}s`} />
          ))}
        </Grid>

        {/* ── Mid row: Campaigns + Brand DNA ───────────────────────────────── */}
        <Grid
          templateColumns={{ base: "1fr", xl: "minmax(0,1.75fr) minmax(0,1fr)" }}
          gap="14px"
          mb="14px"
        >
          {/* Campaigns table */}
          <Panel title="Recent campaigns" action="View all" delay="0.3s" flush>
            {campaigns.length === 0 ? (
              <Flex py="48px" align="center" justify="center">
                <Text fontSize="13px" color={TEXT_TERTIARY}>No campaigns yet</Text>
              </Flex>
            ) : (
              <Box overflowX="auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: SURFACE }}>
                      {["Name", "Category", "Reach", "Eng.", "Status"].map((h) => (
                        <th key={h} style={{
                          padding: "10px 20px",
                          textAlign: "left",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: TEXT_TERTIARY,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          borderBottom: `1px solid ${BORDER}`,
                          whiteSpace: "nowrap",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c, i) => (
                      <tr key={c.id || i}
                        style={{ borderBottom: `1px solid ${i === campaigns.length - 1 ? "transparent" : BORDER}`, transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = SURFACE)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px 20px" }}>
                          <Text fontSize="13px" fontWeight="600" color={TEXT_PRIMARY} lineClamp={1}>{c.name}</Text>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <Text fontSize="12px" color={TEXT_SECONDARY}>{c.type}</Text>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <Text fontSize="12px" fontWeight="600" color={TEXT_PRIMARY}>{c.reach}</Text>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <Text fontSize="12px" fontWeight="600" color={TEXT_PRIMARY}>{c.eng}</Text>
                        </td>
                        <td style={{ padding: "12px 20px" }}>
                          <StatusPill status={c.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Panel>

          {/* Brand DNA */}
          <Panel
            title="Brand intelligence"
            subtitle="Personality snapshot"
            delay="0.38s"
          >
            <Flex direction="column" align="center" gap="16px">

              {/* Radar */}
              <Box
                w="full"
                bg={SURFACE}
                borderRadius={RADIUS_INNER}
                border={`1px solid ${BORDER}`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                py="12px"
              >
                <RadarChart axes={dnaAxes} />
              </Box>

              {/* Axis scores */}
              {dnaAxes.length > 0 && (
                <Grid templateColumns="repeat(3,1fr)" gap="8px" w="full">
                  {dnaAxes.slice(0, 6).map((a) => (
                    <Box key={a.label} textAlign="center" py="8px" px="4px" borderRadius="10px" bg={SURFACE} border={`1px solid ${BORDER}`}>
                      <Text fontSize="15px" fontWeight="700" color={a.score < 65 ? "#D97706" : TEXT_PRIMARY} lineHeight="1">
                        {Math.round(a.score)}
                      </Text>
                      <Text fontSize="9px" color={TEXT_TERTIARY} textTransform="uppercase" letterSpacing="0.06em" mt="3px">
                        {a.label}
                      </Text>
                    </Box>
                  ))}
                </Grid>
              )}

              {/* Tags */}
              {dnaTags.length > 0 && (
                <Box w="full">
                  <Text fontSize="10px" fontWeight="700" color={TEXT_TERTIARY} textTransform="uppercase" letterSpacing="0.06em" mb="8px">
                    Personality DNA
                  </Text>
                  <Flex flexWrap="wrap" gap="6px">
                    {dnaTags.map((t) => {
                      const prominent = t.weight >= 78;
                      return (
                        <Box key={t.label}
                          px="10px" py="4px" borderRadius="20px"
                          border={`1px solid ${prominent ? PURPLE_MID : BORDER}`}
                          bg={prominent ? PURPLE_LIGHT : SURFACE}
                          transition="all 0.15s"
                          _hover={{ borderColor: PURPLE, bg: PURPLE_LIGHT }}
                          cursor="default"
                        >
                          <Text
                            fontSize={`${Math.max(11, Math.min(13, 10 + (t.weight - 55) / 14))}px`}
                            fontWeight={prominent ? "600" : "500"}
                            color={prominent ? "#4338CA" : TEXT_SECONDARY}
                          >
                            {t.label}
                          </Text>
                        </Box>
                      );
                    })}
                  </Flex>
                </Box>
              )}
            </Flex>
          </Panel>
        </Grid>

        {/* ── Bottom row: Agent feed + Publishing pipeline ──────────────────── */}
        <Grid
          templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap="14px"
        >
          {/* Agent activity */}
          <Panel title="Agent live stream" subtitle="Recent AI activity" delay="0.46s">
            {logs.length === 0 ? (
              <Flex py="36px" align="center" justify="center">
                <Text fontSize="13px" color={TEXT_TERTIARY}>Awaiting agent activity…</Text>
              </Flex>
            ) : (
              <VStack gap="0" align="stretch">
                {logs.map((log, i) => (
                  <Flex key={log.id || i} gap="12px" align="flex-start"
                    py="12px"
                    borderBottom={i < logs.length - 1 ? `1px solid ${BORDER}` : "none"}
                  >
                    {/* Icon */}
                    <Flex
                      w="30px" h="30px" borderRadius="10px" flexShrink={0}
                      bg={log.bg} align="center" justify="center"
                      fontSize="11px" fontWeight="800" color={log.color}
                    >
                      {log.icon}
                    </Flex>
                    {/* Text */}
                    <Box flex={1} pt="1px">
                      <Text fontSize="13px" fontWeight="500" color={TEXT_PRIMARY} lineHeight="1.45">
                        {log.message}
                      </Text>
                      <Text fontSize="11px" color={TEXT_TERTIARY} mt="3px">{log.time}</Text>
                    </Box>
                  </Flex>
                ))}
              </VStack>
            )}
          </Panel>

          {/* Publishing pipeline */}
          <Panel title="Publishing pipeline" subtitle="Scheduled for upcoming posts" action="Open calendar" delay="0.53s" flush>
            {rawSchedule.length === 0 ? (
              <Flex py="48px" align="center" justify="center" direction="column" gap={2}>
                <Text fontSize="13px" color={TEXT_TERTIARY}>No posts in the pipeline</Text>
                <Button size="sm" variant="ghost" color={PURPLE} fontSize="12px" fontWeight="600" _hover={{ bg: PURPLE_LIGHT }}>
                  + Schedule a post
                </Button>
              </Flex>
            ) : (
              <VStack gap="0" align="stretch">
                {rawSchedule.slice(0, 6).map((post: any, i: number) => {
                  const dt = post.scheduledAt || post.scheduled_at;
                  const d = dt ? new Date(dt) : null;
                  const dateStr = d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";
                  const timeStr = d ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
                  const isLast = i === Math.min(rawSchedule.length - 1, 5);

                  return (
                    <Flex key={post.id || i}
                      gap="12px" px="20px" py="14px" align="center"
                      borderBottom={isLast ? "none" : `1px solid ${BORDER}`}
                      transition="background 0.15s"
                      _hover={{ bg: SURFACE }}
                    >
                      {/* Type icon */}
                      <Flex
                        w="38px" h="38px" borderRadius="10px" flexShrink={0}
                        bg={PURPLE_LIGHT} border={`1px solid ${PURPLE_MID}`}
                        align="center" justify="center"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <rect x="2" y="2" width="12" height="12" rx="2.5" stroke={PURPLE} strokeWidth="1.3" />
                          <circle cx="8" cy="8" r="2.5" stroke={PURPLE} strokeWidth="1.3" />
                          <circle cx="11.5" cy="4.5" r="0.8" fill={PURPLE} />
                        </svg>
                      </Flex>

                      {/* Info */}
                      <Box flex={1} minW={0}>
                        <Text fontSize="13px" fontWeight="600" color={TEXT_PRIMARY} lineClamp={1}>{post.title}</Text>
                        <HStack gap="6px" mt="3px">
                          <Text fontSize="11px" fontWeight="700" color={PURPLE} textTransform="uppercase" letterSpacing="0.03em">
                            {post.type || "Post"}
                          </Text>
                          <Box w="3px" h="3px" borderRadius="full" bg={TEXT_TERTIARY} />
                          <Text fontSize="11px" color={TEXT_TERTIARY}>{dateStr} {timeStr && `· ${timeStr}`}</Text>
                        </HStack>
                      </Box>

                      {/* Status */}
                      <StatusPill status="Scheduled" />
                    </Flex>
                  );
                })}
              </VStack>
            )}
          </Panel>
        </Grid>

      </Box>
    </Box>
  );
}