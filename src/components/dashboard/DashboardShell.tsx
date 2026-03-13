"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Flex, Text, VStack, Spinner, Textarea } from "@chakra-ui/react";
import { Settings, Sparkles, FileText, Plus, Building2, Star, LogOut } from "lucide-react";
import { streamContextFeedback } from "@/api";
import { navItems } from "@/constants/dashboard";
import { DashboardShellProps } from "@/props/DashboardShell";
import CreateBrandPanel from "@/components/dashboard/CreateBrandPanel";
import ContentTab from "@/components/dashboard/ContentTab";
import { supabase } from "@/lib/supabase";
import { splitContextMd } from "@/lib/contextSplitter";
import { useAuth } from "@/store/AuthProvider";
import type { ContextBlock } from "@/types/onboarding.types";

interface BrandData {
  id: string;
  name: string;
  website_url: string | null;
  manifest: string | null;
  guardrails: string | null;
  industry: string | null;
  created_at?: string;
}

interface CardNoticeState {
  type: "success" | "error";
  message: string;
}

interface CardDiffState {
  previousSection: ContextBlock;
  updatedSection: ContextBlock;
}

const ACTIVE_BRAND_STORAGE_KEY = "dashboard_active_brand_id";

function getHostnameLabel(websiteUrl: string | null): string {
  if (!websiteUrl) return "No website";

  try {
    return new URL(websiteUrl).hostname.replace(/^www\./, "");
  } catch {
    return websiteUrl.replace(/^https?:\/\//, "").replace(/^www\./, "");
  }
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getPrimaryObjective(context: string | null): string {
  if (!context) return "No primary objective available yet.";

  const firstSentence = context
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)[0]
    ?.trim();

  return firstSentence || "No primary objective available yet.";
}

function getContextTags(block: { title: string; content: string }, industry: string | null): string[] {
  const baseTags = industry ? [industry] : [];
  const keywordMap = [
    { label: "Employer Branding", keywords: ["employee", "team", "culture", "retention", "workforce"] },
    { label: "Compliance", keywords: ["compliance", "certificate", "reporting", "esg"] },
    { label: "B2B Culture", keywords: ["b2b", "corporate", "business"] },
    { label: "Sustainability", keywords: ["sustainability", "environmental", "eco", "carbon"] },
    { label: "Community", keywords: ["community", "movement", "participation"] },
    { label: "Innovation", keywords: ["innovation", "design", "technology"] },
    { label: "Data-Driven", keywords: ["data", "measurable", "analytics", "dashboard"] },
  ];
  const source = `${block.title} ${block.content}`.toLowerCase();
  const derivedTags = keywordMap
    .filter((tag) => tag.keywords.some((keyword) => source.includes(keyword)))
    .slice(0, 2)
    .map((tag) => tag.label);

  return [...baseTags, ...derivedTags].slice(0, 2);
}

function getBrandSummary(brand: BrandData) {
  const contextBlocks = brand.manifest ? splitContextMd(brand.manifest) : [];

  return {
    contextBlocks,
    hostname: getHostnameLabel(brand.website_url),
    primaryObjective: getPrimaryObjective(contextBlocks[0]?.content ?? null),
  };
}

function getFeedbackKey(brandId: string, contextIndex: number): string {
  return `${brandId}:${contextIndex}`;
}

function normalizeSentence(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function splitSentences(value: string): string[] {
  return value
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getHighlightedParagraphs(currentContent: string, previousContent?: string) {
  const previousSentences = new Set(splitSentences(previousContent || "").map(normalizeSentence));

  return currentContent.split("\n").map((paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return [];

    return splitSentences(trimmed).map((sentence) => ({
      text: sentence,
      isChanged: previousContent ? !previousSentences.has(normalizeSentence(sentence)) : false,
    }));
  });
}

function parseStreamedContextBlock(rawMarkdown: string, fallback: ContextBlock): ContextBlock {
  const cleaned = rawMarkdown
    .replace(/^```markdown\s*/, "")
    .replace(/^```\s*/, "")
    .replace(/```$/, "")
    .trim();

  const headingMatch = cleaned.match(/^##\s*(\d+)\.\s*(.+)$/m);
  const title = headingMatch?.[2]?.trim() || fallback.title;
  const content = headingMatch
    ? cleaned.slice(cleaned.indexOf(headingMatch[0]) + headingMatch[0].length).trim()
    : cleaned;

  return {
    context_index: fallback.context_index,
    title,
    content: content || fallback.content,
  };
}

/**
 * DashboardShell Component
 * Provides the base dashboard layout with the left sidebar navigation.
 *
 * @param brandId - The most recently claimed brand ID, if available
 */
export default function DashboardShell({ brandId }: DashboardShellProps) {
  const { user, session, signOut } = useAuth();
  const noticeTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const feedbackFieldChrome = {
    bg: "white",
    border: "1px solid",
    borderColor: "#D8DDE6",
    borderRadius: "16px",
    fontSize: "15px",
    color: "#111111",
    transition: "all 0.18s ease",
    _placeholder: {
      color: "#9CA3AF",
    },
    _hover: {
      borderColor: "#C5CCD8",
    },
    _focusVisible: {
      borderColor: "#4F46E5",
      boxShadow: "0 0 0 4px rgba(79, 70, 229, 0.14)",
    },
  } as const;
  const [activeView, setActiveView] = useState<"brands" | "content" | "calendar" | "integrations">("brands");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [allBrands, setAllBrands] = useState<BrandData[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [createdBrandId, setCreatedBrandId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});
  const [openFeedbackKey, setOpenFeedbackKey] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [cardNotices, setCardNotices] = useState<Record<string, CardNoticeState>>({});
  const [cardDiffs, setCardDiffs] = useState<Record<string, CardDiffState>>({});
  const [streamingBlocks, setStreamingBlocks] = useState<Record<string, ContextBlock>>({});

  useEffect(() => {
    const timeoutRegistry = noticeTimeoutsRef.current;
    return () => {
      Object.values(timeoutRegistry).forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedBrandId = window.localStorage.getItem(ACTIVE_BRAND_STORAGE_KEY);
    if (storedBrandId) {
      setSelectedBrandId(storedBrandId);
    }
  }, []);

  // Fetch all brands from Supabase
  useEffect(() => {
    async function fetchAllBrands() {
      setIsLoadingBrands(true);
      try {
        // First try to fetch user's brands (if authenticated)
        let query = supabase
          .from("brands")
          .select("id, name, website_url, manifest, guardrails, industry, created_at")
          .order("created_at", { ascending: false });

        // If user is authenticated, filter by user_id
        if (user?.id) {
          query = query.eq("user_id", user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching brands:", error);
        } else {
          setAllBrands(data || []);
          // Set selected brand to the stored active brand, a newly created brand, or fallback
          if (data && data.length > 0) {
            setSelectedBrandId((current) => current || createdBrandId || brandId || data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      } finally {
        setIsLoadingBrands(false);
      }
    }

    fetchAllBrands();
  }, [user?.id, createdBrandId, brandId]);

  // Get the currently selected brand data
  const selectedBrand = allBrands.find((b) => b.id === selectedBrandId) || null;
  const selectedBrandSummary = selectedBrand ? getBrandSummary(selectedBrand) : null;
  const contextBlocks = useMemo(() => selectedBrandSummary?.contextBlocks ?? [], [selectedBrandSummary]);

  const handleSelectActiveBrand = (brandIdValue: string) => {
    setSelectedBrandId(brandIdValue);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, brandIdValue);
    }
  };

  const handleSignOut = async () => {
    if (!signOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const setCardNotice = (key: string, notice: CardNoticeState | null) => {
    const currentTimeout = noticeTimeoutsRef.current[key];
    if (currentTimeout) {
      clearTimeout(currentTimeout);
      delete noticeTimeoutsRef.current[key];
    }

    setCardNotices((prev) => {
      const next = { ...prev };
      if (notice) {
        next[key] = notice;
      } else {
        delete next[key];
      }
      return next;
    });

    if (notice?.type === "success") {
      noticeTimeoutsRef.current[key] = setTimeout(() => {
        setCardNotices((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        delete noticeTimeoutsRef.current[key];
      }, 5000);
    }
  };

  const handleRatingSelect = (block: ContextBlock, rating: number) => {
    if (!selectedBrand || submittingKey) return;

    const key = getFeedbackKey(selectedBrand.id, block.context_index);
    setRatings((prev) => ({ ...prev, [key]: rating }));
    setCardNotice(key, null);
    setStreamingBlocks((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    if (rating < 3) {
      setOpenFeedbackKey(key);
      return;
    }

    setOpenFeedbackKey((current) => (current === key ? null : current));
  };

  const handleRegenerateContext = async (block: ContextBlock) => {
    if (submittingKey) return;

    if (!selectedBrand || !session?.access_token) {
      setCardNotice(getFeedbackKey(selectedBrand?.id || "unknown", block.context_index), {
        type: "error",
        message: "You need an authenticated session to regenerate context.",
      });
      return;
    }

    const key = getFeedbackKey(selectedBrand.id, block.context_index);
    const rating = ratings[key];
    if (!rating || rating >= 3) {
      setCardNotice(key, {
        type: "error",
        message: "Regeneration is only available for ratings below 3 stars.",
      });
      return;
    }

    setSubmittingKey(key);
    setCardNotice(key, null);

    try {
      const previousSection = block;
      let streamedMarkdown = "";

      setStreamingBlocks((prev) => ({
        ...prev,
        [key]: {
          ...block,
          content: "",
        },
      }));

      for await (const event of streamContextFeedback(
        selectedBrand.id,
        {
          context_index: block.context_index,
          rating: rating as 1 | 2,
          feedback: feedbackDrafts[key]?.trim() || undefined,
        },
        session.access_token
      )) {
        if (event.event === "context_chunk" && event.data.chunk) {
          streamedMarkdown += event.data.chunk;
          setStreamingBlocks((prev) => ({
            ...prev,
            [key]: parseStreamedContextBlock(streamedMarkdown, block),
          }));
        }

        if (event.event === "error") {
          throw { message: event.data.message || "Failed to regenerate this context." };
        }

        if (event.event === "complete" && event.data.data) {
          const responseData = event.data.data;
          setAllBrands((prev) =>
            prev.map((brand) =>
              brand.id === selectedBrand.id ? { ...brand, manifest: responseData.context_md } : brand
            )
          );
          setCardDiffs((prev) => ({
            ...prev,
            [key]: {
              previousSection,
              updatedSection: responseData.updated_section,
            },
          }));
          setCardNotice(key, {
            type: "success",
            message: event.data.message || "Context regenerated successfully",
          });
          setOpenFeedbackKey(null);
        }
      }
    } catch (error) {
      const apiError = error as { message?: string };
      setCardNotice(key, {
        type: "error",
        message: apiError.message || "Failed to regenerate this context.",
      });
    } finally {
      setStreamingBlocks((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setSubmittingKey(null);
    }
  };

  return (
    <Flex minH="100vh" bg="#F8F8F6" direction={{ base: "column", lg: "row" }}>
      <Box
        w={{ base: "full", lg: "260px" }}
        bg="#F8F8F6"
        borderRight={{ base: "none", lg: "1px solid" }}
        borderBottom={{ base: "1px solid", lg: "none" }}
        borderColor="#ECECEC"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 6 }}
        display="flex"
        flexDirection="column"
        gap={{ base: 4, lg: 8 }}
        flexShrink={0}
      >
        <Flex align="center" gap={3} fontWeight="700" fontSize="lg" color="#111111">
          <Flex
            w="32px"
            h="32px"
            borderRadius="10px"
            bg="#4F46E5"
            align="center"
            justify="center"
            color="white"
          >
            <Sparkles size={18} strokeWidth={2.5} />
          </Flex>
          <Text>Insta Agent</Text>
        </Flex>

        <Flex
          as="nav"
          direction={{ base: "row", lg: "column" }}
          gap={2}
          overflowX={{ base: "auto", lg: "visible" }}
          pb={{ base: 1, lg: 0 }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const viewKey =
              item.label === "Brands"
                ? "brands"
                : item.label === "Content"
                  ? "content"
                  : item.label === "Calendar"
                    ? "calendar"
                    : "integrations";
            const isActive = activeView === viewKey;
            return (
              <Flex
                key={item.label}
                align="center"
                gap={3}
                px={3.5}
                py={2.5}
                borderRadius="14px"
                minW={{ base: "max-content", lg: "auto" }}
                color={isActive ? "#4F46E5" : "#6B7280"}
                bg={isActive ? "#FFFFFF" : "transparent"}
                boxShadow={isActive ? "0 2px 8px rgba(0,0,0,0.02)" : "none"}
                cursor="pointer"
                _hover={{ bg: "#FFFFFF", color: "#111111" }}
                transition="all 0.2s ease"
                fontSize="15px"
                fontWeight="500"
                onClick={() => setActiveView(viewKey)}
              >
                <Icon size={18} />
                <Text>{item.label}</Text>
              </Flex>
            );
          })}
        </Flex>

        <Flex
          align="center"
          gap={3}
          px={3.5}
          py={2.5}
          borderRadius="14px"
          color="#6B7280"
          cursor="pointer"
          _hover={{ bg: "#FFFFFF", color: "#111111" }}
          transition="all 0.2s ease"
          fontSize="15px"
          fontWeight="500"
          mt={{ base: 1, lg: "auto" }}
          display={{ base: "none", lg: "flex" }}
        >
          <Settings size={18} />
          <Text>Settings</Text>
        </Flex>
      </Box>

      <Flex flex={1} direction="column" overflow="hidden">
        <Flex
          minH={{ base: "auto", md: "80px" }}
          px={{ base: 4, md: 8, xl: 12 }}
          py={{ base: 4, md: 0 }}
          align={{ base: "stretch", md: "center" }}
          justify="space-between"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 0 }}
        >
          <Text fontSize="xl" fontWeight="700" color="#111111">
            {activeView === "content"
              ? "Content Agent"
              : allBrands.length > 0
                ? `Your Brands (${allBrands.length})`
                : "Create Your First Brand"}
          </Text>
          <Flex direction={{ base: "column", sm: "row" }} gap={3} w={{ base: "full", md: "auto" }}>
            <Button
              bg="#4F46E5"
              color="white"
              h="42px"
              px={6}
              fontSize="14px"
              fontWeight="700"
              borderRadius="12px"
              boxShadow="0 6px 16px rgba(79, 70, 229, 0.25)"
              _hover={{
                bg: "#4338CA",
                transform: "translateY(-1px)",
                boxShadow: "0 10px 24px rgba(79, 70, 229, 0.28)",
              }}
              _active={{ transform: "translateY(0)" }}
              onClick={() => setIsCreateOpen(true)}
              w={{ base: "full", md: "auto" }}
            >
              <Flex align="center" gap={2}>
                <Plus size={18} />
                Create Brand
              </Flex>
            </Button>
            <Button
              variant="outline"
              borderColor="#D1D5DB"
              color="#4F46E5"
              h="42px"
              px={6}
              fontSize="14px"
              fontWeight="700"
              borderRadius="12px"
              bg="white"
              _hover={{ bg: "#F5F5FF" }}
              _active={{ transform: "translateY(0)" }}
              onClick={handleSignOut}
              isLoading={isSigningOut}
              w={{ base: "full", md: "auto" }}
            >
              <Flex align="center" gap={2}>
                <LogOut size={18} />
                Sign Out
              </Flex>
            </Button>
          </Flex>
        </Flex>
        <Flex
          flex={1}
          px={{ base: 4, md: 8, xl: 12 }}
          pb={{ base: 6, md: 10, xl: 12 }}
          gap={{ base: 6, xl: 8 }}
          align="flex-start"
          overflow={{ base: "visible", xl: "hidden" }}
          direction={{ base: "column", xl: "row" }}
        >
          {activeView !== "content" ? (
            <Box
              w={{ base: "full", xl: "420px" }}
              flexShrink={0}
              overflowY={{ base: "visible", xl: "auto" }}
              maxH={{ base: "none", xl: "calc(100vh - 140px)" }}
            >
              {isLoadingBrands ? (
                <Flex align="center" justify="center" py={8}>
                  <Spinner size="md" color="#4F46E5" />
                </Flex>
              ) : allBrands.length === 0 ? (
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="#ECECEC"
                  borderRadius="20px"
                  p={6}
                  textAlign="center"
                >
                  <Flex
                    w="48px"
                    h="48px"
                    borderRadius="12px"
                    bg="rgba(79, 70, 229, 0.08)"
                    color="#4F46E5"
                    align="center"
                    justify="center"
                    mx="auto"
                    mb={3}
                  >
                    <Building2 size={24} />
                  </Flex>
                  <Text fontSize="md" fontWeight="600" color="#111111" mb={2}>
                    No brands yet
                  </Text>
                  <Text fontSize="sm" color="#6B7280" mb={4}>
                    Create your first brand to get started
                  </Text>
                  <Button
                    bg="#4F46E5"
                    color="white"
                    h="38px"
                    fontSize="13px"
                    fontWeight="600"
                    borderRadius="10px"
                    onClick={() => setIsCreateOpen(true)}
                  >
                    Create Brand
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Text
                    fontSize="13px"
                    fontWeight="800"
                    color="#6B7280"
                    letterSpacing="0.04em"
                    mb={4}
                  >
                    SELECT BRAND
                  </Text>
                  <VStack gap={5} align="stretch">
                    {allBrands.map((brand) => (
                      (() => {
                        const summary = getBrandSummary(brand);
                        const isSelected = selectedBrandId === brand.id;

                        return (
                          <Box
                            key={brand.id}
                            bg="white"
                            border="1px solid"
                            borderColor={isSelected ? "#4F46E5" : "#ECECEC"}
                            borderRadius="24px"
                            p={{ base: 5, md: 8 }}
                            boxShadow={isSelected ? "0 14px 36px rgba(79, 70, 229, 0.14)" : "0 12px 48px rgba(0, 0, 0, 0.04)"}
                            transition="all 0.2s ease"
                            _hover={{
                              borderColor: "#4F46E5",
                              transform: "translateY(-2px)",
                            }}
                          >
                            <Flex align="center" justify="space-between" mb={5}>
                              <Flex align="center" gap={4} minW={0}>
                                <Flex
                                  w={{ base: "52px", md: "60px" }}
                                  h={{ base: "52px", md: "60px" }}
                                  borderRadius="18px"
                                  bg="#E6F5EC"
                                  color="#2F855A"
                                  align="center"
                                  justify="center"
                                  fontSize="lg"
                                  fontWeight="800"
                                  flexShrink={0}
                                >
                                  {getInitials(brand.name)}
                                </Flex>
                                <Box minW={0}>
                                  <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="700" color="#111111" lineHeight="1.15">
                                    {brand.name}
                                  </Text>
                                  <Text fontSize={{ base: "lg", md: "xl" }} color="#6B7280" truncate>
                                    {summary.hostname}
                                  </Text>
                                </Box>
                              </Flex>
                              <Button
                                size="sm"
                                bg={isSelected ? "#EEF2FF" : "#4F46E5"}
                                color={isSelected ? "#4338CA" : "white"}
                                borderRadius="999px"
                                px={4}
                                _hover={{ bg: isSelected ? "#E0E7FF" : "#4338CA" }}
                                onClick={() => handleSelectActiveBrand(brand.id)}
                              >
                                {isSelected ? "Active Brand" : "Set Active"}
                              </Button>
                            </Flex>

                            <Box borderTop="1px solid" borderColor="#ECECEC" pt={5}>
                              <Text fontSize="11px" fontWeight="800" color="#6B7280" letterSpacing="0.08em" mb={3}>
                                MAIN OBJECTIVE
                              </Text>
                              <Text fontSize={{ base: "15px", md: "16px" }} lineHeight="1.55" color="#111111" mb={6}>
                                {summary.primaryObjective}
                              </Text>

                              {brand.manifest && (
                                <Flex align="center" gap={2} fontSize="12px" color="#6B7280">
                                  <FileText size={14} />
                                  <Text>Context generated</Text>
                                </Flex>
                              )}
                            </Box>
                          </Box>
                        );
                      })()
                    ))}
                  </VStack>
                </Box>
              )}
            </Box>
          ) : null}

          {/* Right: Selected Brand Details */}
          <Box
            flex={1}
            w="full"
            overflowY={{ base: "visible", xl: "auto" }}
            maxH={{ base: "none", xl: "calc(100vh - 140px)" }}
          >
            {activeView === "content" ? (
              <ContentTab
                brand={selectedBrand ? { id: selectedBrand.id, name: selectedBrand.name, industry: selectedBrand.industry } : null}
                contextBlocks={contextBlocks}
                token={session?.access_token}
              />
            ) : isLoadingBrands ? (
              <Flex align="center" justify="center" h="full">
                <Spinner size="lg" color="#4F46E5" />
              </Flex>
            ) : selectedBrand ? (
              selectedBrand.manifest ? (
                <VStack align="stretch" gap={6}>
                  {contextBlocks.map((block) => {
                    const tags = getContextTags(block, selectedBrand.industry);
                    const feedbackKey = getFeedbackKey(selectedBrand.id, block.context_index);
                    const renderedBlock = streamingBlocks[feedbackKey] || block;
                    const selectedRating = ratings[feedbackKey] ?? 0;
                    const isFeedbackOpen = openFeedbackKey === feedbackKey;
                    const isSubmitting = submittingKey === feedbackKey;
                    const cardNotice = cardNotices[feedbackKey];
                    const cardDiff = cardDiffs[feedbackKey];
                    const previousContent = cardDiff?.updatedSection.context_index === block.context_index
                      ? cardDiff.previousSection.content
                      : undefined;
                    const highlightedParagraphs = getHighlightedParagraphs(renderedBlock.content, previousContent);
                    const hasTitleChanged =
                      cardDiff?.updatedSection.context_index === block.context_index &&
                      cardDiff.previousSection.title !== renderedBlock.title;

                    return (
                      <Box
                        key={block.context_index}
                        bg="white"
                        border="1px solid"
                        borderColor={
                          isSubmitting
                            ? "#4F46E5"
                            : cardNotice?.type === "success"
                              ? "#86EFAC"
                              : cardNotice?.type === "error"
                                ? "#FECACA"
                                : "#ECECEC"
                        }
                        borderRadius="24px"
                        p={{ base: 5, md: 8 }}
                        boxShadow={
                          isSubmitting
                            ? "0 16px 40px rgba(79, 70, 229, 0.18)"
                            : cardNotice?.type === "success"
                              ? "0 14px 36px rgba(34, 197, 94, 0.12)"
                              : "0 12px 48px rgba(0, 0, 0, 0.04)"
                        }
                        position="relative"
                        overflow="hidden"
                      >
                        {isSubmitting && (
                          <Box
                            position="absolute"
                            inset={0}
                            zIndex={2}
                            pointerEvents="none"
                            css={{
                              "@keyframes regenerationSweep": {
                                "0%": { backgroundPosition: "200% 0" },
                                "100%": { backgroundPosition: "-200% 0" },
                              },
                            }}
                          >
                            <Box
                              position="absolute"
                              top={0}
                              left={0}
                              right={0}
                              h="5px"
                              bgGradient="linear(to-r, transparent, #4F46E5, #A78BFA, #4F46E5, transparent)"
                              backgroundSize="200% 100%"
                              animation="regenerationSweep 1.8s linear infinite"
                            />
                          </Box>
                        )}
                        <Flex gap={3} wrap="wrap" mb={6}>
                          {tags.map((tag) => (
                            <Box
                              key={`${block.context_index}-${tag}`}
                              px={4}
                              py={2}
                              borderRadius="999px"
                              border="1px solid"
                              borderColor="#E5E7EB"
                              bg="#FAFAFA"
                            >
                              <Text fontSize="14px" fontWeight="700" color="#6B7280">
                                {tag}
                              </Text>
                            </Box>
                          ))}
                        </Flex>

                        <Text
                          fontSize={{ base: "2xl", md: "3xl" }}
                          fontWeight="700"
                          color="#111111"
                          lineHeight="1.15"
                          mb={5}
                          bg={hasTitleChanged ? "rgba(254, 240, 138, 0.45)" : "transparent"}
                          display="inline"
                          px={hasTitleChanged ? 1.5 : 0}
                          py={hasTitleChanged ? 0.5 : 0}
                          borderRadius={hasTitleChanged ? "8px" : "0"}
                        >
                          {renderedBlock.title}
                        </Text>
                        <Box
                          fontSize={{ base: "16px", md: "18px" }}
                          color="#5B6472"
                          lineHeight="1.65"
                          pb={8}
                          borderBottom="1px solid"
                          borderColor="#ECECEC"
                        >
                          <VStack align="stretch" gap={3}>
                            {highlightedParagraphs.map((paragraph, paragraphIndex) => (
                              <Text key={`${feedbackKey}-paragraph-${paragraphIndex}`}>
                                {paragraph.length === 0 ? "\u00A0" : paragraph.map((sentence, sentenceIndex) => (
                                  <Box
                                    as="span"
                                    key={`${feedbackKey}-sentence-${paragraphIndex}-${sentenceIndex}`}
                                    bg={sentence.isChanged ? "rgba(254, 240, 138, 0.55)" : "transparent"}
                                    borderRadius={sentence.isChanged ? "8px" : "0"}
                                    px={sentence.isChanged ? 1 : 0}
                                    py={sentence.isChanged ? 0.5 : 0}
                                    transition="background-color 0.2s ease"
                                  >
                                    {sentence.text}{" "}
                                  </Box>
                                ))}
                              </Text>
                            ))}
                          </VStack>
                        </Box>

                        <Flex
                          align={{ base: "flex-start", md: "center" }}
                          justify="space-between"
                          direction={{ base: "column", md: "row" }}
                          gap={4}
                          pt={8}
                        >
                          <Text fontSize="16px" fontWeight="700" color="#6B7280">
                            Rate this direction:
                          </Text>
                          <Flex gap={2}>
                            {Array.from({ length: 5 }, (_, index) => (
                              <Box
                                as="button"
                                key={`${block.context_index}-star-${index + 1}`}
                                onClick={() => handleRatingSelect(block, index + 1)}
                                color="inherit"
                                transition="transform 0.15s ease"
                                _hover={{ transform: "translateY(-1px)" }}
                                disabled={Boolean(submittingKey)}
                                opacity={submittingKey && !isSubmitting ? 0.45 : 1}
                              >
                                <Star
                                  size={24}
                                  color={index + 1 <= selectedRating ? "#F59E0B" : "#D1D5DB"}
                                  fill={index + 1 <= selectedRating ? "#FDE68A" : "transparent"}
                                  strokeWidth={1.8}
                                />
                              </Box>
                            ))}
                          </Flex>
                        </Flex>

                        {cardNotice && (
                          <Box
                            mt={5}
                            bg={cardNotice.type === "success" ? "green.50" : "red.50"}
                            border="1px solid"
                            borderColor={cardNotice.type === "success" ? "green.200" : "red.200"}
                            color={cardNotice.type === "success" ? "green.700" : "red.600"}
                            fontSize="sm"
                            borderRadius="14px"
                            p={4}
                          >
                            {cardNotice.message}
                          </Box>
                        )}

                        {isFeedbackOpen && (
                          <Box
                            mt={6}
                            borderTop="1px solid"
                            borderColor="#ECECEC"
                            pt={6}
                          >
                            <Text fontSize="14px" fontWeight="700" color="#111111" mb={2}>
                              Optional feedback for regeneration
                            </Text>
                            <Text fontSize="13px" color="#6B7280" mb={4}>
                              This will regenerate only this context section and update the stored markdown.
                            </Text>
                            <Textarea
                              placeholder="Tell the agent what to fix in this direction."
                              value={feedbackDrafts[feedbackKey] || ""}
                              onChange={(event) =>
                                setFeedbackDrafts((prev) => ({
                                  ...prev,
                                  [feedbackKey]: event.target.value,
                                }))
                              }
                              minH="120px"
                              px="16px"
                              py="14px"
                              resize="vertical"
                              mb={4}
                              {...feedbackFieldChrome}
                            />
                            <Flex gap={3} wrap="wrap">
                              <Button
                                bg="#4F46E5"
                                color="white"
                                borderRadius="12px"
                                h="44px"
                                px={6}
                                fontSize="14px"
                                fontWeight="700"
                                boxShadow="0 6px 16px rgba(79, 70, 229, 0.22)"
                                _hover={{
                                  bg: "#4338CA",
                                  transform: "translateY(-1px)",
                                  boxShadow: "0 10px 24px rgba(79, 70, 229, 0.26)",
                                }}
                                _active={{ transform: "translateY(0)" }}
                                onClick={() => handleRegenerateContext(block)}
                                disabled={Boolean(submittingKey)}
                              >
                                {isSubmitting ? <Spinner size="sm" /> : "Regenerate Section"}
                              </Button>
                              <Button
                                variant="outline"
                                bg="white"
                                borderRadius="12px"
                                h="44px"
                                px={5}
                                fontSize="14px"
                                fontWeight="600"
                                borderColor="#E5E7EB"
                                color="#6B7280"
                                _hover={{ bg: "#F8F8F6", color: "#111111", borderColor: "#D1D5DB" }}
                                onClick={() => setOpenFeedbackKey(null)}
                                disabled={Boolean(submittingKey)}
                              >
                                Cancel
                              </Button>
                            </Flex>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </VStack>
              ) : (
                <Box
                  border="1px dashed"
                  borderColor="#E5E7EB"
                  borderRadius="18px"
                  p={5}
                  bg="#F9FAFB"
                  textAlign="center"
                >
                  <Text fontSize="sm" color="#6B7280">
                    No brand context generated yet. Run discovery to generate context.
                  </Text>
                </Box>
              )
            ) : (
              <Box
                bg="white"
                border="1px solid"
                borderColor="#ECECEC"
                borderRadius="24px"
                p={{ base: 6, md: 10 }}
                w="full"
                textAlign="center"
              >
                <Text fontSize="lg" color="#6B7280">
                  Select a brand to view its details
                </Text>
              </Box>
            )}
          </Box>

          {/* Create Brand Panel - Modal Overlay */}
          {isCreateOpen && (
            <Flex
              position="fixed"
              inset={0}
              bg="rgba(0, 0, 0, 0.5)"
              zIndex={1000}
              align="center"
              justify="center"
              px={{ base: 4, md: 8 }}
              py={{ base: 4, md: 6 }}
              onClick={() => setIsCreateOpen(false)}
            >
              <Box
                w="min(1180px, 100%)"
                maxH="100%"
                bg="white"
                shadow="2xl"
                borderRadius={{ base: "20px", md: "28px" }}
                overflow="auto"
                onClick={(e) => e.stopPropagation()}
                position="relative"
              >
                <CreateBrandPanel
                  isOpen={isCreateOpen}
                  onBrandCreated={(id) => {
                    setCreatedBrandId(id);
                    setSelectedBrandId(id);
                    setIsCreateOpen(false);
                  }}
                  onClose={() => setIsCreateOpen(false)}
                />
              </Box>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
