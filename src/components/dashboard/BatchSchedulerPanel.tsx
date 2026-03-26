"use client";

import { useState } from "react";
import { Box, Button, Flex, Text, VStack, Badge, Image } from "@chakra-ui/react";
import { Calendar, Sparkles, Clock, ChevronRight, CheckCircle, AlertCircle, X, Loader } from "lucide-react";

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
  const base = new Date(startDate);
  base.setDate(base.getDate() + dayOffset);
  const [hours, minutes] = suggestedTime.split(":").map(Number);
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

  // Step state
  const [step, setStep] = useState<Step>("configure");
  const [proposeError, setProposeError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<BatchProposal | null>(null);

  // Step 3 — Review: excluded slot indices
  const [excludedSlots, setExcludedSlots] = useState<Set<number>>(new Set());
  const [expandedReasonings, setExpandedReasonings] = useState<Set<number>>(new Set());

  // Step 4 — Confirmed
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [createdBatchId, setCreatedBatchId] = useState<string | null>(null);

  const assetsByFormat = countAssetsByFormat(availableAssets);

  // ── Step 1 handlers ──────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setProposeError(null);
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
          available_assets: availableAssets,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate proposal");
      }
      setProposal(data as BatchProposal);
      setExcludedSlots(new Set());
      setExpandedReasonings(new Set());
      setStep("review");
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

  // ── Step 4 handlers ──────────────────────────────────────────────────────

  const handleConfirmBatch = async () => {
    if (!proposal || confirmedSlotsList.length === 0) return;
    setConfirmError(null);
    setIsConfirming(true);

    try {
      const slotsWithScheduledAt = confirmedSlotsList.map(slot => ({
        slot_index: slot.slot_index,
        day_offset: slot.day_offset,
        day_label: slot.day_label,
        scheduled_at: buildScheduledAt(startDate, slot.day_offset, slot.suggested_time),
        post_format: slot.post_format,
        media_type: slot.media_type,
        ad_type: slot.ad_type,
        asset_url: slot.asset_url || "",
        caption: undefined,
      }));

      // Calculate ends_at from last slot
      const maxOffset = Math.max(...confirmedSlotsList.map(s => s.day_offset));
      const lastSlot = confirmedSlotsList.find(s => s.day_offset === maxOffset)!;
      const endsAt = buildScheduledAt(startDate, lastSlot.day_offset, lastSlot.suggested_time);
      const startsAt = buildScheduledAt(startDate, 0, confirmedSlotsList[0].suggested_time);

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
                  Available Assets ({availableAssets.length} total)
                </Text>
                {availableAssets.length === 0 ? (
                  <Text fontSize="13px" color="#9CA3AF">
                    No assets loaded. The AI will note inventory gaps.
                  </Text>
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

          {/* ── Step 2: Generating ──────────────────────────────────────── */}
          {step === "generating" && (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py={16}
              gap={5}
            >
              <Flex
                w="72px"
                h="72px"
                borderRadius="20px"
                bg="#EEF2FF"
                align="center"
                justify="center"
                color="#4F46E5"
                style={{ animation: "pulse 2s ease-in-out infinite" }}
              >
                <Loader size={32} strokeWidth={2} style={{ animation: "spin 1.4s linear infinite" }} />
              </Flex>
              <VStack gap={2} textAlign="center">
                <Text fontSize="17px" fontWeight="700" color="#1F2937">
                  Analysing your content strategy…
                </Text>
                <Text fontSize="14px" color="#6B7280" maxW="340px" lineHeight="1.6">
                  The AI is reviewing your asset inventory, brand cadence, and audience timing to build an optimal posting schedule.
                </Text>
              </VStack>
              <Flex gap={1.5} mt={2}>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    w="8px"
                    h="8px"
                    borderRadius="50%"
                    bg="#4F46E5"
                    opacity={0.3 + i * 0.3}
                    style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
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

              {/* Inventory gaps warning */}
              {proposal.inventory_gaps.length > 0 && (
                <Flex
                  align="flex-start"
                  gap={3}
                  p={4}
                  borderRadius="12px"
                  bg="#FFFBEB"
                  border="1px solid #FDE68A"
                >
                  <AlertCircle size={16} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Box>
                    <Text fontSize="13px" fontWeight="700" color="#92400E" mb={1.5}>
                      Inventory Gaps Detected
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

                      {/* Thumbnail */}
                      <Box
                        w="56px"
                        h="56px"
                        borderRadius="10px"
                        overflow="hidden"
                        flexShrink={0}
                        bg="#F3F4F6"
                        border="1px solid #E5E7EB"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {slot.asset_url ? (
                          <Image
                            src={slot.asset_url}
                            alt="Asset"
                            w="100%"
                            h="100%"
                            objectFit="cover"
                          />
                        ) : (
                          <AlertCircle size={22} color="#D1D5DB" />
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
                              <Text fontSize="12px" fontWeight="500">
                                {slot.suggested_time}
                              </Text>
                            </Flex>
                          </Flex>
                          <Badge
                            bg={formatColors.bg}
                            color={formatColors.color}
                            px={2}
                            py={0.5}
                            borderRadius="6px"
                            fontSize="11px"
                            fontWeight="700"
                            textTransform="uppercase"
                          >
                            {slot.post_format.replace("_", " ")}
                          </Badge>
                          <Badge
                            bg="#F3F4F6"
                            color="#6B7280"
                            px={2}
                            py={0.5}
                            borderRadius="6px"
                            fontSize="11px"
                            fontWeight="600"
                          >
                            {slot.ad_type.replace(/_/g, " ")}
                          </Badge>
                          {hasNoAsset && (
                            <Badge
                              bg="#FEF3C7"
                              color="#92400E"
                              px={2}
                              py={0.5}
                              borderRadius="6px"
                              fontSize="11px"
                              fontWeight="700"
                            >
                              No asset — skip or assign
                            </Badge>
                          )}
                        </Flex>

                        {/* Reasoning */}
                        <Box>
                          <Text
                            fontSize="12px"
                            color="#4B5563"
                            lineHeight="1.55"
                            display={isReasoningExpanded ? "block" : "-webkit-box"}
                            style={
                              !isReasoningExpanded
                                ? {
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }
                                : {}
                            }
                          >
                            {slot.reasoning}
                          </Text>
                          {slot.reasoning.length > 100 && (
                            <Text
                              fontSize="11px"
                              fontWeight="600"
                              color="#4F46E5"
                              cursor="pointer"
                              mt={0.5}
                              onClick={() => toggleReasoning(slot.slot_index)}
                              _hover={{ textDecoration: "underline" }}
                              display="inline-block"
                            >
                              {isReasoningExpanded ? "Show less" : "Show more"}
                            </Text>
                          )}
                        </Box>
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
                  bg={confirmedSlotsList.length === 0 ? "#E5E7EB" : "#4F46E5"}
                  color={confirmedSlotsList.length === 0 ? "#9CA3AF" : "white"}
                  borderRadius="12px"
                  h="44px"
                  fontSize="14px"
                  fontWeight="700"
                  shadow={confirmedSlotsList.length === 0 ? "none" : "sm"}
                  _hover={
                    confirmedSlotsList.length === 0
                      ? {}
                      : { bg: "#4338CA", shadow: "md" }
                  }
                  disabled={confirmedSlotsList.length === 0 || isConfirming}
                  loading={isConfirming}
                  onClick={handleConfirmBatch}
                >
                  <Flex align="center" gap={2}>
                    <CheckCircle size={16} strokeWidth={2.5} />
                    Confirm Batch ({confirmedSlotsList.length} posts)
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
                    {confirmedSlotsList.length} posts have been queued for publishing. The scheduler will handle the rest.
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
                      {confirmedSlotsList.length}
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
            50% { opacity: 0.7; }
          }
        `}</style>
      </Box>
    </Box>
  );
}
