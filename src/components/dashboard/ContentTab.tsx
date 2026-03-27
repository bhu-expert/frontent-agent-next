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
  BookOpen,
  GraduationCap,
  Layers,
  Lightbulb,
  Loader,
  Lock,
  Megaphone,
  Package,
  Rocket,
  Sparkles,
  Star,
  Tags,
} from "lucide-react";
import { generateAdVariationsBulk, generateCarousel } from "@/api";
import { useCampaignPolling } from "@/hooks/useCampaignPolling";
import type { ContextBlock } from "@/types/onboarding.types";
import type { LucideIcon } from "lucide-react";
import { getTemplateComponent } from "@/components/dashboard/templates";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface TemplateOption {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface CarouselThemeOption {
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

const MAX_COMBINATIONS = 6;

const CONTENT_TEMPLATE_OPTIONS: TemplateOption[] = [
  { id: "awareness", label: "Awareness", description: "Top-of-funnel concepts for reach and recall.", icon: Megaphone },
  { id: "sale", label: "Sales / Offer", description: "Direct-response angles with clear conversion intent.", icon: Tags },
  { id: "launch", label: "Launch", description: "New product or campaign momentum creatives.", icon: Rocket },
  { id: "story_narrative", label: "Story / Narrative", description: "Brand story and origin-driven creatives.", icon: BadgeCheck },
  { id: "engagement", label: "Engagement", description: "Interactive hooks designed to start response.", icon: Sparkles },
];

const CAROUSEL_THEME_OPTIONS: CarouselThemeOption[] = [
  {
    id: "educational",
    label: "Educational",
    description: "Teach your audience something valuable step by step.",
    icon: GraduationCap,
  },
  {
    id: "how_to",
    label: "How-To / Tutorial",
    description: "Step-by-step process: Cover → Step 1 → Step 2 → Step 3 → CTA.",
    icon: BookOpen,
  },
  {
    id: "product_story",
    label: "Product Story",
    description: "Problem → Solution → Results → CTA. Showcase your transformation.",
    icon: Package,
  },
  {
    id: "tips",
    label: "Tips & Tricks",
    description: "Quick wins: Cover → Tip 1 → Tip 2 → Tip 3 → CTA.",
    icon: Lightbulb,
  },
];

/* ─── SelectionCard (reusable) ───────────────────────────────────────── */

function SelectionCard({
  isSelected,
  onClick,
  icon: Icon,
  label,
  description,
  accent = "#4F46E5",
}: {
  isSelected: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  description: string;
  accent?: string;
}) {
  return (
    <Box
      bg={isSelected ? "#EEF2FF" : "white"}
      border="2px solid" borderColor={isSelected ? accent : "#ECECEC"}
      borderRadius="14px" p={5} cursor="pointer" position="relative"
      transition="all 0.2s ease"
      _hover={{ borderColor: "#D1D5DB", boxShadow: "0 8px 32px rgba(0,0,0,0.06)" }}
      onClick={onClick}
    >
      <Flex
        position="absolute" top="16px" right="16px"
        w="20px" h="20px" borderRadius="full" border="2px solid"
        borderColor={isSelected ? accent : "#D1D5DB"}
        bg={isSelected ? accent : "transparent"}
        color="white" align="center" justify="center"
      >
        {isSelected ? <Text fontSize="10px">&#10003;</Text> : null}
      </Flex>
      {Icon && (
        <Flex
          w="40px" h="40px" bg={isSelected ? "white" : "#F8F8F6"}
          borderRadius="12px" mb={4} align="center" justify="center"
          color={isSelected ? accent : "#6B7280"}
        >
          <Icon size={18} strokeWidth={2.1} />
        </Flex>
      )}
      <Text fontSize="15px" fontWeight="600" color="#111111" mb={1.5} pr={6}>{label}</Text>
      <Text fontSize="13px" color="#6B7280" lineHeight="1.4">{description}</Text>
    </Box>
  );
}

/* ─── Template Preview Card ──────────────────────────────────────────── */

const PREVIEW_VD: Record<string, string> = {
  headline: "Your Headline Here",
  tagline: "TAGLINE",
  cta_text: "Shop Now",
  brand_name: "Brand",
  subheadline: "Supporting message goes here",
  body_text: "Short body copy for the post layout preview.",
};

function TemplatePreviewCard({
  template,
  isSelected,
  onClick,
}: {
  template: TemplateOption;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Layout = getTemplateComponent(template.id, 1);
  const accent = "#4F46E5";

  return (
    <Box
      border="2px solid"
      borderColor={isSelected ? accent : "#ECECEC"}
      borderRadius="16px"
      overflow="hidden"
      cursor="pointer"
      bg="white"
      transition="all 0.2s ease"
      _hover={{ borderColor: isSelected ? accent : "#D1D5DB", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
      onClick={onClick}
      position="relative"
    >
      {/* Selection indicator */}
      <Flex
        position="absolute"
        top="10px"
        right="10px"
        zIndex={10}
        w="20px"
        h="20px"
        borderRadius="full"
        border="2px solid"
        borderColor={isSelected ? accent : "rgba(255,255,255,0.7)"}
        bg={isSelected ? accent : "rgba(255,255,255,0.5)"}
        backdropFilter="blur(4px)"
        align="center"
        justify="center"
        color="white"
      >
        {isSelected && <Text fontSize="10px" lineHeight={1}>&#10003;</Text>}
      </Flex>

      {/* Live layout preview — pointer-events off so clicks pass through */}
      <Box w="100%" style={{ aspectRatio: "4/5" }} pointerEvents="none" overflow="hidden">
        <Layout
          vd={PREVIEW_VD}
          imageUrl={null}
          primary="#1A1A2E"
          secondary="#4F46E5"
          accent="#F59E0B"
          format="feed_4_5"
        />
      </Box>

      {/* Label row */}
      <Box
        px={3}
        py={2.5}
        bg={isSelected ? "#EEF2FF" : "white"}
        borderTop="1px solid"
        borderColor={isSelected ? "#C7D2FE" : "#F3F4F6"}
        transition="background 0.2s"
      >
        <Text fontSize="13px" fontWeight="700" color={isSelected ? accent : "#111111"}>
          {template.label}
        </Text>
        <Text fontSize="11px" color="#6B7280" lineHeight="1.4" mt={0.5}
          overflow="hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {template.description}
        </Text>
      </Box>
    </Box>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function ContentTab({
  brand,
  contextBlocks,
  token,
  campaign,
  onNavigateToAssets,
  hasRatedContext,
  onNavigateToBrands,
  hasPendingBatch,
  assetCounts,
  onBatchGenerated,
}: ContentTabProps) {

  // ── Tab state ──────────────────────────────────────────────────────────
  const [activeMode, setActiveMode] = useState<"ads" | "carousel">("ads");

  // ── Post Variations state ────────────────────────────────────────────────
  const [selectedContextIds, setSelectedContextIds] = useState<number[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>(["awareness"]);
  const [contentBrief, setContentBrief] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const isGeneratingRef = useRef(false);

  // ── Carousel state ─────────────────────────────────────────────────────
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>(["educational", "product_story"]);
  const [carouselContextIndex, setCarouselContextIndex] = useState<number | null>(null);
  const [carouselBrief, setCarouselBrief] = useState("");
  const [isGeneratingCarousel, setIsGeneratingCarousel] = useState(false);
  const [carouselError, setCarouselError] = useState<string | null>(null);
  const isGeneratingCarouselRef = useRef(false);

  const cappedCombinations = useMemo(
    () => Math.min(selectedContextIds.length * selectedTemplateIds.length, MAX_COMBINATIONS),
    [selectedContextIds, selectedTemplateIds]
  );
  const effectiveTotalPosts = cappedCombinations * 5;
  const isTrimmed = (selectedContextIds.length * selectedTemplateIds.length) > MAX_COMBINATIONS;

  const contextBlocksKey = useMemo(
    () => contextBlocks.map((b) => b.context_index).join(","),
    [contextBlocks],
  );

  useEffect(() => {
    if (contextBlocks.length === 0) {
      setSelectedContextIds([]);
      return;
    }
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

  // ── Handlers ───────────────────────────────────────────────────────────

  const toggleContext = (contextIndex: number) =>
    setSelectedContextIds((prev) =>
      prev.includes(contextIndex)
        ? prev.filter((id) => id !== contextIndex)
        : [...prev, contextIndex].sort((a, b) => a - b)
    );

  const toggleTemplate = (templateId: string) =>
    setSelectedTemplateIds((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]
    );

  const toggleTheme = (themeId: string) =>
    setSelectedThemeIds((prev) =>
      prev.includes(themeId) ? prev.filter((id) => id !== themeId) : [...prev, themeId]
    );

  const toggleCarouselContext = (idx: number) =>
    setCarouselContextIndex((prev) => (prev === idx ? null : idx));

  const handleGenerateCarousel = async () => {
    if (!brand || !token || selectedThemeIds.length === 0) return;
    if (isGeneratingCarouselRef.current) return;
    isGeneratingCarouselRef.current = true;
    setIsGeneratingCarousel(true);
    setCarouselError(null);

    try {
      const result = await generateCarousel(
        brand.id,
        carouselBrief.trim() || "Generate an engaging carousel",
        selectedThemeIds,
        carouselContextIndex,
        token,
      );
      campaign.addCampaign({
        campaignId: result.campaign_id,
        contextIndex: 0,
        contextTitle: "Carousel",
        templateId: "carousel",
        templateLabel: "Carousel",
        total: result.total,
      });
      onBatchGenerated([result.campaign_id]);
      onNavigateToAssets();
    } catch (error) {
      const apiErr = error as { message?: string };
      setCarouselError(apiErr.message || "Failed to queue carousel generation. Please try again.");
    } finally {
      isGeneratingCarouselRef.current = false;
      setIsGeneratingCarousel(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!brand || !token || selectedContextIds.length === 0 || selectedTemplateIds.length === 0) return;
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setIsGenerating(true);
    setContentError(null);
    campaign.clearCampaigns();

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

    const withTimeout = <T,>(promise: Promise<T>): Promise<T> =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out. Please try again.")), 45_000)
        ),
      ]);

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
      const result = await callWithRetry();
      const newCampaignIds: string[] = [];
      for (const c of result.campaigns) {
        const contextBlock = contextBlocks.find((b) => b.context_index === c.context_index);
        const template = CONTENT_TEMPLATE_OPTIONS.find((o) => o.id === c.ad_type);
        campaign.addCampaign({
          campaignId: c.campaign_id,
          contextIndex: c.context_index,
          contextTitle: contextBlock?.title || `Context ${c.context_index}`,
          templateId: c.ad_type,
          templateLabel: template?.label || c.ad_type,
          total: c.total,
        });
        newCampaignIds.push(c.campaign_id);
      }
      onBatchGenerated(newCampaignIds);
      onNavigateToAssets();
    } catch (error) {
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
        <Text fontSize="lg" color="#6B7280">Select a brand first to use the Content tab.</Text>
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
            Generate Post variations or branded carousel posts for your brand.
          </Text>
        </Box>
        <Flex align="center" gap={2} wrap="wrap" justify={{ base: "flex-start", md: "flex-end" }}>
          {assetCounts && assetCounts.total > 0 && (
            <Flex gap={1.5} align="center">
              <Box px={2} py={1} borderRadius="999px" bg="#F0FDF4" border="1px solid #BBF7D0">
                <Text fontSize="11px" fontWeight="600" color="#166534">{assetCounts.rated} rated</Text>
              </Box>
              {assetCounts.total - assetCounts.rated > 0 && (
                <Box px={2} py={1} borderRadius="999px" bg="#FFFBEB" border="1px solid #FDE68A">
                  <Text fontSize="11px" fontWeight="600" color="#92400E">{assetCounts.total - assetCounts.rated} unrated</Text>
                </Box>
              )}
            </Flex>
          )}
          <Badge bg="#EEF2FF" color="#4338CA" px={3} py={2} borderRadius="999px">
            {brand.name} &middot; Active Brand
          </Badge>
        </Flex>
      </Flex>

      {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
      <Flex
        bg="#F3F4F6" borderRadius="16px" p={1} gap={1}
        w="fit-content"
      >
        {(["ads", "carousel"] as const).map((mode) => (
          <Button
            key={mode}
            h="40px" px={6} borderRadius="12px" fontSize="14px" fontWeight="600"
            bg={activeMode === mode ? "white" : "transparent"}
            color={activeMode === mode ? "#111111" : "#6B7280"}
            boxShadow={activeMode === mode ? "0 1px 4px rgba(0,0,0,0.10)" : "none"}
            _hover={{ bg: activeMode === mode ? "white" : "#E5E7EB" }}
            onClick={() => setActiveMode(mode)}
          >
            {mode === "ads" ? (
              <Flex align="center" gap={2}>
                <Layers size={15} />
                Post Variations
              </Flex>
            ) : (
              <Flex align="center" gap={2}>
                <Sparkles size={15} />
                Carousel
              </Flex>
            )}
          </Button>
        ))}
      </Flex>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* POST VARIATIONS TAB                                                  */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeMode === "ads" && (
        <>
          {/* Step 1: Contexts */}
          <Box mb={10}>
            <Text fontSize="20px" fontWeight="600" color="#111111" mb={2}>1. Select Contexts</Text>
            <Text fontSize="15px" color="#6B7280" mb={6}>Choose the narrative angles you want to turn into posts.</Text>
            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(5, 1fr)" }} gap={5}>
              {contextBlocks.map((block) => (
                <SelectionCard
                  key={block.context_index}
                  isSelected={selectedContextIds.includes(block.context_index)}
                  onClick={() => toggleContext(block.context_index)}
                  icon={BadgeCheck}
                  label={block.title}
                  description=""
                />
              ))}
            </Box>
          </Box>

          {/* Step 2: Templates */}
          <Box mb={6}>
            <Text fontSize="20px" fontWeight="600" color="#111111" mb={2}>2. Select Templates</Text>
            <Text fontSize="15px" color="#6B7280" mb={6}>Choose the formats to apply to your selected contexts.</Text>
            <Box display="grid" gridTemplateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", xl: "repeat(5, 1fr)" }} gap={4}>
              {CONTENT_TEMPLATE_OPTIONS.map((template) => (
                <TemplatePreviewCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateIds.includes(template.id)}
                  onClick={() => toggleTemplate(template.id)}
                />
              ))}
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
              onChange={(e) => setContentBrief(e.target.value)}
              minH="110px" px="16px" py="14px" resize="vertical"
              {...fieldChrome}
            />
          </Box>

          {/* Pending batch banner */}
          {hasRatedContext && hasPendingBatch && (
            <Flex align="center" gap={4} bg="#FFF7ED" border="1px solid" borderColor="#FED7AA" borderRadius="16px" px={5} py={4}>
              <Flex w="36px" h="36px" flexShrink={0} borderRadius="10px" bg="#FFEDD5" align="center" justify="center">
                <Lock size={16} color="#EA580C" />
              </Flex>
              <Box flex={1}>
                <Text fontSize="14px" fontWeight="700" color="#9A3412">Rate your generated assets to unlock the next batch</Text>
                <Text fontSize="13px" color="#C2410C" mt={0.5}>Go to Assets and give every image a star rating before generating again.</Text>
              </Box>
              <Button size="sm" h="36px" px={4} borderRadius="10px" bg="#EA580C" color="white" fontSize="13px" fontWeight="600" _hover={{ bg: "#C2410C" }} onClick={onNavigateToAssets} flexShrink={0}>
                <Flex align="center" gap={1.5}><Star size={13} />View Assets</Flex>
              </Button>
            </Flex>
          )}

          {/* Rating gate banner */}
          {!hasRatedContext && (
            <Flex align="center" gap={4} bg="#FFFBEB" border="1px solid" borderColor="#FDE68A" borderRadius="16px" px={5} py={4}>
              <Flex w="36px" h="36px" flexShrink={0} borderRadius="10px" bg="#FEF3C7" align="center" justify="center">
                <Lock size={16} color="#D97706" />
              </Flex>
              <Box flex={1}>
                <Text fontSize="14px" fontWeight="700" color="#92400E">Rate all contexts to unlock generation</Text>
                <Text fontSize="13px" color="#B45309" mt={0.5}>Go to the Brands tab and give every context a star rating before generating.</Text>
              </Box>
              <Button size="sm" h="36px" px={4} borderRadius="10px" bg="#D97706" color="white" fontSize="13px" fontWeight="600" _hover={{ bg: "#B45309" }} onClick={onNavigateToBrands} flexShrink={0}>
                <Flex align="center" gap={1.5}><Star size={13} />Rate Now</Flex>
              </Button>
            </Flex>
          )}

          {/* Sticky Generate Bar */}
          <Box
            position="sticky" bottom={{ base: 2, md: 4 }}
            bg="rgba(255,255,255,0.9)" backdropFilter="blur(12px)"
            border="1px solid" borderColor={hasRatedContext ? "#ECECEC" : "#FDE68A"}
            borderRadius="20px" px={{ base: 4, md: 6 }} py={4}
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

          {contentError && (
            <Box mt={4} bg="red.50" border="1px solid" borderColor="red.200" color="red.600" fontSize="sm" borderRadius="14px" p={4}>
              {contentError}
            </Box>
          )}

          {/* Generating modal */}
          {isGenerating && (
            <Flex position="fixed" inset={0} zIndex={1000} bg="rgba(0,0,0,0.5)" backdropFilter="blur(6px)" align="center" justify="center">
              <Box bg="white" borderRadius="24px" p={{ base: 8, md: 10 }} textAlign="center" maxW="420px" w="90%" boxShadow="0 24px 64px rgba(0,0,0,0.2)" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                <Flex w="64px" h="64px" borderRadius="16px" bg="#EEF2FF" align="center" justify="center" mx="auto" mb={5}>
                  <Loader size={28} color="#4F46E5" style={{ animation: "spin 1.5s linear infinite" }} />
                </Flex>
                <Text fontSize="22px" fontWeight="700" color="#111" mb={2}>Queuing {effectiveTotalPosts} Ads</Text>
                <Text fontSize="15px" color="#6B7280" lineHeight="1.5" mb={2}>
                  Setting up {effectiveTotalPosts} Post variations across {Math.min(selectedContextIds.length * selectedTemplateIds.length, MAX_COMBINATIONS)} context-template combination{cappedCombinations !== 1 ? "s" : ""}.
                </Text>
                <Text fontSize="14px" color="#7C3AED" fontWeight="500" lineHeight="1.5" mb={4}>
                  Go grab a coffee — everything generates in the background, even if you close this tab.
                </Text>
                <Flex justify="center" gap={1.5}>
                  {[0, 1, 2].map((i) => (
                    <Box key={i} w="8px" h="8px" borderRadius="full" bg="#4F46E5" style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </Flex>
              </Box>
            </Flex>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* CAROUSEL TAB                                                        */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeMode === "carousel" && (
        <VStack align="stretch" gap={8}>

          {/* Theme picker */}
          <Box>
            <Flex align="baseline" gap={3} mb={2}>
              <Text fontSize="20px" fontWeight="600" color="#111111">1. Choose Carousel Themes</Text>
              <Text fontSize="13px" color="#6B7280">Select one or more — each generates 1 variation of 5 slides.</Text>
            </Flex>
            <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }} gap={4} mt={5}>
              {CAROUSEL_THEME_OPTIONS.map((theme) => (
                <SelectionCard
                  key={theme.id}
                  isSelected={selectedThemeIds.includes(theme.id)}
                  onClick={() => toggleTheme(theme.id)}
                  icon={theme.icon}
                  label={theme.label}
                  description={theme.description}
                  accent="#7C3AED"
                />
              ))}
            </Box>
          </Box>

          {/* Context selector (optional) */}
          {contextBlocks.length > 0 && (
            <Box>
              <Flex align="baseline" gap={3} mb={2}>
                <Text fontSize="20px" fontWeight="600" color="#111111">2. Ground in a Context</Text>
                <Text fontSize="13px" color="#6B7280">Optional — anchors carousel copy in a specific brand narrative.</Text>
              </Flex>
              <Flex gap={3} mt={4} wrap="wrap">
                {contextBlocks.map((block) => {
                  const isActive = carouselContextIndex === block.context_index;
                  return (
                    <Box
                      key={block.context_index}
                      px={4} py={2.5} borderRadius="12px" cursor="pointer"
                      border="2px solid" borderColor={isActive ? "#7C3AED" : "#E5E7EB"}
                      bg={isActive ? "#F5F3FF" : "white"}
                      color={isActive ? "#7C3AED" : "#374151"}
                      fontSize="14px" fontWeight={isActive ? "600" : "500"}
                      transition="all 0.15s ease"
                      _hover={{ borderColor: "#7C3AED", bg: "#F5F3FF" }}
                      onClick={() => toggleCarouselContext(block.context_index)}
                    >
                      {block.title}
                    </Box>
                  );
                })}
              </Flex>
              {carouselContextIndex !== null && (
                <Text fontSize="12px" color="#7C3AED" mt={2} fontWeight="500">
                  ✓ Carousel copy will be grounded in &ldquo;{contextBlocks.find(b => b.context_index === carouselContextIndex)?.title}&rdquo;
                </Text>
              )}
            </Box>
          )}

          {/* Brief */}
          <Box>
            <Text fontSize="20px" fontWeight="600" color="#111111" mb={2}>
              {contextBlocks.length > 0 ? "3." : "2."} Add a Brief
            </Text>
            <Text fontSize="15px" color="#6B7280" mb={4}>Optional — describe the angle, campaign goal, or target audience.</Text>
            <Textarea
              placeholder="e.g. Focus on onboarding new users to our dashboard feature. Tone: friendly and approachable."
              value={carouselBrief}
              onChange={(e) => setCarouselBrief(e.target.value)}
              minH="110px" px="16px" py="14px" resize="vertical"
              {...fieldChrome}
            />
          </Box>

          {/* Error */}
          {carouselError && (
            <Box bg="red.50" border="1px solid" borderColor="red.200" color="red.600" fontSize="sm" borderRadius="14px" p={4}>
              {carouselError}
            </Box>
          )}

          {/* Generate button + summary */}
          <Box
            bg="white" border="1px solid" borderColor="#E5E7EB"
            borderRadius="20px" px={6} py={5}
          >
            <Flex align={{ base: "stretch", md: "center" }} justify="space-between" direction={{ base: "column", md: "row" }} gap={4}>
              {/* Summary pill */}
              <Flex align="center" gap={4} bg="#F5F3FF" border="1px solid" borderColor="#DDD6FE" borderRadius="16px" px={5} py={3} wrap="wrap">
                <Box textAlign="center">
                  <Text fontSize="18px" fontWeight="700" color="#7C3AED">{selectedThemeIds.length}</Text>
                  <Text fontSize="12px" color="#6B7280" textTransform="uppercase">Themes</Text>
                </Box>
                <Text color="#9CA3AF">&times;</Text>
                <Box textAlign="center">
                  <Text fontSize="18px" fontWeight="700" color="#7C3AED">5</Text>
                  <Text fontSize="12px" color="#6B7280" textTransform="uppercase">Slides</Text>
                </Box>
                <Text color="#9CA3AF">=</Text>
                <Box textAlign="center">
                  <Text fontSize="18px" fontWeight="700" color="#7C3AED">{selectedThemeIds.length * 5}</Text>
                  <Text fontSize="12px" color="#7C3AED" textTransform="uppercase">Total Slides</Text>
                </Box>
              </Flex>

              {/* Generate button */}
              <Button
                bg={selectedThemeIds.length > 0 ? "#7C3AED" : "#D1D5DB"}
                color="white" borderRadius="14px" h="52px" px={7}
                fontSize="15px" fontWeight="600"
                _hover={{ bg: selectedThemeIds.length > 0 ? "#6D28D9" : "#D1D5DB" }}
                disabled={selectedThemeIds.length === 0 || isGeneratingCarousel}
                onClick={handleGenerateCarousel}
              >
                <Flex align="center" gap={2}>
                  {isGeneratingCarousel
                    ? <><Loader size={16} style={{ animation: "spin 1.5s linear infinite" }} /> Queuing...</>
                    : selectedThemeIds.length === 0
                      ? "Select a Theme First"
                      : `Generate Carousel \u2192 ${selectedThemeIds.length}\u00d75 slides`}
                </Flex>
              </Button>
            </Flex>
          </Box>

          {/* Generating modal for carousel */}
          {isGeneratingCarousel && (
            <Flex position="fixed" inset={0} zIndex={1000} bg="rgba(0,0,0,0.5)" backdropFilter="blur(6px)" align="center" justify="center">
              <Box bg="white" borderRadius="24px" p={{ base: 8, md: 10 }} textAlign="center" maxW="420px" w="90%" boxShadow="0 24px 64px rgba(0,0,0,0.2)" style={{ animation: "fadeInUp 0.3s ease-out" }}>
                <Flex w="64px" h="64px" borderRadius="16px" bg="#F5F3FF" align="center" justify="center" mx="auto" mb={5}>
                  <Loader size={28} color="#7C3AED" style={{ animation: "spin 1.5s linear infinite" }} />
                </Flex>
                <Text fontSize="22px" fontWeight="700" color="#111" mb={2}>
                  Queuing Carousel — {selectedThemeIds.length * 5} Slides
                </Text>
                <Text fontSize="15px" color="#6B7280" lineHeight="1.5" mb={2}>
                  {selectedThemeIds.length} variation{selectedThemeIds.length !== 1 ? "s" : ""} × 5 slides each. Images generate in the background.
                </Text>
                <Text fontSize="14px" color="#7C3AED" fontWeight="500" lineHeight="1.5" mb={4}>
                  Head over to Assets when ready — slides will appear as a bundled carousel card.
                </Text>
                <Flex justify="center" gap={1.5}>
                  {[0, 1, 2].map((i) => (
                    <Box key={i} w="8px" h="8px" borderRadius="full" bg="#7C3AED" style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </Flex>
              </Box>
            </Flex>
          )}
        </VStack>
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
