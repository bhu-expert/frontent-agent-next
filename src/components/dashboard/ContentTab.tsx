"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import {
  BadgeCheck,
  Loader,
  Lock,
  Megaphone,
  Rocket,
  Sparkles,
  Star,
  Tags,
} from "lucide-react";
import { generateAdVariationsBulk, generateCarousel } from "@/api";
import { useCampaignPolling } from "@/hooks/useCampaignPolling";
import type { ContextBlock } from "@/types/onboarding.types";
import type { LucideIcon } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface TemplateOption {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface ContentTabBrand {
  id: string;
  name: string;
  industry: string | null;
}

interface ContentTabProps {
  brand: ContentTabBrand | null;
  contextBlocks: ContextBlock[];
  token?: string;
  campaign: ReturnType<typeof useCampaignPolling>;
  onNavigateToAssets: () => void;
  hasRatedContext: boolean;
  onNavigateToBrands: () => void;
  hasPendingBatch: boolean;
  assetCounts?: { total: number; rated: number };
  onBatchGenerated: (campaignIds: string[]) => void;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const MAX_COMBINATIONS = 6; // 6 × 5 variations = 30 posts max per batch

const CONTENT_TEMPLATE_OPTIONS: TemplateOption[] = [
  { id: "awareness", label: "Awareness", description: "Top-of-funnel concepts for reach and recall.", icon: Megaphone },
  { id: "sale", label: "Sales / Offer", description: "Direct-response angles with clear conversion intent.", icon: Tags },
  { id: "launch", label: "Launch", description: "New product or campaign momentum creatives.", icon: Rocket },
  { id: "story_narrative", label: "Story / Narrative", description: "Brand story and origin-driven creatives.", icon: BadgeCheck },
  { id: "engagement", label: "Engagement", description: "Interactive hooks designed to start response.", icon: Sparkles },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */


/* ─── Main Component ─────────────────────────────────────────────────── */

export default function ContentTab({ brand, contextBlocks, token, campaign, onNavigateToAssets, hasRatedContext, onNavigateToBrands, hasPendingBatch, assetCounts, onBatchGenerated }: ContentTabProps) {
  const [selectedContextIds, setSelectedContextIds] = useState<number[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>(["awareness"]);
  const [contentBrief, setContentBrief] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  // Ref-based guard prevents double-submission before React re-renders the disabled button
  const isGeneratingRef = useRef(false);

  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);
  const isGeneratingCarouselRef = useRef(false);

  const cappedCombinations = useMemo(
    () => Math.min(selectedContextIds.length * selectedTemplateIds.length, MAX_COMBINATIONS),
    [selectedContextIds, selectedTemplateIds]
  );
  const effectiveTotalPosts = cappedCombinations * 5;
  const isTrimmed = (selectedContextIds.length * selectedTemplateIds.length) > MAX_COMBINATIONS;

  // Stable key based on actual context indices — changes only when the brand's
  // contexts genuinely change, not on every parent re-render that produces a
  // new array reference. This prevents wiping the user's manual selection.
  const contextBlocksKey = useMemo(
    () => contextBlocks.map((b) => b.context_index).join(","),
    [contextBlocks],
  );

  useEffect(() => {
    if (contextBlocks.length === 0) {
      setSelectedContextIds([]);
      return;
    }
    // Always re-initialize when the context set changes (brand switch),
    // but NOT on every parent re-render with the same data.
    setSelectedContextIds(contextBlocks.slice(0, 2).map((block) => block.context_index));
    setContentError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextBlocksKey]);

  const fieldChrome = {
    bg: "white",
    border: "1px solid",
    borderColor: "#D8DDE6",
    borderRadius: "16px",
    fontSize: "15px",
    color: "#111111",
    transition: "all 0.18s ease",
    _placeholder: { color: "#9CA3AF" },
    _hover: { borderColor: "#C5CCD8" },
    _focusVisible: { borderColor: "#4F46E5", boxShadow: "0 0 0 4px rgba(79, 70, 229, 0.14)" },
  } as const;

  const toggleContext = (contextIndex: number) => {
    setSelectedContextIds((prev) =>
      prev.includes(contextIndex)
        ? prev.filter((id) => id !== contextIndex)
        : [...prev, contextIndex].sort((a, b) => a - b)
    );
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]
    );
  };

  const handleGenerateCarousel = async () => {
    if (!brand || !token) return;
    if (isGeneratingCarouselRef.current) return;
    isGeneratingCarouselRef.current = true;
    setIsGeneratingCarousel(true);
    setContentError(null);
    campaign.clearCampaigns();

    try {
      const result = await generateCarousel(
        brand.id,
        contentBrief.trim() || "Generate an engaging carousel",
        token,
      );
      campaign.addCampaign({
        campaignId: result.campaign_id,
        contextIndex: 0,
        contextTitle: "Carousel",
        templateId: "carousel",
        templateLabel: "Carousel",
      });
      onBatchGenerated([result.campaign_id]);
      onNavigateToAssets();
    } catch (error) {
      const apiErr = error as { message?: string };
      setContentError(apiErr.message || "Failed to queue carousel generation. Please try again.");
    } finally {
      isGeneratingCarouselRef.current = false;
      setIsGeneratingCarousel(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!brand || !token || selectedContextIds.length === 0 || selectedTemplateIds.length === 0) return;
    // Synchronous ref guard — blocks double-clicks before React re-renders the disabled button
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    setIsGenerating(true);
    setContentError(null);
    campaign.clearCampaigns();

    // Build all items for a single bulk request (hard cap at MAX_COMBINATIONS)
    const allItems = selectedContextIds.flatMap((contextIndex) =>
      selectedTemplateIds.map((templateId) => {
        const template = CONTENT_TEMPLATE_OPTIONS.find((o) => o.id === templateId);
        const contextBlock = contextBlocks.find((b) => b.context_index === contextIndex);
        return {
          context_index: (contextBlock?.context_index ?? contextIndex) as 1 | 2 | 3 | 4 | 5,
          user_brief: contentBrief.trim()
            ? `${contentBrief.trim()}\n\nFocus context: ${contextBlock?.title || contextIndex}\nTemplate: ${template?.label || templateId}`
            : `Generate ${template?.label || templateId} variations for the context "${contextBlock?.title || contextIndex}".`,
          ad_type: templateId,
        };
      })
    );
    const items = allItems.slice(0, MAX_COMBINATIONS);

    // Timeout wrapper — rejects after 45s so the user is never stuck indefinitely
    const withTimeout = <T,>(promise: Promise<T>): Promise<T> =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out. Please try again.")), 45_000)
        ),
      ]);

    // Retry helper with exponential backoff
    const callWithRetry = async (attempt = 0): Promise<Awaited<ReturnType<typeof generateAdVariationsBulk>>> => {
      try {
        return await withTimeout(generateAdVariationsBulk(brand.id, items, token));
      } catch (err) {
        if (attempt >= 2) throw err;
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
        return callWithRetry(attempt + 1);
      }
    };

    try {
      console.log("[Generate] calling bulk API with items:", items);
      const result = await callWithRetry();
      console.log("[Generate] bulk API response:", result);

      const newCampaignIds: string[] = [];
      for (const c of result.campaigns) {
        const contextBlock = contextBlocks.find((b) => b.context_index === c.context_index);
        const template = CONTENT_TEMPLATE_OPTIONS.find((o) => o.id === c.ad_type);
        console.log(`[Generate] registered campaign ${c.campaign_id} — ${c.ad_type} ctx=${c.context_index}`);
        campaign.addCampaign({
          campaignId: c.campaign_id,
          contextIndex: c.context_index,
          contextTitle: contextBlock?.title || `Context ${c.context_index}`,
          templateId: c.ad_type,
          templateLabel: template?.label || c.ad_type,
        });
        newCampaignIds.push(c.campaign_id);
      }
      onBatchGenerated(newCampaignIds);
      onNavigateToAssets();
    } catch (error) {
      console.error("[Generate] bulk API failed:", error);
      const apiError = error as { message?: string };
      setContentError(apiError.message || "Failed to generate content variations. Check your connection and try again.");
    } finally {
      isGeneratingRef.current = false;
      setIsGenerating(false);
    }
  };

  if (!brand) {
    return (
      <Box bg="white" border="1px solid" borderColor="#ECECEC" borderRadius="24px" p={{ base: 6, md: 10 }} textAlign="center">
        <Text fontSize="lg" color="#6B7280">
          Select a brand first to use the Content tab.
        </Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      {/* Header */}
      <Flex align={{ base: "flex-start", md: "center" }} justify="space-between" direction={{ base: "column", md: "row" }} gap={4}>
        <Box>
          <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="700" color="#111111" lineHeight="1.05" mb={2}>
            Content Generation
          </Text>
          <Text fontSize="15px" color="#6B7280">
            Select your approved contexts and pair them with content formats to generate posts.
          </Text>
        </Box>
        <Flex align="center" gap={2} wrap="wrap" justify={{ base: "flex-start", md: "flex-end" }}>
          {assetCounts && assetCounts.total > 0 && (
            <Flex gap={1.5} align="center">
              <Box px={2} py={1} borderRadius="999px" bg="#F0FDF4" border="1px solid #BBF7D0">
                <Text fontSize="11px" fontWeight="600" color="#166534">
                  {assetCounts.rated} rated
                </Text>
              </Box>
              {assetCounts.total - assetCounts.rated > 0 && (
                <Box px={2} py={1} borderRadius="999px" bg="#FFFBEB" border="1px solid #FDE68A">
                  <Text fontSize="11px" fontWeight="600" color="#92400E">
                    {assetCounts.total - assetCounts.rated} unrated
                  </Text>
                </Box>
              )}
            </Flex>
          )}
          <Badge bg="#EEF2FF" color="#4338CA" px={3} py={2} borderRadius="999px">
            {brand.name} &middot; Active Brand
          </Badge>
        </Flex>
      </Flex>

      {/* Step 1: Contexts */}
      <Box mb={10}>
        <Text fontSize="20px" fontWeight="600" color="#111111" mb={2}>1. Select Contexts</Text>
        <Text fontSize="15px" color="#6B7280" mb={6}>Choose the narrative angles you want to turn into posts.</Text>
        <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(5, 1fr)" }} gap={5}>
          {contextBlocks.map((block) => {
            const isSelected = selectedContextIds.includes(block.context_index);
            return (
              <Box
                key={block.context_index}
                bg={isSelected ? "#EEF2FF" : "white"}
                border="2px solid" borderColor={isSelected ? "#4F46E5" : "#ECECEC"}
                borderRadius="14px" p={5} cursor="pointer" position="relative"
                transition="all 0.2s ease"
                _hover={{ borderColor: "#D1D5DB", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)" }}
                onClick={() => toggleContext(block.context_index)}
              >
                <Flex
                  position="absolute" top="16px" right="16px"
                  w="20px" h="20px" borderRadius="full" border="2px solid"
                  borderColor={isSelected ? "#4F46E5" : "#D1D5DB"}
                  bg={isSelected ? "#4F46E5" : "transparent"}
                  color="white" align="center" justify="center"
                >
                  {isSelected ? <Text fontSize="10px">&#10003;</Text> : null}
                </Flex>
                <Text fontSize="14px" fontWeight="600" color="#111111" pr={6} mb={2}>
                  {block.title}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Step 2: Templates */}
      <Box mb={6}>
        <Text fontSize="20px" fontWeight="600" color="#111111" mb={2}>2. Select Templates</Text>
        <Text fontSize="15px" color="#6B7280" mb={6}>Choose the formats to apply to your selected contexts.</Text>
        <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(5, 1fr)" }} gap={5}>
          {CONTENT_TEMPLATE_OPTIONS.map((template) => {
            const isSelected = selectedTemplateIds.includes(template.id);
            const TemplateIcon = template.icon;
            return (
              <Box
                key={template.id}
                bg={isSelected ? "#EEF2FF" : "white"}
                border="2px solid" borderColor={isSelected ? "#4F46E5" : "#ECECEC"}
                borderRadius="14px" p={5} cursor="pointer" position="relative"
                transition="all 0.2s ease"
                _hover={{ borderColor: "#D1D5DB", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)" }}
                onClick={() => toggleTemplate(template.id)}
              >
                <Flex
                  position="absolute" top="16px" right="16px"
                  w="20px" h="20px" borderRadius="full" border="2px solid"
                  borderColor={isSelected ? "#4F46E5" : "#D1D5DB"}
                  bg={isSelected ? "#4F46E5" : "transparent"}
                  color="white" align="center" justify="center"
                >
                  {isSelected ? <Text fontSize="10px">&#10003;</Text> : null}
                </Flex>
                <Flex
                  w="40px" h="40px" bg={isSelected ? "white" : "#F8F8F6"}
                  borderRadius="12px" mb={4} align="center" justify="center"
                  color={isSelected ? "#4F46E5" : "#6B7280"}
                >
                  <TemplateIcon size={18} strokeWidth={2.1} />
                </Flex>
                <Text fontSize="16px" fontWeight="600" color="#111111" mb={1.5}>{template.label}</Text>
                <Text fontSize="13px" color="#6B7280" lineHeight="1.4">{template.description}</Text>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Brief */}
      <Box mb={8}>
        <Text fontSize="12px" fontWeight="600" textTransform="uppercase" color="#6B7280" letterSpacing="0.05em" mb={3}>
          Brief
        </Text>
        <Textarea
          placeholder="Optional. Add campaign instructions before generating variations."
          value={contentBrief}
          onChange={(event) => setContentBrief(event.target.value)}
          minH="110px" px="16px" py="14px" resize="vertical"
          {...fieldChrome}
        />
      </Box>

      {/* Step 3: Carousel */}
      <Box bg="white" border="2px solid" borderColor="#ECECEC" borderRadius="16px" p={6}>
        <Flex align="center" justify="space-between" mb={3}>
          <Box>
            <Text fontSize="20px" fontWeight="600" color="#111111">3. Carousel</Text>
            <Text fontSize="13px" color="#6B7280" mt={1}>
              Generate 3 themed carousel variations (15 slides total) — Educational, Inspirational, and Product Story.
            </Text>
          </Box>
          <Badge bg="#EEF2FF" color="#4338CA" px={3} py={1.5} borderRadius="999px" fontSize="12px">
            15 images
          </Badge>
        </Flex>
        <Button
          bg={hasRatedContext && !hasPendingBatch ? "#4F46E5" : "#D1D5DB"}
          color="white" borderRadius="12px" h="44px" px={6}
          fontSize="14px" fontWeight="600"
          _hover={{ bg: hasRatedContext && !hasPendingBatch ? "#4338CA" : "#D1D5DB" }}
          disabled={!hasRatedContext || hasPendingBatch || isGeneratingCarousel}
          onClick={handleGenerateCarousel}
          cursor={hasRatedContext && !hasPendingBatch ? "pointer" : "not-allowed"}
        >
          <Flex align="center" gap={2}>
            {(!hasRatedContext || hasPendingBatch) && <Lock size={14} />}
            {isGeneratingCarousel ? "Queuing..." : "Generate Carousel"}
          </Flex>
        </Button>
      </Box>

      {/* Pending batch banner */}
      {hasRatedContext && hasPendingBatch && (
        <Flex
          align="center" gap={4}
          bg="#FFF7ED" border="1px solid" borderColor="#FED7AA"
          borderRadius="16px" px={5} py={4}
        >
          <Flex
            w="36px" h="36px" flexShrink={0} borderRadius="10px"
            bg="#FFEDD5" align="center" justify="center"
          >
            <Lock size={16} color="#EA580C" />
          </Flex>
          <Box flex={1}>
            <Text fontSize="14px" fontWeight="700" color="#9A3412">
              Rate your generated assets to unlock the next batch
            </Text>
            <Text fontSize="13px" color="#C2410C" mt={0.5}>
              Go to Assets and give every image a star rating before generating again.
            </Text>
          </Box>
          <Button
            size="sm" h="36px" px={4} borderRadius="10px"
            bg="#EA580C" color="white" fontSize="13px" fontWeight="600"
            _hover={{ bg: "#C2410C" }}
            onClick={onNavigateToAssets}
            flexShrink={0}
          >
            <Flex align="center" gap={1.5}>
              <Star size={13} />
              View Assets
            </Flex>
          </Button>
        </Flex>
      )}

      {/* Rating gate banner */}
      {!hasRatedContext && (
        <Flex
          align="center" gap={4}
          bg="#FFFBEB" border="1px solid" borderColor="#FDE68A"
          borderRadius="16px" px={5} py={4}
        >
          <Flex
            w="36px" h="36px" flexShrink={0} borderRadius="10px"
            bg="#FEF3C7" align="center" justify="center"
          >
            <Lock size={16} color="#D97706" />
          </Flex>
          <Box flex={1}>
            <Text fontSize="14px" fontWeight="700" color="#92400E">
              Rate all contexts to unlock generation
            </Text>
            <Text fontSize="13px" color="#B45309" mt={0.5}>
              Go to the Brands tab and give every context a star rating before generating.
            </Text>
          </Box>
          <Button
            size="sm" h="36px" px={4} borderRadius="10px"
            bg="#D97706" color="white" fontSize="13px" fontWeight="600"
            _hover={{ bg: "#B45309" }}
            onClick={onNavigateToBrands}
            flexShrink={0}
          >
            <Flex align="center" gap={1.5}>
              <Star size={13} />
              Rate Now
            </Flex>
          </Button>
        </Flex>
      )}

      {/* Sticky Generate Bar */}
      <Box
        position="sticky" bottom={{ base: 2, md: 4 }}
        bg="rgba(255, 255, 255, 0.9)" backdropFilter="blur(12px)"
        border="1px solid" borderColor={hasRatedContext ? "#ECECEC" : "#FDE68A"}
        borderRadius="20px"
        px={{ base: 4, md: 6 }} py={4}
      >
        <Flex align={{ base: "stretch", md: "center" }} justify="space-between" direction={{ base: "column", md: "row" }} gap={4}>
          <Flex align="center" gap={4} bg="#F8F8F6" border="1px solid" borderColor="#ECECEC" borderRadius="20px" px={5} py={3} wrap="wrap">
            <Box textAlign="center">
              <Text fontSize="18px" fontWeight="700" color="#111111">{selectedContextIds.length}</Text>
              <Text fontSize="12px" color="#6B7280" textTransform="uppercase">Contexts</Text>
            </Box>
            <Text color="#9CA3AF">&times;</Text>
            <Box textAlign="center">
              <Text fontSize="18px" fontWeight="700" color="#111111">{selectedTemplateIds.length}</Text>
              <Text fontSize="12px" color="#6B7280" textTransform="uppercase">Templates</Text>
            </Box>
            <Text color="#9CA3AF">&times;</Text>
            <Box textAlign="center">
              <Text fontSize="18px" fontWeight="700" color="#111111">5</Text>
              <Text fontSize="12px" color="#6B7280" textTransform="uppercase">Variations</Text>
            </Box>
            <Text color="#9CA3AF">=</Text>
            <Box textAlign="center">
              <Text fontSize="18px" fontWeight="700" color={hasRatedContext && !hasPendingBatch ? "#4F46E5" : "#D97706"}>{effectiveTotalPosts}</Text>
              <Text fontSize="12px" color={hasRatedContext && !hasPendingBatch ? "#4F46E5" : "#D97706"} textTransform="uppercase">
                {isTrimmed ? "Posts (capped)" : "Total Posts"}
              </Text>
            </Box>
          </Flex>

          <Button
            bg={hasRatedContext && !hasPendingBatch ? "#4F46E5" : "#D1D5DB"}
            color="white" borderRadius="14px" h="52px" px={7}
            fontSize="15px" fontWeight="600"
            _hover={{ bg: hasRatedContext && !hasPendingBatch ? "#4338CA" : "#D1D5DB" }}
            disabled={!hasRatedContext || hasPendingBatch || selectedContextIds.length === 0 || selectedTemplateIds.length === 0 || isGenerating}
            onClick={handleGenerateContent}
            cursor={hasRatedContext && !hasPendingBatch ? "pointer" : "not-allowed"}
          >
            <Flex align="center" gap={2}>
              {(!hasRatedContext || hasPendingBatch) && <Lock size={15} />}
              {isGenerating
                ? "Generating..."
                : !hasRatedContext
                  ? "Rate All Contexts First"
                  : hasPendingBatch
                    ? "Rate Assets to Unlock"
                    : effectiveTotalPosts === 0
                      ? "Select to Generate"
                      : `Generate ${effectiveTotalPosts} Posts${isTrimmed ? " (capped at 30)" : ""}`}
            </Flex>
          </Button>
        </Flex>
      </Box>

      {/* Error */}
      {contentError && (
        <Box mt={4} bg="red.50" border="1px solid" borderColor="red.200" color="red.600" fontSize="sm" borderRadius="14px" p={4}>
          {contentError}
        </Box>
      )}

      {/* Generating Modal Overlay */}
      {isGenerating && (
        <Flex
          position="fixed" inset={0} zIndex={1000}
          bg="rgba(0, 0, 0, 0.5)" backdropFilter="blur(6px)"
          align="center" justify="center"
        >
          <Box
            bg="white" borderRadius="24px" p={{ base: 8, md: 10 }}
            textAlign="center" maxW="420px" w="90%"
            boxShadow="0 24px 64px rgba(0, 0, 0, 0.2)"
            style={{ animation: "fadeInUp 0.3s ease-out" }}
          >
            <Flex
              w="64px" h="64px" borderRadius="16px"
              bg="#EEF2FF" align="center" justify="center"
              mx="auto" mb={5}
            >
              <Loader size={28} color="#4F46E5" style={{ animation: "spin 1.5s linear infinite" }} />
            </Flex>
            <Text fontSize="22px" fontWeight="700" color="#111" mb={2}>
              Queuing {effectiveTotalPosts} Ads
            </Text>
            <Text fontSize="15px" color="#6B7280" lineHeight="1.5" mb={2}>
              Setting up {effectiveTotalPosts} ad variations across {Math.min(selectedContextIds.length * selectedTemplateIds.length, MAX_COMBINATIONS)} context-template combination{cappedCombinations !== 1 ? "s" : ""}.
            </Text>
            <Text fontSize="14px" color="#7C3AED" fontWeight="500" lineHeight="1.5" mb={4}>
              Go grab a coffee — everything generates in the background, even if you close this tab.
            </Text>
            <Flex justify="center" gap={1.5}>
              {[0, 1, 2].map((i) => (
                <Box
                  key={i} w="8px" h="8px" borderRadius="full" bg="#4F46E5"
                  style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </Flex>
          </Box>
        </Flex>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </VStack>
  );
}
