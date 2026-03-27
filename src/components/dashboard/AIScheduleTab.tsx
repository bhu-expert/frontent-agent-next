"use client";

import { useState, useEffect } from "react";
import {
  Box, Button, Flex, Text, VStack, Badge, Image, SimpleGrid,
} from "@chakra-ui/react";
import {
  Sparkles, Calendar, Clock, CheckCircle, AlertCircle,
  ChevronRight, X, Loader, RotateCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AssetInventoryItem {
  asset_id: string;
  asset_url: string;
  format: "feed" | "stories" | "feed_4_5" | "carousel";
  ad_type: string;
  source: "campaign" | "library";
}

interface BatchSlot {
  slot_index: number;
  day_offset: number;
  day_label: string;
  suggested_time: string;
  post_format: string;
  media_type: string;
  ad_type: string;
  asset_id?: string;
  asset_url?: string;
  slide_asset_urls?: string[];
  reasoning: string;
}

interface BatchProposal {
  batch_name: string;
  slots: BatchSlot[];
  inventory_gaps: string[];
  timing_strategy: string;
}

type Step = "configure" | "generating" | "review" | "confirmed";

interface AIScheduleTabProps {
  brandId?: string;
  brandName?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBadgeColors(fmt: string): { bg: string; color: string } {
  switch (fmt) {
    case "stories":  return { bg: "#F3E8FF", color: "#7C3AED" };
    case "feed":     return { bg: "#DBEAFE", color: "#1D4ED8" };
    case "feed_4_5": return { bg: "#E0E7FF", color: "#4338CA" };
    case "carousel": return { bg: "#FEF3C7", color: "#B45309" };
    default:         return { bg: "#F3F4F6", color: "#374151" };
  }
}

function buildScheduledAt(startDate: string, dayOffset: number, suggestedTime: string): string {
  if (!startDate) return new Date().toISOString();
  const base = new Date(startDate + "T00:00:00");
  if (isNaN(base.getTime())) return new Date().toISOString();
  base.setDate(base.getDate() + dayOffset);
  const safeTime = (suggestedTime || "09:00").replace(/[^0-9:]/g, "");
  const parts = safeTime.split(":").map((n) => parseInt(n, 10));
  const hours   = isNaN(parts[0]) ? 9  : Math.min(parts[0], 23);
  const minutes = isNaN(parts[1]) ? 0  : Math.min(parts[1], 59);
  base.setHours(hours, minutes, 0, 0);
  return base.toISOString();
}

function formatDateRange(startDate: string, slots: BatchSlot[]): string {
  if (!slots.length) return startDate;
  const maxOffset = Math.max(...slots.map(s => s.day_offset));
  const start = new Date(startDate);
  const end   = new Date(startDate);
  end.setDate(end.getDate() + maxOffset);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function countByFormat(assets: AssetInventoryItem[]) {
  return assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.format] = (acc[a.format] || 0) + 1;
    return acc;
  }, {});
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AIScheduleTab({ brandId = "", brandName = "" }: AIScheduleTabProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  // Configure
  const [cadence, setCadence]                 = useState<"weekly" | "biweekly">("weekly");
  const [startDate, setStartDate]             = useState(todayStr);
  const [postCount, setPostCount]             = useState(7);
  const [allowMultiplePerDay, setAllowMultiple] = useState(false);

  // Step
  const [step, setStep]             = useState<Step>("configure");
  const [proposeError, setProposeError] = useState<string | null>(null);
  const [proposal, setProposal]     = useState<BatchProposal | null>(null);

  // Streaming
  const [streamPhase, setStreamPhase]       = useState<"brand" | "inventory" | "building" | "done">("brand");
  const [streamBrand, setStreamBrand]       = useState<{ name: string; industry: string } | null>(null);
  const [streamInventory, setStreamInventory] = useState<{ format_counts: Record<string, number>; total: number } | null>(null);
  const [streamStatus, setStreamStatus]     = useState("Initialising…");

  // Review
  const [slotAssets, setSlotAssets]             = useState<Record<number, AssetInventoryItem>>({});
  const [excludedSlots, setExcludedSlots]       = useState<Set<number>>(new Set());
  const [expandedReasonings, setExpandedReasonings] = useState<Set<number>>(new Set());
  const [previewAsset, setPreviewAsset]         = useState<{ asset: AssetInventoryItem; slotIndex: number } | null>(null);

  // Confirm
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);

  // Inventory from library_images
  const [fetchedAssets, setFetchedAssets] = useState<AssetInventoryItem[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  useEffect(() => {
    async function fetchInventory() {
      setLoadingAssets(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingAssets(false); return; }

      const { data: feedbackRows } = await supabase
        .from("image_feedback")
        .select("image_id")
        .eq("user_id", user.id)
        .gte("rating", 4);

      const ratedIds = feedbackRows?.map((f: { image_id: string }) => f.image_id) ?? [];
      if (!ratedIds.length) { setFetchedAssets([]); setLoadingAssets(false); return; }

      const { data: publishedRows } = await supabase
        .from("scheduled_instagram_posts")
        .select("media_url")
        .eq("user_id", user.id)
        .eq("status", "published");

      const publishedUrls = new Set(
        (publishedRows ?? []).map((p: { media_url: string | null }) => p.media_url).filter(Boolean)
      );

      const { data: rows, error } = await supabase
        .from("library_images")
        .select("id, storage_path, external_url, format, label")
        .eq("user_id", user.id)
        .in("id", ratedIds);

      if (error || !rows) { setLoadingAssets(false); return; }

      const assets: AssetInventoryItem[] = rows
        .map((row: { id: string; storage_path: string; external_url: string | null; format: string | null; label: string | null }) => {
          const url = row.external_url ||
            supabase.storage.from("ad-images").getPublicUrl(row.storage_path).data.publicUrl;
          return {
            asset_id: row.id,
            asset_url: url,
            format: (row.format as AssetInventoryItem["format"]) || "feed",
            ad_type: row.label || "awareness",
            source: "library" as const,
          };
        })
        .filter((a: AssetInventoryItem) => !publishedUrls.has(a.asset_url));

      setFetchedAssets(assets);
      setLoadingAssets(false);
    }
    fetchInventory();
  }, []);

  const assetsByFormat = countByFormat(fetchedAssets);

  // ── Generate proposal ─────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setProposeError(null);
    setStreamBrand(null);
    setStreamInventory(null);
    setStreamPhase("brand");
    setStreamStatus("Initialising…");
    setSlotAssets({});
    setStep("generating");

    try {
      const res = await fetch("/api/batches/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: brandId,
          cadence,
          start_date: startDate,
          target_post_count: postCount,
          available_assets: fetchedAssets,
          allow_multiple_per_day: allowMultiplePerDay,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as Record<string, string>).error || "Failed to generate proposal");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            switch (event.type) {
              case "status":        setStreamStatus(event.message); break;
              case "brand_loaded":  setStreamBrand({ name: event.brand_name, industry: event.industry }); setStreamPhase("inventory"); break;
              case "inventory":     setStreamInventory({ format_counts: event.format_counts, total: event.total }); setStreamPhase("building"); break;
              case "building":      setStreamPhase("building"); setStreamStatus(event.message || "Building your schedule…"); break;
              case "thinking":      break; // suppressed
              case "done":
                setProposal(event.proposal as BatchProposal);
                setExcludedSlots(new Set());
                setExpandedReasonings(new Set());
                setStreamPhase("done");
                setStep("review");
                break;
              case "error": throw new Error(event.message);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (err: unknown) {
      setProposeError(err instanceof Error ? err.message : "Proposal failed");
      setStep("configure");
    }
  };

  // ── Confirm batch ─────────────────────────────────────────────────────────

  const confirmedSlots = proposal ? proposal.slots.filter(s => !excludedSlots.has(s.slot_index)) : [];
  const readySlots = confirmedSlots.filter(s => !!slotAssets[s.slot_index]);

  const handleConfirm = async () => {
    if (!proposal || !readySlots.length) return;
    setConfirmError(null);
    setIsConfirming(true);

    try {
      const slotsPayload = readySlots.map(slot => {
        const picked = slotAssets[slot.slot_index];
        return {
          slot_index: slot.slot_index,
          day_offset: slot.day_offset,
          day_label: slot.day_label,
          scheduled_at: buildScheduledAt(startDate, slot.day_offset, slot.suggested_time),
          post_format: slot.post_format,
          media_type: slot.media_type,
          ad_type: slot.ad_type,
          asset_url: picked?.asset_url || "",
          slide_asset_urls: picked?.format === "carousel" ? (slot.slide_asset_urls ?? [picked.asset_url]) : [],
          caption: undefined,
        };
      });

      const maxOffset = Math.max(...readySlots.map(s => s.day_offset));
      const lastSlot = readySlots.find(s => s.day_offset === maxOffset)!;
      const endsAt  = buildScheduledAt(startDate, lastSlot.day_offset, lastSlot.suggested_time);
      const startsAt = buildScheduledAt(startDate, 0, readySlots[0].suggested_time);

      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: brandId,
          batch_name: proposal.batch_name,
          cadence,
          starts_at: startsAt,
          ends_at: endsAt,
          confirmed_slots: slotsPayload,
          composition_config: { cadence, post_count: confirmedSlots.length, timing_strategy: proposal.timing_strategy },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create batch");
      setCreatedBatchId(data.batch_id);
      setStep("confirmed");
    } catch (err: unknown) {
      setConfirmError(err instanceof Error ? err.message : "Batch creation failed");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReset = () => {
    setStep("configure");
    setProposal(null);
    setSlotAssets({});
    setExcludedSlots(new Set());
    setCreatedBatchId(null);
    setConfirmError(null);
    setProposeError(null);
  };

  // ── Step indicator ────────────────────────────────────────────────────────

  const STEPS: { key: Step; label: string }[] = [
    { key: "configure",  label: "Configure" },
    { key: "generating", label: "Generate" },
    { key: "review",     label: "Review" },
    { key: "confirmed",  label: "Schedule" },
  ];
  const stepOrder: Step[] = ["configure", "generating", "review", "confirmed"];
  const currentStepIdx = stepOrder.indexOf(step);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <VStack align="stretch" gap={8}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <Flex align="flex-start" justify="space-between" flexWrap="wrap" gap={4}>
        <Box>
          <Flex align="center" gap={3} mb={1}>
            <Flex w="40px" h="40px" borderRadius="12px" bg="#EEF2FF" align="center" justify="center" color="#4F46E5" flexShrink={0}>
              <Sparkles size={20} strokeWidth={2} />
            </Flex>
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="700" color="#111111" lineHeight="1.05">
              AI Scheduler
            </Text>
          </Flex>
          <Text fontSize="15px" color="#6B7280" ml="52px">
            {brandName
              ? `Auto-compose a content schedule for ${brandName} using your rated assets.`
              : "Auto-compose a content schedule using your rated assets."}
          </Text>
        </Box>

        {(step === "review" || step === "confirmed") && (
          <Button
            bg="#F3F4F6"
            color="#374151"
            borderRadius="12px"
            h="40px"
            px={4}
            fontSize="14px"
            fontWeight="600"
            _hover={{ bg: "#E5E7EB" }}
            onClick={handleReset}
          >
            <Flex align="center" gap={2}>
              <RotateCcw size={15} strokeWidth={2.5} />
              Start over
            </Flex>
          </Button>
        )}
      </Flex>

      {/* ── Step indicator ──────────────────────────────────────────────── */}
      <Flex align="center" gap={0}>
        {STEPS.map((s, i) => {
          const isPast    = i < currentStepIdx;
          const isCurrent = i === currentStepIdx;
          return (
            <Flex key={s.key} align="center" flex={i < STEPS.length - 1 ? 1 : undefined}>
              <Flex align="center" gap={2} flexShrink={0}>
                <Flex
                  w="28px" h="28px"
                  borderRadius="50%"
                  align="center" justify="center"
                  fontSize="12px" fontWeight="700"
                  bg={isCurrent ? "#4F46E5" : isPast ? "#10B981" : "#E5E7EB"}
                  color={isCurrent || isPast ? "white" : "#9CA3AF"}
                  transition="all 0.3s ease"
                >
                  {isPast ? "✓" : i + 1}
                </Flex>
                <Text
                  fontSize="13px"
                  fontWeight={isCurrent ? "700" : "500"}
                  color={isCurrent ? "#4F46E5" : isPast ? "#10B981" : "#9CA3AF"}
                  whiteSpace="nowrap"
                >
                  {s.label}
                </Text>
              </Flex>
              {i < STEPS.length - 1 && (
                <Box flex={1} h="2px" mx={3} bg={isPast ? "#10B981" : "#E5E7EB"} borderRadius="full" transition="background 0.3s ease" />
              )}
            </Flex>
          );
        })}
      </Flex>

      {/* ══════════════════════════════════════════════════════════════════
          STEP 1 — Configure
      ══════════════════════════════════════════════════════════════════ */}
      {step === "configure" && (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>

          {/* Left card — settings */}
          <Box bg="white" border="1px solid #E5E7EB" borderRadius="24px" p={7} boxShadow="0 4px 24px rgba(0,0,0,0.05)">
            <Text fontSize="18px" fontWeight="700" color="#111111" mb={6}>Schedule settings</Text>

            {proposeError && (
              <Flex align="flex-start" gap={3} p={4} borderRadius="12px" bg="#FEF2F2" border="1px solid #FECACA" mb={5}>
                <AlertCircle size={16} color="#DC2626" style={{ marginTop: 2, flexShrink: 0 }} />
                <Text fontSize="13px" color="#DC2626" fontWeight="500">{proposeError}</Text>
              </Flex>
            )}

            <VStack gap={6} align="stretch">
              {/* Cadence */}
              <Box>
                <Text fontSize="14px" fontWeight="600" color="#374151" mb={3}>Posting cadence</Text>
                <Flex gap={3}>
                  {(["weekly", "biweekly"] as const).map(c => (
                    <Box
                      key={c} flex={1} p={4} borderRadius="14px"
                      border="2px solid"
                      borderColor={cadence === c ? "#4F46E5" : "#E5E7EB"}
                      bg={cadence === c ? "#EEF2FF" : "white"}
                      cursor="pointer" textAlign="center"
                      onClick={() => setCadence(c)}
                      transition="all 0.15s ease"
                      _hover={{ borderColor: cadence === c ? "#4F46E5" : "#C7D2FE" }}
                    >
                      <Text fontSize="15px" fontWeight="700" color={cadence === c ? "#4F46E5" : "#374151"}>
                        {c === "biweekly" ? "Bi-weekly" : "Weekly"}
                      </Text>
                      <Text fontSize="12px" color={cadence === c ? "#6366F1" : "#9CA3AF"} mt={0.5}>
                        {c === "weekly" ? "Posts every week" : "Posts every 2 weeks"}
                      </Text>
                    </Box>
                  ))}
                </Flex>
              </Box>

              {/* Start date */}
              <Box>
                <Text fontSize="14px" fontWeight="600" color="#374151" mb={2}>Start date</Text>
                <Flex align="center" gap={2} p={3} borderRadius="12px" border="1px solid #D1D5DB" bg="white">
                  <Calendar size={16} color="#6B7280" style={{ flexShrink: 0 }} />
                  <input
                    type="date"
                    value={startDate}
                    min={todayStr}
                    onChange={e => setStartDate(e.target.value)}
                    style={{ flex: 1, border: "none", outline: "none", fontSize: "14px", color: "#1F2937", background: "transparent" }}
                  />
                </Flex>
              </Box>

              {/* Post count */}
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="14px" fontWeight="600" color="#374151">Target post count</Text>
                  <Flex align="center" justify="center" bg="#EEF2FF" color="#4F46E5" borderRadius="10px" px={3} py={1} minW="40px">
                    <Text fontSize="16px" fontWeight="800">{postCount}</Text>
                  </Flex>
                </Flex>
                <input
                  type="range" min={3} max={14} step={1} value={postCount}
                  onChange={e => setPostCount(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#4F46E5", cursor: "pointer", height: "6px" }}
                />
                <Flex justify="space-between" mt={1}>
                  <Text fontSize="12px" color="#9CA3AF">3 posts</Text>
                  <Text fontSize="12px" color="#9CA3AF">14 posts</Text>
                </Flex>
              </Box>

              {/* Multiple per day */}
              <Flex
                align="center" justify="space-between" p={4}
                borderRadius="14px" bg="#F9FAFB" border="1px solid #E5E7EB"
                cursor="pointer"
                onClick={() => setAllowMultiple(v => !v)}
                _hover={{ bg: "#F3F4F6" }}
                transition="background 0.1s ease"
              >
                <Box>
                  <Text fontSize="14px" fontWeight="600" color="#374151">Multiple posts per day</Text>
                  <Text fontSize="12px" color="#9CA3AF" mt={0.5}>
                    {allowMultiplePerDay
                      ? "Up to 2 feed posts/day with 6h gap · Stories anytime"
                      : "One feed post per day (recommended for new accounts)"}
                  </Text>
                </Box>
                <Box w="44px" h="24px" borderRadius="12px" bg={allowMultiplePerDay ? "#4F46E5" : "#D1D5DB"} position="relative" transition="background 0.2s ease" flexShrink={0}>
                  <Box
                    position="absolute" top="4px"
                    left={allowMultiplePerDay ? "24px" : "4px"}
                    w="16px" h="16px" borderRadius="50%" bg="white"
                    boxShadow="0 1px 3px rgba(0,0,0,0.2)"
                    transition="left 0.2s ease"
                  />
                </Box>
              </Flex>

              {/* CTA */}
              <Button
                bg="#4F46E5" color="white" borderRadius="14px" h="52px"
                fontSize="15px" fontWeight="700" shadow="sm"
                _hover={{ bg: "#4338CA", shadow: "md" }}
                onClick={handleGenerate} mt={2}
              >
                <Flex align="center" gap={2}>
                  <Sparkles size={18} strokeWidth={2.5} />
                  Generate AI Proposal
                  <ChevronRight size={18} strokeWidth={2.5} />
                </Flex>
              </Button>
            </VStack>
          </Box>

          {/* Right card — asset inventory */}
          <Box bg="white" border="1px solid #E5E7EB" borderRadius="24px" p={7} boxShadow="0 4px 24px rgba(0,0,0,0.05)">
            <Flex align="center" justify="space-between" mb={6}>
              <Text fontSize="18px" fontWeight="700" color="#111111">Asset inventory</Text>
              {loadingAssets && <Loader size={16} color="#4F46E5" style={{ animation: "spin 1s linear infinite" }} />}
            </Flex>

            {loadingAssets ? (
              <Flex align="center" justify="center" py={12} gap={3}>
                <Text fontSize="14px" color="#9CA3AF">Loading your rated assets…</Text>
              </Flex>
            ) : fetchedAssets.length === 0 ? (
              <VStack gap={4} align="stretch">
                <Flex align="flex-start" gap={3} p={4} borderRadius="12px" bg="#FFFBEB" border="1px solid #FDE68A">
                  <AlertCircle size={16} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Text fontSize="14px" fontWeight="700" color="#92400E" mb={1}>No rated assets yet</Text>
                    <Text fontSize="13px" color="#92400E" lineHeight="1.55">
                      Rate assets ≥ 4 stars in the Assets tab. The AI will still generate a schedule plan — you can assign assets later.
                    </Text>
                  </Box>
                </Flex>
                <Text fontSize="13px" fontWeight="600" color="#6B7280" mb={1}>The AI will plan for:</Text>
                {[
                  { format: "Feed posts",  desc: "Static images (1:1)" },
                  { format: "Stories",     desc: "Vertical short-form (9:16)" },
                  { format: "Feed 4:5",    desc: "Portrait feed posts" },
                  { format: "Carousels",   desc: "Multi-slide educational content" },
                ].map(item => (
                  <Flex key={item.format} align="center" gap={3} p={3} borderRadius="10px" bg="#F9FAFB" border="1px solid #E5E7EB">
                    <Box w="10px" h="10px" borderRadius="50%" bg="#FCD34D" flexShrink={0} />
                    <Box>
                      <Text fontSize="13px" fontWeight="600" color="#374151">{item.format}</Text>
                      <Text fontSize="12px" color="#9CA3AF">{item.desc}</Text>
                    </Box>
                  </Flex>
                ))}
              </VStack>
            ) : (
              <VStack gap={5} align="stretch">
                {/* Format breakdown */}
                <SimpleGrid columns={2} gap={3}>
                  {Object.entries(assetsByFormat).map(([fmt, count]) => {
                    const colors = formatBadgeColors(fmt);
                    return (
                      <Flex
                        key={fmt} align="center" justify="space-between"
                        p={4} borderRadius="14px"
                        bg={colors.bg} border="1px solid"
                        borderColor={colors.color + "44"}
                      >
                        <Box>
                          <Text fontSize="13px" fontWeight="700" color={colors.color} textTransform="capitalize">
                            {fmt.replace("_", " ")}
                          </Text>
                          <Text fontSize="11px" color={colors.color} opacity={0.75}>
                            {fmt === "stories" ? "9:16" : fmt === "feed_4_5" ? "4:5" : fmt === "carousel" ? "multi" : "1:1"}
                          </Text>
                        </Box>
                        <Text fontSize="28px" fontWeight="800" color={colors.color}>{count}</Text>
                      </Flex>
                    );
                  })}
                </SimpleGrid>

                {/* Asset thumbnails preview */}
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#6B7280" mb={3}>
                    Preview ({fetchedAssets.length} rated asset{fetchedAssets.length !== 1 ? "s" : ""})
                  </Text>
                  <Flex gap={2} flexWrap="wrap">
                    {fetchedAssets.slice(0, 12).map(asset => {
                      const colors = formatBadgeColors(asset.format);
                      return (
                        <Box
                          key={asset.asset_id}
                          w="72px" h="72px"
                          borderRadius="10px" overflow="hidden"
                          border="2px solid" borderColor={colors.color + "44"}
                          flexShrink={0} position="relative"
                          cursor="pointer"
                          _hover={{ borderColor: colors.color, transform: "scale(1.05)" }}
                          transition="all 0.15s ease"
                          onClick={() => setPreviewAsset({ asset, slotIndex: -1 })}
                        >
                          <Image src={asset.asset_url} alt="Asset" w="100%" h="100%" objectFit="cover" />
                        </Box>
                      );
                    })}
                    {fetchedAssets.length > 12 && (
                      <Flex w="72px" h="72px" borderRadius="10px" bg="#F3F4F6" border="1px solid #E5E7EB" align="center" justify="center" flexShrink={0}>
                        <Text fontSize="12px" fontWeight="700" color="#6B7280">+{fetchedAssets.length - 12}</Text>
                      </Flex>
                    )}
                  </Flex>
                </Box>
              </VStack>
            )}
          </Box>
        </SimpleGrid>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 2 — Generating
      ══════════════════════════════════════════════════════════════════ */}
      {step === "generating" && (
        <Box bg="white" border="1px solid #E5E7EB" borderRadius="24px" p={10} boxShadow="0 4px 24px rgba(0,0,0,0.05)">
          <Flex direction="column" align="center" justify="center" gap={8}>
            {/* Phase strip */}
            <Flex gap={3} align="center" flexWrap="wrap" justify="center">
              {([
                { key: "brand",     label: "Brand",     icon: "🏷" },
                { key: "inventory", label: "Inventory", icon: "📦" },
                { key: "building",  label: "Schedule",  icon: "📅" },
              ] as { key: typeof streamPhase; label: string; icon: string }[]).map((phase, i) => {
                const order   = ["brand", "inventory", "building", "done"];
                const cur     = order.indexOf(streamPhase);
                const phaseI  = order.indexOf(phase.key);
                const isDone  = cur > phaseI;
                const isActive = cur === phaseI;
                return (
                  <Flex key={phase.key} align="center" gap={2}>
                    {i > 0 && <Box w="32px" h="2px" borderRadius="full" bg={isDone ? "#10B981" : "#E5E7EB"} />}
                    <Flex
                      align="center" gap={2} px={4} py={2} borderRadius="24px"
                      bg={isDone ? "#D1FAE5" : isActive ? "#EEF2FF" : "#F3F4F6"}
                      border="1px solid"
                      borderColor={isDone ? "#6EE7B7" : isActive ? "#C7D2FE" : "#E5E7EB"}
                      transition="all 0.3s ease"
                    >
                      <Text fontSize="16px">{phase.icon}</Text>
                      <Text fontSize="13px" fontWeight="700" color={isDone ? "#065F46" : isActive ? "#4F46E5" : "#9CA3AF"}>
                        {phase.label}
                      </Text>
                      {isActive && <Loader size={13} strokeWidth={2.5} color="#4F46E5" style={{ animation: "spin 1.2s linear infinite" }} />}
                      {isDone && <Text fontSize="12px" color="#059669">✓</Text>}
                    </Flex>
                  </Flex>
                );
              })}
            </Flex>

            {/* Brand + inventory badges */}
            {(streamBrand || streamInventory) && (
              <Flex gap={2} flexWrap="wrap" justify="center">
                {streamBrand && (
                  <Badge bg="#EEF2FF" color="#4F46E5" px={4} py={2} borderRadius="10px" fontSize="13px" fontWeight="600">
                    {streamBrand.name} · {streamBrand.industry}
                  </Badge>
                )}
                {streamInventory && Object.entries(streamInventory.format_counts).map(([fmt, cnt]) => {
                  const colors = formatBadgeColors(fmt);
                  return (
                    <Badge key={fmt} bg={colors.bg} color={colors.color} px={3} py={2} borderRadius="10px" fontSize="13px" fontWeight="600" textTransform="capitalize">
                      {fmt.replace("_", " ")}: {cnt}
                    </Badge>
                  );
                })}
              </Flex>
            )}

            {/* Status */}
            <Flex align="center" gap={3}>
              {streamPhase !== "done" && <Loader size={16} strokeWidth={2} color="#4F46E5" style={{ animation: "spin 1.2s linear infinite" }} />}
              <Text fontSize="15px" color="#6B7280" fontWeight="500">{streamStatus}</Text>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 3 — Review
      ══════════════════════════════════════════════════════════════════ */}
      {step === "review" && proposal && (
        <VStack gap={6} align="stretch">

          {/* Batch summary bar */}
          <Box bg="white" border="1px solid #E5E7EB" borderRadius="20px" p={5} boxShadow="0 4px 24px rgba(0,0,0,0.05)">
            <Flex align="center" justify="space-between" flexWrap="wrap" gap={3}>
              <Box>
                <Text fontSize="20px" fontWeight="800" color="#111111">{proposal.batch_name}</Text>
                <Flex align="center" gap={2} mt={1} flexWrap="wrap">
                  <Flex align="center" gap={1.5} color="#6B7280" fontSize="13px">
                    <Calendar size={14} />
                    <Text fontWeight="500">{formatDateRange(startDate, proposal.slots)}</Text>
                  </Flex>
                  <Badge bg="#D1FAE5" color="#065F46" px={2.5} py={1} borderRadius="8px" fontSize="12px" fontWeight="600">
                    {confirmedSlots.length} / {proposal.slots.length} selected
                  </Badge>
                  <Badge bg="#E0E7FF" color="#3730A3" px={2.5} py={1} borderRadius="8px" fontSize="12px" fontWeight="600">
                    {confirmedSlots.filter(s => slotAssets[s.slot_index]).length} assets assigned
                  </Badge>
                  <Badge bg="#F3F4F6" color="#6B7280" px={2.5} py={1} borderRadius="8px" fontSize="12px" fontWeight="600" textTransform="capitalize">
                    {cadence === "biweekly" ? "Bi-weekly" : "Weekly"}
                  </Badge>
                </Flex>
              </Box>
              {proposal.timing_strategy && (
                <Flex align="center" gap={2} p={3} borderRadius="10px" bg="#F0F9FF" border="1px solid #BAE6FD" maxW="360px">
                  <Clock size={14} color="#0369A1" style={{ flexShrink: 0 }} />
                  <Text fontSize="12px" color="#0369A1" lineHeight="1.5">
                    <Text as="span" fontWeight="700">Timing: </Text>
                    {proposal.timing_strategy}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Box>

          {/* Inventory gaps warning */}
          {fetchedAssets.length === 0 && proposal.inventory_gaps.length > 0 && (
            <Box p={5} borderRadius="16px" bg="#FFFBEB" border="1px solid #FDE68A">
              <Flex align="flex-start" gap={3}>
                <AlertCircle size={16} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                <Box>
                  <Text fontSize="14px" fontWeight="700" color="#92400E" mb={2}>
                    Inventory gaps — {proposal.inventory_gaps.length} missing asset{proposal.inventory_gaps.length > 1 ? "s" : ""}
                  </Text>
                  {proposal.inventory_gaps.map((gap, i) => (
                    <Text key={i} fontSize="13px" color="#92400E" lineHeight="1.6">• {gap}</Text>
                  ))}
                </Box>
              </Flex>
            </Box>
          )}

          {/* Slot cards */}
          <VStack gap={4} align="stretch">
            {proposal.slots.map(slot => {
              const isExcluded = excludedSlots.has(slot.slot_index);
              const isExpanded = expandedReasonings.has(slot.slot_index);
              const fmtColors  = formatBadgeColors(slot.post_format);
              const formatAssets = fetchedAssets.filter(a => a.format === slot.post_format);
              const picked     = slotAssets[slot.slot_index];

              return (
                <Box
                  key={slot.slot_index}
                  bg={isExcluded ? "#F9FAFB" : "white"}
                  border="1px solid"
                  borderColor={isExcluded ? "#E5E7EB" : picked ? "#A7F3D0" : "#E0E7FF"}
                  borderRadius="20px"
                  p={6}
                  opacity={isExcluded ? 0.55 : 1}
                  transition="all 0.2s ease"
                  boxShadow={isExcluded ? "none" : "0 2px 12px rgba(0,0,0,0.04)"}
                >
                  <Flex gap={5} align="flex-start" direction={{ base: "column", md: "row" }}>

                    {/* Left — checkbox + meta */}
                    <Flex gap={4} align="flex-start" flex={1} minW={0}>
                      {/* Checkbox */}
                      <Box
                        w="22px" h="22px" borderRadius="7px"
                        border="2px solid"
                        borderColor={isExcluded ? "#D1D5DB" : "#4F46E5"}
                        bg={isExcluded ? "white" : "#4F46E5"}
                        cursor="pointer" flexShrink={0} mt="2px"
                        display="flex" alignItems="center" justifyContent="center"
                        onClick={() => setExcludedSlots(prev => {
                          const next = new Set(prev);
                          next.has(slot.slot_index) ? next.delete(slot.slot_index) : next.add(slot.slot_index);
                          return next;
                        })}
                        transition="all 0.1s ease"
                      >
                        {!isExcluded && <Text color="white" fontSize="12px" fontWeight="800" lineHeight="1">✓</Text>}
                      </Box>

                      <Box flex={1} minW={0}>
                        {/* Day + time + badges */}
                        <Flex align="center" gap={2} flexWrap="wrap" mb={2}>
                          <Text fontSize="16px" fontWeight="700" color="#1F2937">{slot.day_label}</Text>
                          <Flex align="center" gap={1} color="#6B7280">
                            <Clock size={13} />
                            <Text fontSize="13px" fontWeight="500">{slot.suggested_time}</Text>
                          </Flex>
                          <Badge bg={fmtColors.bg} color={fmtColors.color} px={2.5} py={1} borderRadius="8px" fontSize="11px" fontWeight="700" textTransform="uppercase">
                            {slot.post_format.replace("_", " ")}
                          </Badge>
                          <Badge bg="#F3F4F6" color="#6B7280" px={2.5} py={1} borderRadius="8px" fontSize="11px" fontWeight="600">
                            {slot.ad_type.replace(/_/g, " ")}
                          </Badge>
                        </Flex>

                        {/* Reasoning */}
                        <Text
                          fontSize="13px" color="#4B5563" lineHeight="1.6"
                          display={isExpanded ? "block" : "-webkit-box"}
                          style={!isExpanded ? { WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}}
                          mb={1}
                        >
                          {slot.reasoning}
                        </Text>
                        {slot.reasoning.length > 120 && (
                          <Text
                            fontSize="12px" fontWeight="600" color="#4F46E5" cursor="pointer"
                            display="inline-block"
                            onClick={() => setExpandedReasonings(prev => {
                              const next = new Set(prev);
                              next.has(slot.slot_index) ? next.delete(slot.slot_index) : next.add(slot.slot_index);
                              return next;
                            })}
                          >
                            {isExpanded ? "Show less" : "Show more"}
                          </Text>
                        )}
                      </Box>
                    </Flex>

                    {/* Right — asset picker */}
                    <Box
                      w={{ base: "full", md: "280px" }}
                      flexShrink={0}
                      p={4}
                      borderRadius="14px"
                      bg="#F9FAFB"
                      border="1px solid #E5E7EB"
                    >
                      {picked ? (
                        <Box>
                          <Text fontSize="12px" fontWeight="600" color="#374151" mb={2}>Selected asset</Text>
                          <Flex gap={3} align="center">
                            <Box
                              w="80px" h="80px" borderRadius="12px" overflow="hidden"
                              border="2px solid #4F46E5" flexShrink={0}
                              cursor="pointer"
                              _hover={{ opacity: 0.85 }}
                              transition="opacity 0.15s ease"
                              onClick={() => setPreviewAsset({ asset: picked, slotIndex: slot.slot_index })}
                            >
                              <Image src={picked.asset_url} alt="Selected" w="100%" h="100%" objectFit="cover" />
                            </Box>
                            <Box flex={1}>
                              <Badge bg={fmtColors.bg} color={fmtColors.color} px={2} py={0.5} borderRadius="6px" fontSize="11px" fontWeight="700" mb={1} textTransform="capitalize">
                                {picked.format.replace("_", " ")}
                              </Badge>
                              <Text fontSize="11px" color="#4F46E5" fontWeight="600" mb={1}>Asset selected</Text>
                              <Text fontSize="11px" color="#9CA3AF" mb={2}>Click image to preview</Text>
                              <Text
                                fontSize="11px" color="#6B7280" fontWeight="600"
                                cursor="pointer" display="inline-block"
                                _hover={{ color: "#DC2626" }}
                                onClick={() => setSlotAssets(prev => { const next = { ...prev }; delete next[slot.slot_index]; return next; })}
                              >
                                ✕ Remove
                              </Text>
                            </Box>
                          </Flex>
                        </Box>
                      ) : formatAssets.length === 0 ? (
                        <Box>
                          <Text fontSize="12px" fontWeight="600" color="#374151" mb={2}>Asset</Text>
                          <Flex align="center" gap={2} p={3} borderRadius="10px" bg="#FEF3C7" border="1px solid #FDE68A">
                            <AlertCircle size={13} color="#D97706" style={{ flexShrink: 0 }} />
                            <Text fontSize="12px" color="#92400E">No {slot.post_format.replace("_", " ")} assets available</Text>
                          </Flex>
                        </Box>
                      ) : (
                        <Box>
                          <Text fontSize="12px" fontWeight="600" color="#374151" mb={2}>
                            Pick an asset <Text as="span" color="#9CA3AF" fontWeight="400">({formatAssets.length} available)</Text>
                          </Text>
                          <Flex gap={2} flexWrap="wrap">
                            {formatAssets.map(asset => (
                              <Box
                                key={asset.asset_id}
                                w="72px" h="72px" borderRadius="10px" overflow="hidden"
                                border="2px solid transparent"
                                cursor="pointer" flexShrink={0}
                                transition="all 0.15s ease"
                                _hover={{ borderColor: "#4F46E5", transform: "scale(1.06)", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}
                                onClick={() => setPreviewAsset({ asset, slotIndex: slot.slot_index })}
                              >
                                <Image src={asset.asset_url} alt="Asset" w="100%" h="100%" objectFit="cover" />
                              </Box>
                            ))}
                          </Flex>
                          <Text fontSize="11px" color="#9CA3AF" mt={2}>Click to preview & select</Text>
                        </Box>
                      )}
                    </Box>
                  </Flex>
                </Box>
              );
            })}
          </VStack>

          {/* Bottom action bar */}
          <Box
            position="sticky" bottom={0}
            bg="white" border="1px solid #E5E7EB"
            borderRadius="20px" p={5}
            boxShadow="0 -4px 24px rgba(0,0,0,0.08)"
          >
            <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
              <Box>
                <Text fontSize="14px" fontWeight="700" color="#111111">
                  {readySlots.length} post{readySlots.length !== 1 ? "s" : ""} ready to schedule
                </Text>
                <Text fontSize="12px" color="#9CA3AF">
                  {confirmedSlots.length - readySlots.length > 0
                    ? `${confirmedSlots.length - readySlots.length} slot${confirmedSlots.length - readySlots.length > 1 ? "s" : ""} still need an asset`
                    : "All selected slots have assets assigned"}
                </Text>
              </Box>
              <Flex gap={3}>
                <Button
                  bg="#F3F4F6" color="#374151" borderRadius="12px" h="48px" px={5}
                  fontSize="14px" fontWeight="600" _hover={{ bg: "#E5E7EB" }}
                  onClick={() => setStep("configure")}
                >
                  Back
                </Button>
                <Button
                  bg={readySlots.length === 0 ? "#E5E7EB" : "#4F46E5"}
                  color={readySlots.length === 0 ? "#9CA3AF" : "white"}
                  borderRadius="12px" h="48px" px={6}
                  fontSize="14px" fontWeight="700"
                  shadow={readySlots.length === 0 ? "none" : "md"}
                  _hover={readySlots.length === 0 ? {} : { bg: "#4338CA", shadow: "lg" }}
                  disabled={readySlots.length === 0 || isConfirming}
                  loading={isConfirming}
                  onClick={handleConfirm}
                >
                  <Flex align="center" gap={2}>
                    <CheckCircle size={17} strokeWidth={2.5} />
                    Schedule {readySlots.length} Post{readySlots.length !== 1 ? "s" : ""}
                  </Flex>
                </Button>
              </Flex>
            </Flex>
            {confirmError && (
              <Flex align="flex-start" gap={3} p={3} borderRadius="10px" bg="#FEF2F2" border="1px solid #FECACA" mt={3}>
                <AlertCircle size={15} color="#DC2626" style={{ marginTop: 1, flexShrink: 0 }} />
                <Text fontSize="13px" color="#DC2626" fontWeight="500">{confirmError}</Text>
              </Flex>
            )}
          </Box>
        </VStack>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          STEP 4 — Confirmed
      ══════════════════════════════════════════════════════════════════ */}
      {step === "confirmed" && proposal && (
        <Box bg="white" border="1px solid #E5E7EB" borderRadius="24px" p={10} boxShadow="0 4px 24px rgba(0,0,0,0.05)">
          <Flex direction="column" align="center" py={8} gap={6}>
            <Flex w="88px" h="88px" borderRadius="24px" bg="#D1FAE5" align="center" justify="center" color="#059669">
              <CheckCircle size={44} strokeWidth={1.5} />
            </Flex>
            <VStack gap={2} textAlign="center">
              <Text fontSize="28px" fontWeight="800" color="#111111">Batch Scheduled!</Text>
              <Text fontSize="15px" color="#6B7280" maxW="400px" lineHeight="1.7">
                {readySlots.length} post{readySlots.length !== 1 ? "s" : ""} have been queued for publishing.
                The scheduler will handle the rest automatically.
              </Text>
            </VStack>

            {/* Summary */}
            <Box w="full" maxW="400px" p={5} borderRadius="16px" bg="#F9FAFB" border="1px solid #E5E7EB">
              <VStack gap={3} align="stretch">
                {[
                  { label: "Batch name",  value: proposal.batch_name },
                  { label: "Total posts", value: `${readySlots.length}` },
                  { label: "Date range",  value: formatDateRange(startDate, confirmedSlots) },
                  { label: "Cadence",     value: cadence === "biweekly" ? "Bi-weekly" : "Weekly" },
                  ...(createdBatchId ? [{ label: "Batch ID", value: createdBatchId.slice(0, 8) + "…" }] : []),
                ].map(row => (
                  <Flex key={row.label} justify="space-between" align="center">
                    <Text fontSize="13px" color="#6B7280">{row.label}</Text>
                    <Text fontSize="13px" fontWeight="600" color="#1F2937">{row.value}</Text>
                  </Flex>
                ))}
              </VStack>
            </Box>

            <Flex gap={3}>
              <Button
                bg="#4F46E5" color="white" borderRadius="14px" h="52px" px={8}
                fontSize="15px" fontWeight="700" shadow="md" _hover={{ bg: "#4338CA", shadow: "lg" }}
                onClick={handleReset}
              >
                Schedule another batch
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* ── Asset preview lightbox ─────────────────────────────────────────── */}
      {previewAsset && (
        <Box
          position="fixed" inset="0" zIndex={2000}
          display="flex" alignItems="center" justifyContent="center"
          bg="rgba(0,0,0,0.82)" style={{ backdropFilter: "blur(6px)" }}
          onClick={() => setPreviewAsset(null)}
        >
          <Box
            position="relative" maxW="600px" maxH="85vh" w="92%"
            borderRadius="22px" overflow="hidden"
            boxShadow="0 24px 80px rgba(0,0,0,0.5)"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <Button
              position="absolute" top={3} right={3} zIndex={1}
              variant="ghost" w="36px" h="36px" p={0} minW="unset"
              borderRadius="50%" bg="rgba(0,0,0,0.5)" color="white"
              _hover={{ bg: "rgba(0,0,0,0.7)" }}
              onClick={() => setPreviewAsset(null)}
              aria-label="Close preview"
            >
              <X size={17} strokeWidth={2.5} />
            </Button>

            {/* Full image */}
            <Image
              src={previewAsset.asset.asset_url}
              alt="Asset preview"
              w="100%" h="auto" maxH="68vh"
              objectFit="contain" display="block" bg="#111"
            />

            {/* Footer */}
            <Flex align="center" justify="space-between" px={6} py={5} bg="white" gap={4} flexWrap="wrap">
              <Box>
                <Badge
                  bg={formatBadgeColors(previewAsset.asset.format).bg}
                  color={formatBadgeColors(previewAsset.asset.format).color}
                  px={3} py={1.5} borderRadius="8px" fontSize="12px" fontWeight="700" textTransform="capitalize"
                >
                  {previewAsset.asset.format.replace("_", " ")}
                </Badge>
                <Text fontSize="12px" color="#9CA3AF" mt={1}>
                  {previewAsset.asset.ad_type.replace(/_/g, " ")} · {previewAsset.asset.source}
                </Text>
              </Box>
              <Flex gap={2}>
                <Button
                  bg="#F3F4F6" color="#374151" borderRadius="10px" h="44px" px={4}
                  fontSize="13px" fontWeight="600" _hover={{ bg: "#E5E7EB" }}
                  onClick={() => setPreviewAsset(null)}
                >
                  Close
                </Button>
                {/* Only show "Select" when opened from a slot (slotIndex >= 0) */}
                {previewAsset.slotIndex >= 0 && (
                  <Button
                    bg={slotAssets[previewAsset.slotIndex]?.asset_id === previewAsset.asset.asset_id ? "#10B981" : "#4F46E5"}
                    color="white" borderRadius="10px" h="44px" px={5}
                    fontSize="13px" fontWeight="700" shadow="sm" _hover={{ opacity: 0.9 }}
                    onClick={() => {
                      setSlotAssets(prev => ({ ...prev, [previewAsset.slotIndex]: previewAsset.asset }));
                      setPreviewAsset(null);
                    }}
                  >
                    {slotAssets[previewAsset.slotIndex]?.asset_id === previewAsset.asset.asset_id ? "✓ Selected" : "Select this asset"}
                  </Button>
                )}
              </Flex>
            </Flex>
          </Box>
        </Box>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </VStack>
  );
}
