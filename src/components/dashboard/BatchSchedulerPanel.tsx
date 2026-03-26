"use client";

import { useState, useEffect } from "react";
import { Box, Button, Flex, Text, VStack, Badge, Image } from "@chakra-ui/react";
import { Calendar, Sparkles, Clock, ChevronRight, CheckCircle, AlertCircle, X, Loader } from "lucide-react";
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
  slide_asset_urls?: string[];  // all slide URLs for carousel posts
  reasoning: string;
}

interface BatchProposal {
  batch_name: string;
  slots: BatchSlot[];
  inventory_gaps: string[];
  timing_strategy: string;
}

interface BatchSchedulerPanelProps {
  brandId: string;
  brandName: string;
  availableAssets: AssetInventoryItem[];
  onClose: () => void;
  onBatchCreated: () => void;
}

// ── Step type ─────────────────────────────────────────────────────────────────

type Step = "configure" | "generating" | "review" | "confirmed";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBadgeColors(postFormat: string): { bg: string; color: string } {
  switch (postFormat) {
    case "stories":
      return { bg: "#F3E8FF", color: "#7C3AED" };
    case "feed":
      return { bg: "#DBEAFE", color: "#1D4ED8" };
    case "feed_4_5":
      return { bg: "#E0E7FF", color: "#4338CA" };
    case "carousel":
      return { bg: "#FEF3C7", color: "#B45309" };
    default:
      return { bg: "#F3F4F6", color: "#374151" };
  }
}

function countAssetsByFormat(assets: AssetInventoryItem[]): Record<string, number> {
  return assets.reduce<Record<string, number>>((acc, asset) => {
    acc[asset.format] = (acc[asset.format] || 0) + 1;
    return acc;
  }, {});
}

function buildScheduledAt(startDate: string, dayOffset: number, suggestedTime: string): string {
  if (!startDate) return new Date().toISOString();
  // Append T00:00:00 so the date is parsed as local midnight, not UTC midnight
  const base = new Date(startDate + "T00:00:00");
  if (isNaN(base.getTime())) return new Date().toISOString();
  base.setDate(base.getDate() + dayOffset);
  const safeTime = (suggestedTime || "09:00").replace(/[^0-9:]/g, "");
  const parts = safeTime.split(":").map((n) => parseInt(n, 10));
  const hours = isNaN(parts[0]) ? 9 : Math.min(parts[0], 23);
  const minutes = isNaN(parts[1]) ? 0 : Math.min(parts[1], 59);
  base.setHours(hours, minutes, 0, 0);
  return base.toISOString();
}

function formatDateRange(startDate: string, slots: BatchSlot[]): string {
  if (slots.length === 0) return startDate;
  const maxOffset = Math.max(...slots.map(s => s.day_offset));
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setDate(end.getDate() + maxOffset);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BatchSchedulerPanel({
  brandId,
  brandName,
  availableAssets,
  onClose,
  onBatchCreated,
}: BatchSchedulerPanelProps) {
  // Step 1 — Configure
  const todayStr = new Date().toISOString().split("T")[0];
  const [cadence, setCadence] = useState<"weekly" | "biweekly">("weekly");
  const [startDate, setStartDate] = useState(todayStr);
  const [postCount, setPostCount] = useState(7);
  const [allowMultiplePerDay, setAllowMultiplePerDay] = useState(false);

  // Step state
  const [step, setStep] = useState<Step>("configure");
  const [proposeError, setProposeError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<BatchProposal | null>(null);

  // Streaming state (no thinking text — removed)
  const [streamPhase, setStreamPhase] = useState<"brand" | "inventory" | "building" | "done">("brand");
  const [streamBrand, setStreamBrand] = useState<{ name: string; industry: string } | null>(null);
  const [streamInventory, setStreamInventory] = useState<{ format_counts: Record<string, number>; total: number } | null>(null);
  const [streamStatus, setStreamStatus] = useState("Initialising…");

  // Step 3 — per-slot manual asset selection
  const [slotAssets, setSlotAssets] = useState<Record<number, AssetInventoryItem>>({});

  // Step 3 — Review: excluded slot indices
  const [excludedSlots, setExcludedSlots] = useState<Set<number>>(new Set());
  const [expandedReasonings, setExpandedReasonings] = useState<Set<number>>(new Set());

  // Step 4 — Confirmed
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);

  // Self-fetched inventory from library_images
  const [fetchedAssets, setFetchedAssets] = useState<AssetInventoryItem[]>([]);

  useEffect(() => {
    async function fetchLibraryInventory() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get image_ids that have rating >= 5
      const { data: feedbackRows } = await supabase
        .from("image_feedback")
        .select("image_id")
        .eq("user_id", user.id)
        .gte("rating", 4);

      const ratedIds = feedbackRows?.map((f: { image_id: string }) => f.image_id) ?? [];
      if (ratedIds.length === 0) {
        setFetchedAssets([]);
        return;
      }

      // 2. Get already-published asset URLs so we can exclude them
      const { data: publishedRows } = await supabase
        .from("scheduled_instagram_posts")
        .select("media_url")
        .eq("user_id", user.id)
        .eq("status", "published");

      const publishedUrls = new Set(
        (publishedRows ?? []).map((p: { media_url: string | null }) => p.media_url).filter(Boolean)
      );

      // 3. Fetch library_images filtered to rated IDs only
      const { data: rows, error } = await supabase
        .from("library_images")
        .select("id, storage_path, external_url, format, label")
        .eq("user_id", user.id)
        .in("id", ratedIds);

      if (error || !rows) return;

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
    }

    fetchLibraryInventory();
  }, []);

  const assetsByFormat = countAssetsByFormat(fetchedAssets);

  // ── Step 1 handlers ──────────────────────────────────────────────────────

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
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as Record<string, string>).error || "Failed to generate proposal");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse complete SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            switch (event.type) {
              case "status":
                setStreamStatus(event.message);
                break;
              case "brand_loaded":
                setStreamBrand({ name: event.brand_name, industry: event.industry });
                setStreamPhase("inventory");
                break;
              case "inventory":
                setStreamInventory({ format_counts: event.format_counts, total: event.total });
                setStreamPhase("building");
                break;
              case "thinking":
                // intentionally suppressed
                break;
              case "building":
                setStreamPhase("building");
                setStreamStatus(event.message || "Building your schedule…");
                break;
              case "done":
                setProposal(event.proposal as BatchProposal);
                setExcludedSlots(new Set());
                setExpandedReasonings(new Set());
                setStreamPhase("done");
                setStep("review");
                break;
              case "error":
                throw new Error(event.message);
            }
          } catch (parseErr) {
            if (parseErr instanceof SyntaxError) continue; // incomplete chunk
            throw parseErr;
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Proposal failed";
      setProposeError(message);
      setStep("configure");
    }
  };

  // ── Step 3 handlers ──────────────────────────────────────────────────────

  const toggleSlot = (idx: number) => {
    setExcludedSlots(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const toggleReasoning = (idx: number) => {
    setExpandedReasonings(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const confirmedSlotsList = proposal
    ? proposal.slots.filter(s => !excludedSlots.has(s.slot_index))
    : [];
  // Only slots that have an asset picked can be confirmed
  const readySlots = confirmedSlotsList.filter(s => !!slotAssets[s.slot_index]);

  // ── Step 4 handlers ──────────────────────────────────────────────────────

  const handleConfirmBatch = async () => {
    if (!proposal || readySlots.length === 0) return;
    setConfirmError(null);
    setIsConfirming(true);

    try {
      const slotsWithScheduledAt = readySlots.map(slot => {
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

      // Calculate ends_at from last slot
      const maxOffset = Math.max(...readySlots.map(s => s.day_offset));
      const lastSlot = readySlots.find(s => s.day_offset === maxOffset)!;
      const endsAt = buildScheduledAt(startDate, lastSlot.day_offset, lastSlot.suggested_time);
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
          confirmed_slots: slotsWithScheduledAt,
          composition_config: {
            cadence,
            post_count: confirmedSlotsList.length,
            timing_strategy: proposal.timing_strategy,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create batch");
      }

      setCreatedBatchId(data.batch_id);
      setStep("confirmed");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Batch creation failed";
      setConfirmError(message);
    } finally {
      setIsConfirming(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Box
      position="fixed"
      inset="0"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="rgba(0,0,0,0.55)"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Box
        bg="white"
        border="1px solid #E5E7EB"
        borderRadius="24px"
        w="100%"
        maxW="640px"
        maxH="90vh"
        overflowY="auto"
        mx={4}
        boxShadow="0 20px 60px rgba(0,0,0,0.18)"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Flex
          align="center"
          justify="space-between"
          px={6}
          py={5}
          borderBottom="1px solid #F3F4F6"
          bg="#F9FAFB"
          borderTopRadius="24px"
          position="sticky"
          top={0}
          zIndex={1}
        >
          <Flex align="center" gap={3}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="#EEF2FF"
              align="center"
              justify="center"
              color="#4F46E5"
            >
              <Sparkles size={18} strokeWidth={2} />
            </Flex>
            <Box>
              <Text fontSize="17px" fontWeight="700" color="#111111" lineHeight="1.2">
                AI Batch Scheduler
              </Text>
              {brandName && (
                <Text fontSize="12px" color="#6B7280">
                  {brandName}
                </Text>
              )}
            </Box>
          </Flex>
          <Button
            variant="ghost"
            h="32px"
            w="32px"
            p={0}
            borderRadius="8px"
            color="#6B7280"
            bg="transparent"
            _hover={{ bg: "#F3F4F6", color: "#111111" }}
            onClick={onClose}
            aria-label="Close panel"
          >
            <X size={18} strokeWidth={2.5} />
          </Button>
        </Flex>

        {/* Step indicator */}
        <Flex px={6} pt={4} pb={2} gap={2} align="center">
          {(["configure", "generating", "review", "confirmed"] as Step[]).map((s, i) => {
            const stepLabels: Record<Step, string> = {
              configure: "Configure",
              generating: "Generating",
              review: "Review",
              confirmed: "Done",
            };
            const stepOrder: Step[] = ["configure", "generating", "review", "confirmed"];
            const currentIndex = stepOrder.indexOf(step);
            const thisIndex = i;
            const isPast = thisIndex < currentIndex;
            const isCurrent = thisIndex === currentIndex;

            return (
              <Flex key={s} align="center" gap={2}>
                {i > 0 && (
                  <Box
                    flex={1}
                    h="1px"
                    bg={isPast || isCurrent ? "#4F46E5" : "#E5E7EB"}
                    w="20px"
                  />
                )}
                <Flex align="center" gap={1.5}>
                  <Flex
                    w="22px"
                    h="22px"
                    borderRadius="50%"
                    align="center"
                    justify="center"
                    fontSize="11px"
                    fontWeight="700"
                    bg={isCurrent ? "#4F46E5" : isPast ? "#10B981" : "#E5E7EB"}
                    color={isCurrent || isPast ? "white" : "#9CA3AF"}
                  >
                    {isPast ? "✓" : i + 1}
                  </Flex>
                  <Text
                    fontSize="12px"
                    fontWeight={isCurrent ? "700" : "500"}
                    color={isCurrent ? "#4F46E5" : isPast ? "#10B981" : "#9CA3AF"}
                    display={{ base: "none", sm: "block" }}
                  >
                    {stepLabels[s]}
                  </Text>
                </Flex>
              </Flex>
            );
          })}
        </Flex>

        {/* Body */}
        <Box px={6} pb={6} pt={2}>
          {/* ── Step 1: Configure ───────────────────────────────────────── */}
          {step === "configure" && (
            <VStack gap={5} align="stretch" pt={2}>
              {proposeError && (
                <Flex
                  align="flex-start"
                  gap={3}
                  p={4}
                  borderRadius="12px"
                  bg="#FEF2F2"
                  border="1px solid #FECACA"
                >
                  <AlertCircle size={16} color="#DC2626" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Text fontSize="13px" color="#DC2626" fontWeight="500">
                    {proposeError}
                  </Text>
                </Flex>
              )}

              {/* Asset inventory summary */}
              <Box
                p={4}
                borderRadius="14px"
                bg="#F9FAFB"
                border="1px solid #E5E7EB"
              >
                <Text fontSize="13px" fontWeight="600" color="#374151" mb={3}>
                  Available Assets ({fetchedAssets.length} total)
                </Text>
                {fetchedAssets.length === 0 ? (
                  <Box>
                    <Flex align="flex-start" gap={2.5} p={3} borderRadius="10px" bg="#FEF3C7" border="1px solid #FDE68A" mb={3}>
                      <AlertCircle size={15} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                      <Box>
                        <Text fontSize="13px" fontWeight="700" color="#92400E" mb={1}>
                          No assets in your library yet
                        </Text>
                        <Text fontSize="12px" color="#92400E" lineHeight="1.5">
                          The AI will propose a posting plan, but all slots will be marked as needing assets. You can generate or upload assets after reviewing the schedule.
                        </Text>
                      </Box>
                    </Flex>
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="12px" fontWeight="600" color="#6B7280" mb={0.5}>What the AI will plan for you:</Text>
                      {[
                        { format: "Feed posts", desc: "Static images for product/brand awareness" },
                        { format: "Stories", desc: "Short-form vertical content for daily engagement" },
                        { format: "Carousels", desc: "Multi-slide educational or showcase content" },
                      ].map((item) => (
                        <Flex key={item.format} align="center" gap={2.5} p={2.5} borderRadius="8px" bg="white" border="1px solid #E5E7EB">
                          <Box w="8px" h="8px" borderRadius="50%" bg="#FCD34D" flexShrink={0} />
                          <Box>
                            <Text fontSize="12px" fontWeight="600" color="#374151">{item.format}</Text>
                            <Text fontSize="11px" color="#9CA3AF">{item.desc}</Text>
                          </Box>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                ) : (
                  <Flex gap={2} flexWrap="wrap">
                    {Object.entries(assetsByFormat).map(([format, count]) => {
                      const colors = formatBadgeColors(format);
                      return (
                        <Badge
                          key={format}
                          bg={colors.bg}
                          color={colors.color}
                          px={2.5}
                          py={1}
                          borderRadius="8px"
                          fontSize="12px"
                          fontWeight="600"
                          textTransform="capitalize"
                        >
                          {format.replace("_", " ")}: {count}
                        </Badge>
                      );
                    })}
                  </Flex>
                )}
              </Box>

              {/* Cadence */}
              <Box>
                <Text fontSize="14px" fontWeight="600" color="#374151" mb={2}>
                  Posting Cadence
                </Text>
                <Flex gap={3}>
                  {(["weekly", "biweekly"] as const).map((c) => (
                    <Box
                      key={c}
                      flex={1}
                      p={3}
                      borderRadius="12px"
                      border="2px solid"
                      borderColor={cadence === c ? "#4F46E5" : "#E5E7EB"}
                      bg={cadence === c ? "#EEF2FF" : "white"}
                      cursor="pointer"
                      onClick={() => setCadence(c)}
                      transition="all 0.15s ease"
                      _hover={{ borderColor: cadence === c ? "#4F46E5" : "#C7D2FE" }}
                      textAlign="center"
                    >
                      <Text
                        fontSize="14px"
                        fontWeight="700"
                        color={cadence === c ? "#4F46E5" : "#374151"}
                        textTransform="capitalize"
                      >
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
                <Text fontSize="14px" fontWeight="600" color="#374151" mb={2}>
                  Start Date
                </Text>
                <Flex align="center" gap={2}>
                  <Calendar size={16} color="#6B7280" style={{ flexShrink: 0 }} />
                  <input
                    type="date"
                    value={startDate}
                    min={todayStr}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "12px",
                      border: "1px solid #D1D5DB",
                      background: "white",
                      fontSize: "14px",
                      color: "#1F2937",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#4F46E5";
                      e.target.style.boxShadow = "0 0 0 3px rgba(79, 70, 229, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#D1D5DB";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </Flex>
              </Box>

              {/* Post count */}
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontSize="14px" fontWeight="600" color="#374151">
                    Target Post Count
                  </Text>
                  <Flex
                    align="center"
                    justify="center"
                    bg="#EEF2FF"
                    color="#4F46E5"
                    borderRadius="8px"
                    px={2.5}
                    py={0.5}
                    minW="36px"
                  >
                    <Text fontSize="14px" fontWeight="700">{postCount}</Text>
                  </Flex>
                </Flex>
                <input
                  type="range"
                  min={3}
                  max={14}
                  step={1}
                  value={postCount}
                  onChange={(e) => setPostCount(Number(e.target.value))}
                  style={{
                    width: "100%",
                    accentColor: "#4F46E5",
                    cursor: "pointer",
                  }}
                />
                <Flex justify="space-between" mt={1}>
                  <Text fontSize="11px" color="#9CA3AF">3 posts</Text>
                  <Text fontSize="11px" color="#9CA3AF">14 posts</Text>
                </Flex>
              </Box>

              {/* Multiple posts per day toggle */}
              <Flex
                align="center"
                justify="space-between"
                p={3.5}
                borderRadius="12px"
                bg="#F9FAFB"
                border="1px solid #E5E7EB"
                cursor="pointer"
                onClick={() => setAllowMultiplePerDay((v) => !v)}
                _hover={{ bg: "#F3F4F6" }}
                transition="background 0.1s ease"
              >
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#374151">
                    Multiple posts per day
                  </Text>
                  <Text fontSize="12px" color="#9CA3AF" mt={0.5}>
                    {allowMultiplePerDay
                      ? "Up to 2 feed posts/day with 6h gap · Stories anytime"
                      : "One feed post per day (recommended for new accounts)"}
                  </Text>
                </Box>
                <Box
                  w="40px"
                  h="22px"
                  borderRadius="11px"
                  bg={allowMultiplePerDay ? "#4F46E5" : "#D1D5DB"}
                  position="relative"
                  transition="background 0.2s ease"
                  flexShrink={0}
                >
                  <Box
                    position="absolute"
                    top="3px"
                    left={allowMultiplePerDay ? "21px" : "3px"}
                    w="16px"
                    h="16px"
                    borderRadius="50%"
                    bg="white"
                    boxShadow="0 1px 3px rgba(0,0,0,0.2)"
                    transition="left 0.2s ease"
                  />
                </Box>
              </Flex>

              {/* CTA */}
              <Button
                bg="#4F46E5"
                color="white"
                borderRadius="14px"
                h="48px"
                fontSize="15px"
                fontWeight="700"
                shadow="sm"
                _hover={{ bg: "#4338CA", shadow: "md" }}
                onClick={handleGenerate}
                mt={1}
              >
                <Flex align="center" gap={2}>
                  <Sparkles size={17} strokeWidth={2.5} />
                  Generate AI Proposal
                  <ChevronRight size={17} strokeWidth={2.5} />
                </Flex>
              </Button>
            </VStack>
          )}

          {/* ── Step 2: Generating (streaming) ──────────────────────────── */}
          {step === "generating" && (
            <Flex direction="column" align="center" justify="center" py={12} gap={6}>
              {/* Phase strip */}
              <Flex gap={2} align="center">
                {([
                  { key: "brand", label: "Brand", icon: "🏷" },
                  { key: "inventory", label: "Inventory", icon: "📦" },
                  { key: "building", label: "Schedule", icon: "📅" },
                ] as { key: typeof streamPhase; label: string; icon: string }[]).map((phase, i) => {
                  const phaseOrder = ["brand", "inventory", "building", "done"];
                  const currentIdx = phaseOrder.indexOf(streamPhase);
                  const phaseIdx = phaseOrder.indexOf(phase.key);
                  const isDone = currentIdx > phaseIdx;
                  const isActive = currentIdx === phaseIdx;
                  return (
                    <Flex key={phase.key} align="center" gap={1.5}>
                      {i > 0 && <Box w="20px" h="1px" bg={isDone ? "#10B981" : "#E5E7EB"} />}
                      <Flex
                        align="center"
                        gap={1.5}
                        px={2.5}
                        py={1.5}
                        borderRadius="20px"
                        bg={isDone ? "#D1FAE5" : isActive ? "#EEF2FF" : "#F3F4F6"}
                        border="1px solid"
                        borderColor={isDone ? "#6EE7B7" : isActive ? "#C7D2FE" : "#E5E7EB"}
                        transition="all 0.3s ease"
                      >
                        <Text fontSize="13px">{phase.icon}</Text>
                        <Text fontSize="12px" fontWeight="700" color={isDone ? "#065F46" : isActive ? "#4F46E5" : "#9CA3AF"}>
                          {phase.label}
                        </Text>
                        {isActive && <Loader size={11} strokeWidth={2.5} color="#4F46E5" style={{ animation: "spin 1.2s linear infinite" }} />}
                        {isDone && <Text fontSize="11px" color="#059669">✓</Text>}
                      </Flex>
                    </Flex>
                  );
                })}
              </Flex>

              {/* Brand + inventory info */}
              {(streamBrand || streamInventory) && (
                <Flex gap={2} flexWrap="wrap" justify="center">
                  {streamBrand && (
                    <Badge bg="#EEF2FF" color="#4F46E5" px={3} py={1.5} borderRadius="8px" fontSize="12px" fontWeight="600">
                      {streamBrand.name} · {streamBrand.industry}
                    </Badge>
                  )}
                  {streamInventory && Object.entries(streamInventory.format_counts).map(([fmt, cnt]) => {
                    const colors = formatBadgeColors(fmt);
                    return (
                      <Badge key={fmt} bg={colors.bg} color={colors.color} px={2.5} py={1.5} borderRadius="8px" fontSize="12px" fontWeight="600" textTransform="capitalize">
                        {fmt.replace("_", " ")}: {cnt}
                      </Badge>
                    );
                  })}
                </Flex>
              )}

              {/* Status */}
              <Flex align="center" gap={2}>
                {streamPhase !== "done" && (
                  <Loader size={14} strokeWidth={2} color="#4F46E5" style={{ animation: "spin 1.2s linear infinite" }} />
                )}
                <Text fontSize="14px" color="#6B7280" fontWeight="500">{streamStatus}</Text>
              </Flex>
            </Flex>
          )}

          {/* ── Step 3: Review ──────────────────────────────────────────── */}
          {step === "review" && proposal && (
            <VStack gap={4} align="stretch" pt={2}>
              {/* Batch header */}
              <Box>
                <Text fontSize="16px" fontWeight="700" color="#111111">
                  {proposal.batch_name}
                </Text>
                <Flex align="center" gap={3} mt={1} flexWrap="wrap">
                  <Flex align="center" gap={1.5} fontSize="13px" color="#6B7280">
                    <Calendar size={14} />
                    <Text fontWeight="500">
                      {formatDateRange(startDate, proposal.slots)}
                    </Text>
                  </Flex>
                  <Badge
                    bg="#D1FAE5"
                    color="#065F46"
                    px={2.5}
                    py={1}
                    borderRadius="8px"
                    fontSize="12px"
                    fontWeight="600"
                  >
                    {confirmedSlotsList.length} / {proposal.slots.length} posts selected
                  </Badge>
                  <Badge
                    bg="#E0E7FF"
                    color="#3730A3"
                    px={2.5}
                    py={1}
                    borderRadius="8px"
                    fontSize="12px"
                    fontWeight="600"
                    textTransform="capitalize"
                  >
                    {cadence === "biweekly" ? "Bi-weekly" : "Weekly"}
                  </Badge>
                </Flex>
              </Box>

              {/* Inventory gaps warning + generate plan — only shown when no assets at all */}
              {fetchedAssets.length === 0 && proposal.inventory_gaps.length > 0 && (
                <Box
                  p={4}
                  borderRadius="12px"
                  bg="#FFFBEB"
                  border="1px solid #FDE68A"
                >
                  <Flex align="flex-start" gap={3} mb={3}>
                    <AlertCircle size={16} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                    <Box flex={1}>
                      <Text fontSize="13px" fontWeight="700" color="#92400E" mb={1.5}>
                        Inventory Gaps — {proposal.inventory_gaps.length} missing asset{proposal.inventory_gaps.length > 1 ? "s" : ""}
                      </Text>
                      <VStack align="stretch" gap={1}>
                        {proposal.inventory_gaps.map((gap, i) => (
                          <Text key={i} fontSize="12px" color="#92400E" lineHeight="1.5">
                            • {gap}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  </Flex>
                  <Box pt={3} borderTop="1px solid #FDE68A">
                    <Text fontSize="12px" fontWeight="600" color="#92400E" mb={2}>
                      Options to fill these gaps:
                    </Text>
                    <Flex gap={2} flexWrap="wrap">
                      <Button
                        size="sm"
                        bg="#4F46E5"
                        color="white"
                        borderRadius="8px"
                        h="32px"
                        fontSize="12px"
                        fontWeight="600"
                        _hover={{ bg: "#4338CA" }}
                        onClick={() => { onClose(); }}
                      >
                        <Flex align="center" gap={1.5}>
                          <Sparkles size={13} strokeWidth={2.5} />
                          Generate assets with AI
                        </Flex>
                      </Button>
                      <Button
                        size="sm"
                        bg="white"
                        color="#92400E"
                        borderRadius="8px"
                        h="32px"
                        fontSize="12px"
                        fontWeight="600"
                        border="1px solid #FDE68A"
                        _hover={{ bg: "#FEF9EC" }}
                        onClick={() => { onClose(); }}
                      >
                        Upload assets first
                      </Button>
                      <Button
                        size="sm"
                        bg="white"
                        color="#6B7280"
                        borderRadius="8px"
                        h="32px"
                        fontSize="12px"
                        fontWeight="600"
                        border="1px solid #E5E7EB"
                        _hover={{ bg: "#F9FAFB" }}
                        onClick={() => {
                          // Deselect all slots with no asset
                          const noAssetIndices = proposal.slots
                            .filter((s) => !s.asset_url)
                            .map((s) => s.slot_index);
                          setExcludedSlots(new Set(noAssetIndices));
                        }}
                      >
                        Skip empty slots
                      </Button>
                    </Flex>
                  </Box>
                </Box>
              )}

              {/* Timing strategy note */}
              {proposal.timing_strategy && (
                <Flex
                  align="flex-start"
                  gap={2}
                  p={3}
                  borderRadius="10px"
                  bg="#F0F9FF"
                  border="1px solid #BAE6FD"
                >
                  <Clock size={14} color="#0369A1" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Text fontSize="12px" color="#0369A1" lineHeight="1.5">
                    <Text as="span" fontWeight="700">Timing strategy: </Text>
                    {proposal.timing_strategy}
                  </Text>
                </Flex>
              )}

              {/* Slot cards */}
              <VStack gap={3} align="stretch">
                {proposal.slots.map((slot) => {
                  const isExcluded = excludedSlots.has(slot.slot_index);
                  const isReasoningExpanded = expandedReasonings.has(slot.slot_index);
                  const formatColors = formatBadgeColors(slot.post_format);
                  const hasNoAsset = !slot.asset_url;

                  return (
                    <Flex
                      key={slot.slot_index}
                      align="flex-start"
                      gap={3}
                      p={4}
                      borderRadius="14px"
                      border="1px solid"
                      borderColor={isExcluded ? "#E5E7EB" : "#E0E7FF"}
                      bg={isExcluded ? "#F9FAFB" : "white"}
                      opacity={isExcluded ? 0.55 : 1}
                      transition="all 0.15s ease"
                      position="relative"
                    >
                      {/* Checkbox */}
                      <Box
                        w="20px"
                        h="20px"
                        borderRadius="6px"
                        border="2px solid"
                        borderColor={isExcluded ? "#D1D5DB" : "#4F46E5"}
                        bg={isExcluded ? "white" : "#4F46E5"}
                        cursor="pointer"
                        flexShrink={0}
                        mt={0.5}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        onClick={() => toggleSlot(slot.slot_index)}
                        transition="all 0.1s ease"
                      >
                        {!isExcluded && (
                          <Text color="white" fontSize="12px" fontWeight="800" lineHeight="1">
                            ✓
                          </Text>
                        )}
                      </Box>

                      {/* Info */}
                      <Box flex={1} minW={0}>
                        <Flex align="center" gap={2} flexWrap="wrap" mb={1.5}>
                          <Flex align="center" gap={1.5}>
                            <Text fontSize="13px" fontWeight="700" color="#1F2937">
                              {slot.day_label}
                            </Text>
                            <Flex align="center" gap={1} color="#6B7280">
                              <Clock size={12} />
                              <Text fontSize="12px" fontWeight="500">{slot.suggested_time}</Text>
                            </Flex>
                          </Flex>
                          <Badge bg={formatColors.bg} color={formatColors.color} px={2} py={0.5} borderRadius="6px" fontSize="11px" fontWeight="700" textTransform="uppercase">
                            {slot.post_format.replace("_", " ")}
                          </Badge>
                          <Badge bg="#F3F4F6" color="#6B7280" px={2} py={0.5} borderRadius="6px" fontSize="11px" fontWeight="600">
                            {slot.ad_type.replace(/_/g, " ")}
                          </Badge>
                        </Flex>

                        {/* Reasoning */}
                        <Text
                          fontSize="12px"
                          color="#4B5563"
                          lineHeight="1.55"
                          display={isReasoningExpanded ? "block" : "-webkit-box"}
                          style={!isReasoningExpanded ? { WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}}
                          mb={2}
                        >
                          {slot.reasoning}
                        </Text>
                        {slot.reasoning.length > 80 && (
                          <Text fontSize="11px" fontWeight="600" color="#4F46E5" cursor="pointer" mb={2} onClick={() => toggleReasoning(slot.slot_index)} display="inline-block">
                            {isReasoningExpanded ? "Less" : "More"}
                          </Text>
                        )}

                        {/* Asset picker */}
                        {(() => {
                          const formatAssets = fetchedAssets.filter(a => a.format === slot.post_format);
                          const picked = slotAssets[slot.slot_index];
                          return (
                            <Box>
                              {picked ? (
                                <Flex align="center" gap={2}>
                                  <Box w="40px" h="40px" borderRadius="8px" overflow="hidden" border="2px solid #4F46E5" flexShrink={0}>
                                    <Image src={picked.asset_url} alt="Selected" w="100%" h="100%" objectFit="cover" />
                                  </Box>
                                  <Text fontSize="11px" color="#4F46E5" fontWeight="600" flex={1} overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">Asset selected</Text>
                                  <Text
                                    fontSize="11px"
                                    color="#6B7280"
                                    cursor="pointer"
                                    _hover={{ color: "#DC2626" }}
                                    onClick={() => setSlotAssets(prev => { const next = { ...prev }; delete next[slot.slot_index]; return next; })}
                                  >
                                    ✕ Remove
                                  </Text>
                                </Flex>
                              ) : formatAssets.length === 0 ? (
                                <Text fontSize="11px" color="#9CA3AF">No {slot.post_format.replace("_", " ")} assets available</Text>
                              ) : (
                                <Box>
                                  <Text fontSize="11px" color="#6B7280" fontWeight="600" mb={1.5}>Pick an asset:</Text>
                                  <Flex gap={1.5} overflowX="auto" pb={1} style={{ scrollbarWidth: "none" }}>
                                    {formatAssets.map(asset => (
                                      <Box
                                        key={asset.asset_id}
                                        w="44px"
                                        h="44px"
                                        borderRadius="8px"
                                        overflow="hidden"
                                        border="2px solid"
                                        borderColor="transparent"
                                        flexShrink={0}
                                        cursor="pointer"
                                        transition="border-color 0.1s ease"
                                        _hover={{ borderColor: "#4F46E5" }}
                                        onClick={() => setSlotAssets(prev => ({ ...prev, [slot.slot_index]: asset }))}
                                      >
                                        <Image src={asset.asset_url} alt="Asset" w="100%" h="100%" objectFit="cover" />
                                      </Box>
                                    ))}
                                  </Flex>
                                </Box>
                              )}
                            </Box>
                          );
                        })()}
                      </Box>
                    </Flex>
                  );
                })}
              </VStack>

              {/* Footer actions */}
              <Flex gap={3} pt={2}>
                <Button
                  flex={1}
                  bg="#F3F4F6"
                  color="#374151"
                  borderRadius="12px"
                  h="44px"
                  fontSize="14px"
                  fontWeight="600"
                  _hover={{ bg: "#E5E7EB" }}
                  onClick={() => setStep("configure")}
                >
                  Back
                </Button>
                <Button
                  flex={2}
                  bg={readySlots.length === 0 ? "#E5E7EB" : "#4F46E5"}
                  color={readySlots.length === 0 ? "#9CA3AF" : "white"}
                  borderRadius="12px"
                  h="44px"
                  fontSize="14px"
                  fontWeight="700"
                  shadow={readySlots.length === 0 ? "none" : "sm"}
                  _hover={readySlots.length === 0 ? {} : { bg: "#4338CA", shadow: "md" }}
                  disabled={readySlots.length === 0 || isConfirming}
                  loading={isConfirming}
                  onClick={handleConfirmBatch}
                >
                  <Flex align="center" gap={2}>
                    <CheckCircle size={16} strokeWidth={2.5} />
                    Schedule {readySlots.length} Post{readySlots.length !== 1 ? "s" : ""}
                  </Flex>
                </Button>
              </Flex>

              {confirmError && (
                <Flex
                  align="flex-start"
                  gap={3}
                  p={3}
                  borderRadius="10px"
                  bg="#FEF2F2"
                  border="1px solid #FECACA"
                >
                  <AlertCircle size={15} color="#DC2626" style={{ marginTop: 1, flexShrink: 0 }} />
                  <Text fontSize="13px" color="#DC2626" fontWeight="500">
                    {confirmError}
                  </Text>
                </Flex>
              )}
            </VStack>
          )}

          {/* ── Step 4: Confirmed ───────────────────────────────────────── */}
          {step === "confirmed" && proposal && (
            <VStack gap={5} align="stretch" pt={2}>
              <Flex direction="column" align="center" py={8} gap={4}>
                <Flex
                  w="72px"
                  h="72px"
                  borderRadius="20px"
                  bg="#D1FAE5"
                  align="center"
                  justify="center"
                  color="#059669"
                >
                  <CheckCircle size={36} strokeWidth={2} />
                </Flex>
                <VStack gap={1.5} textAlign="center">
                  <Text fontSize="20px" fontWeight="800" color="#111111">
                    Batch Scheduled!
                  </Text>
                  <Text fontSize="14px" color="#6B7280" maxW="340px" lineHeight="1.6">
                    {readySlots.length} posts have been queued for publishing. The scheduler will handle the rest.
                  </Text>
                </VStack>
              </Flex>

              {/* Summary card */}
              <Box
                p={4}
                borderRadius="14px"
                bg="#F9FAFB"
                border="1px solid #E5E7EB"
              >
                <Text fontSize="13px" fontWeight="700" color="#374151" mb={3}>
                  Batch Summary
                </Text>
                <VStack gap={2.5} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="13px" color="#6B7280">Batch name</Text>
                    <Text fontSize="13px" fontWeight="600" color="#1F2937">
                      {proposal.batch_name}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="13px" color="#6B7280">Total posts</Text>
                    <Badge
                      bg="#D1FAE5"
                      color="#065F46"
                      px={2.5}
                      py={0.5}
                      borderRadius="8px"
                      fontSize="12px"
                      fontWeight="700"
                    >
                      {readySlots.length}
                    </Badge>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="13px" color="#6B7280">Date range</Text>
                    <Text fontSize="13px" fontWeight="600" color="#1F2937">
                      {formatDateRange(startDate, confirmedSlotsList)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="13px" color="#6B7280">Cadence</Text>
                    <Text fontSize="13px" fontWeight="600" color="#1F2937" textTransform="capitalize">
                      {cadence === "biweekly" ? "Bi-weekly" : "Weekly"}
                    </Text>
                  </Flex>
                  {createdBatchId && (
                    <Flex justify="space-between" align="center">
                      <Text fontSize="13px" color="#6B7280">Batch ID</Text>
                      <Text fontSize="11px" fontWeight="600" color="#9CA3AF" fontFamily="monospace">
                        {createdBatchId.slice(0, 8)}…
                      </Text>
                    </Flex>
                  )}
                </VStack>
              </Box>

              <Button
                bg="#4F46E5"
                color="white"
                borderRadius="14px"
                h="48px"
                fontSize="15px"
                fontWeight="700"
                shadow="sm"
                _hover={{ bg: "#4338CA", shadow: "md" }}
                onClick={onBatchCreated}
              >
                View Calendar
              </Button>
            </VStack>
          )}
        </Box>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); opacity: 0.6; }
            50% { transform: translateY(-6px); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}</style>
      </Box>
    </Box>
  );
}
