"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  VStack,
  Spinner,
  Textarea,
  IconButton,
} from "@chakra-ui/react";
import {
  Plus,
  Building2,
  Star,
  LogOut,
  Trash2,
  Camera,
  UserCircle,
  Pencil,
  X,
} from "lucide-react";
import { streamContextFeedback, deleteBrand } from "@/api";
import { navItems } from "@/constants/dashboard";
import { DashboardShellProps } from "@/props/DashboardShell";
import CreateBrandPanel from "@/components/dashboard/CreateBrandPanel";
import ContentTab from "@/components/dashboard/ContentTab";
import AssetsTab from "@/components/dashboard/AssetsTab";
import CalendarTab from "@/components/dashboard/CalendarTab";
import IntegrationsTab from "@/components/dashboard/IntegrationsTab";
import SettingsTab from "@/components/dashboard/SettingsTab";
import SupportTab from "@/components/dashboard/SupportTab";
import { supabase } from "@/lib/supabase";
import { splitContextMd } from "@/lib/contextSplitter";
import { useAuth } from "@/store/AuthProvider";
import type { ContextBlock } from "@/types/onboarding.types";
import { useCampaignPolling } from "@/hooks/useCampaignPolling";
import Image from "next/image";
import Link from "next/link";

interface BrandData {
  id: string;
  name: string;
  website_url: string | null;
  manifest: string | null;
  guardrails: string | null;
  description: string | null;
  industry: string | null;
  logo_url?: string | null;
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
const SIDEBAR_WIDTH = "220px";

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

function getHighlightedParagraphs(
  currentContent: string,
  previousContent?: string,
) {
  const previousSentences = new Set(
    splitSentences(previousContent || "").map(normalizeSentence),
  );

  return currentContent.split("\n").map((paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return [];

    return splitSentences(trimmed).map((sentence) => ({
      text: sentence,
      isChanged: previousContent
        ? !previousSentences.has(normalizeSentence(sentence))
        : false,
    }));
  });
}

function parseStreamedContextBlock(
  rawMarkdown: string,
  fallback: ContextBlock,
): ContextBlock {
  const cleaned = rawMarkdown
    .replace(/^```markdown\s*/, "")
    .replace(/^```\s*/, "")
    .replace(/```$/, "")
    .trim();

  const headingMatch = cleaned.match(/^##\s*(\d+)\.\s*(.+)$/m);
  const title = headingMatch?.[2]?.trim() || fallback.title;
  const content = headingMatch
    ? cleaned
        .slice(cleaned.indexOf(headingMatch[0]) + headingMatch[0].length)
        .trim()
    : cleaned;

  return {
    context_index: fallback.context_index,
    title,
    content: content || fallback.content,
  };
}

// ─── Brand Logo Upload Component ─────────────────────────────────────────────

function BrandLogoUpload({
  brand,
  token,
  onLogoUploaded,
}: {
  brand: BrandData;
  token: string | undefined;
  onLogoUploaded: (brandId: string, logoUrl: string) => void;
}) {
  const [logoUrl, setLogoUrl]     = useState<string | null>(brand.logo_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `logos/${brand.id}.${ext}`;

      // Upload directly to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("brand-assets")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw new Error(uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(path);

      // Persist on the brand record
      const { error: dbError } = await supabase
        .from("brands")
        .update({ logo_url: publicUrl })
        .eq("id", brand.id);

      if (dbError) throw new Error(dbError.message);

      setLogoUrl(publicUrl);
      onLogoUploaded(brand.id, publicUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Logo upload failed";
      setErrorMsg(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Flex direction="column" align="flex-start" gap={2}>
      <Text fontSize="11px" fontWeight="700" textTransform="uppercase"
        color="#9CA3AF" letterSpacing="0.06em">
        Brand Logo
      </Text>

      {/* Clickable logo preview / placeholder */}
      <Box
        position="relative"
        w="96px"
        h="96px"
        borderRadius="18px"
        border="2px dashed"
        borderColor={logoUrl ? "#4F46E5" : "#E5E7EB"}
        bg={logoUrl ? undefined : "#FAFAFA"}
        style={logoUrl ? {
          backgroundImage: "repeating-conic-gradient(#E5E7EB 0% 25%, #ffffff 0% 50%)",
          backgroundSize: "12px 12px",
          backgroundPosition: "0 0",
        } : undefined}
        overflow="hidden"
        cursor={uploading ? "not-allowed" : "pointer"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="all 0.18s ease"
        _hover={{ borderColor: "#4F46E5", ...(logoUrl ? {} : { bg: "#F0EEFF" }) }}
        onClick={() => !uploading && inputRef.current?.click()}
        title="Click to upload brand logo"
      >
        {uploading ? (
          <Spinner size="sm" color="#4F46E5" />
        ) : logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt={`${brand.name} logo`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: "8px",
            }}
          />
        ) : (
          <Flex direction="column" align="center" gap={1}>
            <Camera size={22} color="#D1D5DB" />
            <Text fontSize="10px" color="#D1D5DB" fontWeight="600" textAlign="center" lineHeight="1.2">
              Upload Logo
            </Text>
          </Flex>
        )}

        {/* Overlay on hover when logo is present */}
        {logoUrl && !uploading && (
          <Flex
            position="absolute"
            inset={0}
            bg="rgba(0,0,0,0)"
            align="center"
            justify="center"
            transition="background 0.18s ease"
            borderRadius="16px"
            _hover={{ bg: "rgba(0,0,0,0.35)" }}
            className="logo-hover-overlay"
          >
            <Camera size={18} color="rgba(255,255,255,0)" style={{ transition: "color 0.18s ease" }} />
          </Flex>
        )}
      </Box>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <Text fontSize="11px" color="#9CA3AF">PNG, JPG or WebP</Text>

      {errorMsg && (
        <Text fontSize="12px" color="#DC2626" fontWeight="500" maxW="200px">
          {errorMsg}
        </Text>
      )}
    </Flex>
  );
}


// ─── Edit Brand Slide-Over Panel ─────────────────────────────────────────────

function EditBrandPanel({
  draft,
  onChange,
  onSave,
  onClose,
  isSaving,
}: {
  draft: { name: string; website_url: string; industry: string; description: string; guardrails: string };
  onChange: (field: string, value: string) => void;
  onSave: () => void;
  onClose: () => void;
  isSaving: boolean;
}) {
  return (
    <>
      {/* Backdrop */}
      <Box position="fixed" inset={0} bg="rgba(0,0,0,0.4)" zIndex={200}
        backdropFilter="blur(2px)" onClick={onClose} />
      {/* Drawer */}
      <Box position="fixed" top={0} right={0} bottom={0}
        w={{ base: "full", sm: "460px" }} bg="white" zIndex={201}
        boxShadow="-8px 0 48px rgba(0,0,0,0.14)"
        display="flex" flexDirection="column">
        {/* Header */}
        <Flex align="center" justify="space-between" px={6} py={5}
          borderBottom="1px solid" borderColor="#F3F4F6">
          <Text fontSize="18px" fontWeight="700" color="#111111">Edit Brand</Text>
          <Button variant="ghost" size="xs" borderRadius="10px" p={1.5}
            _hover={{ bg: "#F3F4F6" }} onClick={onClose}>
            <X size={18} color="#6B7280" />
          </Button>
        </Flex>
        {/* Scrollable form */}
        <VStack align="stretch" gap={5} flex={1} overflowY="auto" px={6} py={6}>
          {/* Brand Name */}
          <Box>
            <Text fontSize="12px" fontWeight="700" color="#374151" mb={1.5}>Brand Name</Text>
            <Input value={draft.name} onChange={e => onChange("name", e.target.value)}
              fontSize="14px" borderRadius="10px" h="40px" borderColor="#E5E7EB"
              _focus={{ borderColor: "#4F46E5", boxShadow: "0 0 0 1px #4F46E5" }} />
          </Box>
          {/* Website URL */}
          <Box>
            <Text fontSize="12px" fontWeight="700" color="#374151" mb={1.5}>Website URL</Text>
            <Input value={draft.website_url} onChange={e => onChange("website_url", e.target.value)}
              placeholder="https://example.com"
              fontSize="14px" borderRadius="10px" h="40px" borderColor="#E5E7EB"
              _focus={{ borderColor: "#4F46E5", boxShadow: "0 0 0 1px #4F46E5" }} />
          </Box>
          {/* Industry */}
          <Box>
            <Text fontSize="12px" fontWeight="700" color="#374151" mb={1.5}>Industry</Text>
            <Input value={draft.industry} onChange={e => onChange("industry", e.target.value)}
              placeholder="e.g. SaaS, Healthcare, E-commerce"
              fontSize="14px" borderRadius="10px" h="40px" borderColor="#E5E7EB"
              _focus={{ borderColor: "#4F46E5", boxShadow: "0 0 0 1px #4F46E5" }} />
          </Box>
          {/* Description */}
          <Box>
            <Text fontSize="12px" fontWeight="700" color="#374151" mb={1.5}>Description</Text>
            <Textarea value={draft.description} onChange={e => onChange("description", e.target.value)}
              placeholder="Brief description of what the brand does..."
              fontSize="14px" borderRadius="10px" minH="90px" borderColor="#E5E7EB" resize="vertical"
              _focus={{ borderColor: "#4F46E5", boxShadow: "0 0 0 1px #4F46E5" }} />
          </Box>
          {/* Guardrails */}
          <Box>
            <Text fontSize="12px" fontWeight="700" color="#374151" mb={1}>Guardrails</Text>
            <Text fontSize="12px" color="#9CA3AF" mb={1.5}>
              Rules the AI must follow when generating content for this brand.
            </Text>
            <Textarea value={draft.guardrails} onChange={e => onChange("guardrails", e.target.value)}
              placeholder="e.g. Never use aggressive language. Always mention the free trial."
              fontSize="14px" borderRadius="10px" minH="130px" borderColor="#E5E7EB" resize="vertical"
              _focus={{ borderColor: "#4F46E5", boxShadow: "0 0 0 1px #4F46E5" }} />
          </Box>
        </VStack>
        {/* Footer */}
        <Flex gap={3} px={6} py={5} borderTop="1px solid" borderColor="#F3F4F6">
          <Button flex={1} h="44px" borderRadius="12px" bg="#4F46E5" color="white"
            fontSize="14px" fontWeight="700" _hover={{ bg: "#4338CA" }}
            loading={isSaving} onClick={onSave}>
            Save Changes
          </Button>
          <Button h="44px" px={5} borderRadius="12px" bg="#F3F4F6" color="#374151"
            fontSize="14px" fontWeight="600" _hover={{ bg: "#E5E7EB" }}
            disabled={isSaving} onClick={onClose}>
            Cancel
          </Button>
        </Flex>
      </Box>
    </>
  );
}

/**
 * DashboardShell Component
 * Provides the base dashboard layout with a unified left sidebar navigation.
 */
export default function DashboardShell({ brandId }: DashboardShellProps) {
  const { user, session, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const noticeTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});
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
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<
    | "brands"
    | "content"
    | "assets"
    | "calendar"
    | "integrations"
    | "settings"
    | "support"
  >("brands");

  // Sync ?tab= query param → activeView on mount and when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab");
    const valid = [
      "brands", "content", "assets", "calendar",
      "integrations", "settings", "support",
    ];
    if (tab && valid.includes(tab)) {
      setActiveView(tab as typeof activeView);
    }
  }, [searchParams]);

  // Navigate: update state AND push ?tab= into the URL so reload restores the tab
  const navigateTo = (view: typeof activeView) => {
    setActiveView(view);
    router.replace(`${pathname}?tab=${view}`, { scroll: false });
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [allBrands, setAllBrands] = useState<BrandData[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const campaign = useCampaignPolling(
    session?.access_token,
    selectedBrandId ?? undefined,
  );
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; website_url: string; industry: string; description: string; guardrails: string }>({ name: "", website_url: "", industry: "", description: "", guardrails: "" });
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [createdBrandId, setCreatedBrandId] = useState<string | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>(
    {},
  );

  // ── Batch-rating gate state (driven by AssetsTab via onRatingGateChange) ─────
  const [hasPendingBatch, setHasPendingBatch] = useState(false);

  // Load persisted ratings from DB when brand or user changes
  useEffect(() => {
    if (!selectedBrandId || !user?.id) return;
    (async () => {
      const { data } = await supabase
        .from("context_ratings")
        .select("context_index, rating")
        .eq("brand_id", selectedBrandId)
        .eq("user_id", user.id);
      if (data && data.length > 0) {
        const loaded: Record<string, number> = {};
        for (const row of data as { context_index: number; rating: number }[]) {
          loaded[getFeedbackKey(selectedBrandId, row.context_index)] = row.rating;
        }
        setRatings((prev) => ({ ...prev, ...loaded }));
      }
    })();
  }, [selectedBrandId, user?.id]);
  const [openFeedbackKey, setOpenFeedbackKey] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [cardNotices, setCardNotices] = useState<
    Record<string, CardNoticeState>
  >({});
  const [cardDiffs, setCardDiffs] = useState<Record<string, CardDiffState>>({});
  const [streamingBlocks, setStreamingBlocks] = useState<
    Record<string, ContextBlock>
  >({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleBatchGenerated = useCallback((_campaignIds: string[]) => {
    // gate is driven by AssetsTab via onRatingGateChange
  }, []);

  useEffect(() => {
    const timeoutRegistry = noticeTimeoutsRef.current;
    return () => {
      Object.values(timeoutRegistry).forEach((timeoutId) =>
        clearTimeout(timeoutId),
      );
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
        let query = supabase
          .from("brands")
          .select(
            "id, name, website_url, manifest, guardrails, description, industry, logo_url, created_at",
          )
          .order("created_at", { ascending: false });

        if (user?.id) {
          query = query.eq("user_id", user.id);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching brands:", error);
        } else {
          setAllBrands(data || []);
          if (data && data.length > 0) {
            setSelectedBrandId((current) => {
              // Validate current selection still exists
              if (current && data.some((b) => b.id === current)) return current;
              // Stale/deleted brand — clear localStorage and pick first
              if (typeof window !== "undefined") {
                window.localStorage.removeItem(ACTIVE_BRAND_STORAGE_KEY);
              }
              return createdBrandId || brandId || data[0].id;
            });
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

  const selectedBrand = allBrands.find((b) => b.id === selectedBrandId) || null;
  const selectedBrandSummary = selectedBrand
    ? getBrandSummary(selectedBrand)
    : null;
  const contextBlocks = useMemo(
    () => selectedBrandSummary?.contextBlocks ?? [],
    [selectedBrandSummary],
  );

  const handleSelectActiveBrand = (brandIdValue: string) => {
    setSelectedBrandId(brandIdValue);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_BRAND_STORAGE_KEY, brandIdValue);
    }
  };

  const handleOpenEditPanel = (brand: BrandData) => {
    setEditDraft({
      name:        brand.name,
      website_url: brand.website_url ?? "",
      industry:    brand.industry ?? "",
      description: brand.description ?? "",
      guardrails:  brand.guardrails ?? "",
    });
    setEditingBrandId(brand.id);
    setIsEditPanelOpen(true);
  };

  const handleSaveBrand = async () => {
    if (!editingBrandId) return;
    setIsSavingBrand(true);
    try {
      const { error } = await supabase
        .from("brands")
        .update({
          name:        editDraft.name.trim(),
          website_url: editDraft.website_url.trim() || null,
          industry:    editDraft.industry.trim() || null,
          description: editDraft.description.trim() || null,
          guardrails:  editDraft.guardrails.trim() || null,
        })
        .eq("id", editingBrandId);
      if (error) throw error;
      setAllBrands(prev => prev.map(b =>
        b.id === editingBrandId
          ? { ...b, ...editDraft, name: editDraft.name.trim(), website_url: editDraft.website_url.trim() || null, industry: editDraft.industry.trim() || null, description: editDraft.description.trim() || null, guardrails: editDraft.guardrails.trim() || null }
          : b
      ));
      setIsEditPanelOpen(false);
    } catch (err) {
      console.error("Failed to save brand:", err);
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!session?.access_token) return;
    if (!window.confirm("Delete this brand? This cannot be undone.")) return;
    setDeletingBrandId(brandId);
    try {
      await deleteBrand(brandId, session.access_token);
      const remaining = allBrands.filter((b) => b.id !== brandId);
      setAllBrands(remaining);
      if (selectedBrandId === brandId) {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(ACTIVE_BRAND_STORAGE_KEY);
        }
        setSelectedBrandId(remaining[0]?.id ?? null);
      }
    } catch (err) {
      console.error("Failed to delete brand:", err);
    } finally {
      setDeletingBrandId(null);
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

    // Persist rating to database
    if (user?.id) {
      supabase
        .from("context_ratings")
        .upsert(
          {
            brand_id: selectedBrand.id,
            user_id: user.id,
            context_index: block.context_index,
            rating,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "brand_id,user_id,context_index" },
        )
        .then(({ error }) => {
          if (error) console.error("[Rating] failed to save:", error);
        });
    }

    if (rating < 3) {
      setOpenFeedbackKey(key);
      return;
    }

    setOpenFeedbackKey((current) => (current === key ? null : current));
  };

  const handleRegenerateContext = async (block: ContextBlock) => {
    if (submittingKey) return;

    if (!selectedBrand || !session?.access_token) {
      setCardNotice(
        getFeedbackKey(selectedBrand?.id || "unknown", block.context_index),
        {
          type: "error",
          message: "You need an authenticated session to regenerate context.",
        },
      );
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
        session.access_token,
      )) {
        if (event.event === "context_chunk" && event.data.chunk) {
          streamedMarkdown += event.data.chunk;
          setStreamingBlocks((prev) => ({
            ...prev,
            [key]: parseStreamedContextBlock(streamedMarkdown, block),
          }));
        }

        if (event.event === "error") {
          throw {
            message: event.data.message || "Failed to regenerate this context.",
          };
        }

        if (event.event === "complete" && event.data.data) {
          const responseData = event.data.data;
          setAllBrands((prev) =>
            prev.map((brand) =>
              brand.id === selectedBrand.id
                ? { ...brand, manifest: responseData.context_md }
                : brand,
            ),
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

  /* ─── View title helper ─── */
  const viewTitle =
    activeView === "content"
      ? "Content Agent"
      : activeView === "calendar"
        ? "Content Calendar"
        : activeView === "integrations"
          ? "Integrations"
          : activeView === "settings"
            ? "Settings"
            : activeView === "support"
              ? "Support"
              : allBrands.length > 0
                ? `Your Brands (${allBrands.length})`
                : "Create Your First Brand";

  /* ─── Brand tabs (pill row) ─── */
  const renderBrandTabs = () => (
    <Flex gap={2} mb={6} overflowX="auto" pb={1} flexShrink={0}
      css={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>

      {allBrands.map(brand => {
        const isActive = brand.id === selectedBrandId;
        return (
          <Flex key={brand.id} align="center" gap={2.5}
            px={4} py={2.5} borderRadius="14px" cursor="pointer" flexShrink={0}
            bg={isActive ? "#4F46E5" : "white"}
            border="1.5px solid" borderColor={isActive ? "#4F46E5" : "#E5E7EB"}
            boxShadow={isActive ? "0 4px 14px rgba(79,70,229,0.22)" : "0 1px 4px rgba(0,0,0,0.05)"}
            transition="all 0.18s ease"
            _hover={{ borderColor: "#4F46E5", transform: "translateY(-1px)" }}
            onClick={() => handleSelectActiveBrand(brand.id)}>

            {/* Initials circle */}
            <Flex w="26px" h="26px" borderRadius="7px" flexShrink={0}
              bg={isActive ? "rgba(255,255,255,0.18)" : "#E6F5EC"}
              color={isActive ? "white" : "#2F855A"}
              align="center" justify="center" fontSize="10px" fontWeight="800">
              {getInitials(brand.name)}
            </Flex>

            <Text fontSize="13px" fontWeight="600"
              color={isActive ? "white" : "#374151"} whiteSpace="nowrap">
              {brand.name}
            </Text>

            {/* Active dot */}
            {isActive && (
              <Box w="5px" h="5px" borderRadius="full" bg="rgba(255,255,255,0.65)" />
            )}
          </Flex>
        );
      })}

      {/* + New Brand pill */}
      <Flex align="center" gap={2} px={4} py={2.5} borderRadius="14px"
        cursor="pointer" flexShrink={0} bg="transparent"
        border="1.5px dashed" borderColor="#D1D5DB" color="#9CA3AF"
        _hover={{ borderColor: "#4F46E5", color: "#4F46E5" }}
        transition="all 0.18s ease"
        onClick={() => setIsCreateOpen(true)}>
        <Plus size={13} />
        <Text fontSize="13px" fontWeight="600" whiteSpace="nowrap">New Brand</Text>
      </Flex>
    </Flex>
  );

  /* ─── Brand profile (full-width vertical layout) ─── */
  const renderBrandProfile = () => {
    if (!selectedBrand) return null;
    return (
      <Box>
        {/* Header card */}
        <Box bg="white" border="1px solid" borderColor="#ECECEC" borderRadius="24px"
          p={{ base: 5, md: 7 }} mb={5} boxShadow="0 4px 24px rgba(0,0,0,0.05)">
          <Flex align="flex-start" justify="space-between" gap={5}
            direction={{ base: "column", sm: "row" }}>

            {/* Logo + identity */}
            <Flex align="center" gap={5} flex={1} minW={0}
              onClick={e => e.stopPropagation()}>
              <BrandLogoUpload brand={selectedBrand} token={session?.access_token}
                onLogoUploaded={(bId, url) =>
                  setAllBrands(prev => prev.map(b => b.id === bId ? { ...b, logo_url: url } : b))
                } />
              <Box minW={0}>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800"
                  color="#111111" lineHeight="1.1" mb={1.5}>
                  {selectedBrand.name}
                </Text>
                <Flex align="center" gap={2.5} flexWrap="wrap">
                  {selectedBrand.website_url && (
                    <Text fontSize="14px" color="#6B7280">{selectedBrandSummary?.hostname}</Text>
                  )}
                  {selectedBrand.industry && selectedBrand.website_url && (
                    <Box w="3px" h="3px" borderRadius="full" bg="#D1D5DB" />
                  )}
                  {selectedBrand.industry && (
                    <Text fontSize="13px" color="#6B7280">{selectedBrand.industry}</Text>
                  )}
                  <Box w="3px" h="3px" borderRadius="full" bg="#D1D5DB" />
                  <Flex align="center" gap={1.5}>
                    <Box w="6px" h="6px" borderRadius="full" bg="#22C55E" />
                    <Text fontSize="12px" color="#22C55E" fontWeight="600">Active</Text>
                  </Flex>
                </Flex>
              </Box>
            </Flex>

            {/* Actions */}
            <Flex gap={2} flexShrink={0} align="center">
              <Button h="36px" px={4} borderRadius="10px" fontSize="13px" fontWeight="600"
                bg="#F3F4F6" color="#374151" _hover={{ bg: "#E5E7EB" }}
                onClick={() => handleOpenEditPanel(selectedBrand)}>
                <Pencil size={13} style={{ marginRight: 5 }} />
                Edit
              </Button>
              <IconButton aria-label="Delete brand" h="36px" w="36px" minW="36px"
                borderRadius="10px" bg="transparent" color="#9CA3AF"
                border="1px solid" borderColor="#E5E7EB"
                _hover={{ bg: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}
                loading={deletingBrandId === selectedBrand.id}
                onClick={() => handleDeleteBrand(selectedBrand.id)}>
                <Trash2 size={14} />
              </IconButton>
            </Flex>
          </Flex>
        </Box>

        {/* Description + Guardrails */}
        <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={5}>
          {/* Description */}
          <Box bg="white" border="1px solid" borderColor="#ECECEC" borderRadius="20px"
            p={5} boxShadow="0 2px 12px rgba(0,0,0,0.04)" minH="100px">
            <Text fontSize="11px" fontWeight="800" color="#9CA3AF" letterSpacing="0.08em" mb={3}>
              DESCRIPTION
            </Text>
            {selectedBrand.description ? (
              <Text fontSize="14px" color="#374151" lineHeight="1.7">
                {selectedBrand.description}
              </Text>
            ) : (
              <Text fontSize="13px" color="#D1D5DB" fontStyle="italic">
                No description yet — click Edit to add one.
              </Text>
            )}
          </Box>

          {/* Guardrails */}
          <Box bg="#FFFBEB" border="1px solid" borderColor="#FDE68A" borderRadius="20px"
            p={5} boxShadow="0 2px 12px rgba(0,0,0,0.04)" minH="100px">
            <Text fontSize="11px" fontWeight="800" color="#92400E" letterSpacing="0.08em" mb={3}>
              GUARDRAILS
            </Text>
            {selectedBrand.guardrails ? (
              <Text fontSize="14px" color="#78350F" lineHeight="1.7" whiteSpace="pre-wrap">
                {selectedBrand.guardrails}
              </Text>
            ) : (
              <Text fontSize="13px" color="#D97706" fontStyle="italic">
                No guardrails set — click Edit to define AI content rules.
              </Text>
            )}
          </Box>
        </Box>

        {/* Context cards */}
        {selectedBrand.manifest ? (
          <>
            <Flex align="center" gap={3} mb={5}>
              <Text fontSize="12px" fontWeight="800" color="#9CA3AF"
                letterSpacing="0.07em" textTransform="uppercase">Brand Context</Text>
              <Box flex={1} h="1px" bg="#ECECEC" />
            </Flex>
            <VStack align="stretch" gap={6}>
              {contextBlocks.map((block) => {
            const feedbackKey = getFeedbackKey(
              selectedBrand.id,
              block.context_index,
            );
            const renderedBlock = streamingBlocks[feedbackKey] || block;
            const selectedRating = ratings[feedbackKey] ?? 0;
            const isFeedbackOpen = openFeedbackKey === feedbackKey;
            const isSubmitting = submittingKey === feedbackKey;
            const cardNotice = cardNotices[feedbackKey];
            const cardDiff = cardDiffs[feedbackKey];
            const previousContent =
              cardDiff?.updatedSection.context_index === block.context_index
                ? cardDiff.previousSection.content
                : undefined;
            const highlightedParagraphs = getHighlightedParagraphs(
              renderedBlock.content,
              previousContent,
            );
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
                <Text
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="700"
                  color="#111111"
                  lineHeight="1.15"
                  mb={5}
                  bg={
                    hasTitleChanged
                      ? "rgba(254, 240, 138, 0.45)"
                      : "transparent"
                  }
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
                        {paragraph.length === 0
                          ? "\u00A0"
                          : paragraph.map((sentence, sentenceIndex) => (
                              <Box
                                as="span"
                                key={`${feedbackKey}-sentence-${paragraphIndex}-${sentenceIndex}`}
                                bg={
                                  sentence.isChanged
                                    ? "rgba(254, 240, 138, 0.55)"
                                    : "transparent"
                                }
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
                      <IconButton
                        key={`${block.context_index}-star-${index + 1}`}
                        onClick={() => handleRatingSelect(block, index + 1)}
                        variant="ghost"
                        size="md"
                        p={0}
                        w="auto"
                        h="auto"
                        color="inherit"
                        transition="transform 0.15s ease"
                        _hover={{ transform: "translateY(-1px)" }}
                        _disabled={{ opacity: 0.45, cursor: "not-allowed" }}
                        disabled={Boolean(submittingKey)}
                        aria-label={`Rate ${index + 1} star${index + 1 > 1 ? "s" : ""}`}
                      >
                        <Star
                          size={24}
                          color={
                            index + 1 <= selectedRating ? "#F59E0B" : "#D1D5DB"
                          }
                          fill={
                            index + 1 <= selectedRating
                              ? "#FDE68A"
                              : "transparent"
                          }
                          strokeWidth={1.8}
                        />
                      </IconButton>
                    ))}
                  </Flex>
                </Flex>

                {cardNotice && (
                  <Box
                    mt={5}
                    bg={cardNotice.type === "success" ? "green.50" : "red.50"}
                    border="1px solid"
                    borderColor={
                      cardNotice.type === "success" ? "green.200" : "red.200"
                    }
                    color={
                      cardNotice.type === "success" ? "green.700" : "red.600"
                    }
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
                    <Text
                      fontSize="14px"
                      fontWeight="700"
                      color="#111111"
                      mb={2}
                    >
                      Optional feedback for regeneration
                    </Text>
                    <Text fontSize="13px" color="#6B7280" mb={4}>
                      This will regenerate only this context section and update
                      the stored markdown.
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
                        {isSubmitting ? (
                          <Spinner size="sm" />
                        ) : (
                          "Regenerate Section"
                        )}
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
                        _hover={{
                          bg: "#F8F8F6",
                          color: "#111111",
                          borderColor: "#D1D5DB",
                        }}
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
          </>
        ) : (
          <Box border="1px dashed" borderColor="#E5E7EB" borderRadius="18px"
            p={5} bg="#F9FAFB" textAlign="center">
            <Text fontSize="sm" color="#6B7280">
              No brand context generated yet. Run discovery to generate context.
            </Text>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Flex minH="100vh" bg="#F8F8F6">
      {/* ─── Unified Left Sidebar ─── */}
      <Box
        as="nav"
        w={SIDEBAR_WIDTH}
        bg="white"
        borderRight="1px solid"
        borderColor="#ECECEC"
        display={{ base: "none", lg: "flex" }}
        flexDirection="column"
        flexShrink={0}
        position="fixed"
        top={0}
        left={0}
        h="100vh"
        zIndex={100}
      >
        {/* Logo */}

        <Link href="/">
          <Flex align="center" gap="3" px={5} py={6}>
            <Image
              src="/plug_andPlay_logo.jpeg"
              alt="Plug and Play Agent"
              width={32}
              height={32}
              style={{
                objectFit: "contain",
                display: "block",
                borderRadius: "8px",
              }}
            />
            <Text
              fontSize="15px"
              fontWeight="800"
              color="#1a1a2e"
              letterSpacing="-0.02em"
              lineHeight="1.2"
            >
              Plug and Play Agent
            </Text>
          </Flex>
        </Link>

        {/* Nav Items */}
        <VStack gap={1} align="stretch" px={3} flex={1}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const viewKey = item.label.toLowerCase() as typeof activeView;
            const isActive = activeView === viewKey;
            const hasAssetsBadge = viewKey === "assets" && campaign.isPolling;

            return (
              <Flex
                key={item.label}
                align="center"
                gap={3}
                px={4}
                py={2.5}
                borderRadius="12px"
                color={isActive ? "#4F46E5" : "#6B7280"}
                bg={isActive ? "#F0EEFF" : "transparent"}
                fontWeight={isActive ? "600" : "500"}
                cursor="pointer"
                _hover={{
                  bg: isActive ? "#F0EEFF" : "#F8F8F6",
                  color: isActive ? "#4F46E5" : "#111111",
                }}
                transition="all 0.15s ease"
                fontSize="14px"
                onClick={() => {
                  navigateTo(viewKey);
                  setIsMobileSidebarOpen(false);
                }}
              >
                <Icon size={18} />
                <Text>{item.label}</Text>
                {hasAssetsBadge && (
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg="#4F46E5"
                    ml="auto"
                    style={{ animation: "pulse 1.5s ease-in-out infinite" }}
                  />
                )}
              </Flex>
            );
          })}
        </VStack>

        {/* Sign Out at bottom */}
        <Box px={3} pb={5}>
          <Flex
            align="center"
            gap={3}
            px={4}
            py={2.5}
            borderRadius="12px"
            color="#6B7280"
            cursor="pointer"
            _hover={{ bg: "#FEF2F2", color: "#DC2626" }}
            transition="all 0.15s ease"
            fontSize="14px"
            fontWeight="500"
            onClick={handleSignOut}
            opacity={isSigningOut ? 0.5 : 1}
          >
            <LogOut size={18} />
            <Text>{isSigningOut ? "Signing out..." : "Sign Out"}</Text>
          </Flex>
        </Box>
      </Box>

      {/* ─── Mobile Top Bar ─── */}
      <Box
        display={{ base: "block", lg: "none" }}
        position="fixed"
        top={0}
        left={0}
        right={0}
        bg="white"
        borderBottom="1px solid"
        borderColor="#ECECEC"
        zIndex={100}
        px={4}
        py={3}
      >
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={2.5}>
            <Image
              src="/plug_andPlay_logo.jpeg"
              alt="Plug and Play Agent"
              width={32}
              height={32}
              style={{ objectFit: "contain" }}
            />
            <Text
              fontSize="lg"
              fontWeight="800"
              color="#1a1a2e"
              letterSpacing="-0.02em"
            >
              Plug and Play Agent
            </Text>
          </Flex>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            color="#6B7280"
            fontSize="14px"
          >
            {isMobileSidebarOpen ? "Close" : "Menu"}
          </Button>
        </Flex>

        {/* Mobile Nav Dropdown */}
        {isMobileSidebarOpen && (
          <VStack gap={1} align="stretch" mt={3} pb={2}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const viewKey = item.label.toLowerCase() as typeof activeView;
              const isActive = activeView === viewKey;

              return (
                <Flex
                  key={item.label}
                  align="center"
                  gap={3}
                  px={4}
                  py={2.5}
                  borderRadius="12px"
                  color={isActive ? "#4F46E5" : "#6B7280"}
                  bg={isActive ? "#F0EEFF" : "transparent"}
                  fontWeight={isActive ? "600" : "500"}
                  cursor="pointer"
                  _hover={{ bg: "#F8F8F6" }}
                  fontSize="14px"
                  onClick={() => {
                    navigateTo(viewKey);
                    setIsMobileSidebarOpen(false);
                  }}
                >
                  <Icon size={18} />
                  <Text>{item.label}</Text>
                </Flex>
              );
            })}
            <Flex
              align="center"
              gap={3}
              px={4}
              py={2.5}
              borderRadius="12px"
              color="#6B7280"
              cursor="pointer"
              _hover={{ bg: "#FEF2F2", color: "#DC2626" }}
              fontSize="14px"
              fontWeight="500"
              onClick={handleSignOut}
            >
              <LogOut size={18} />
              <Text>{isSigningOut ? "Signing out..." : "Sign Out"}</Text>
            </Flex>
          </VStack>
        )}
      </Box>

      {/* ─── Main Content Area ─── */}
      <Flex
        flex={1}
        direction="column"
        ml={{ base: 0, lg: SIDEBAR_WIDTH }}
        mt={{ base: "60px", lg: 0 }}
        overflow="hidden"
        minH="100vh"
      >
        {/* Header */}
        <Flex
          minH={{ base: "auto", md: "80px" }}
          px={{ base: 4, md: 8, xl: 12 }}
          py={{ base: 4, md: 0 }}
          align={{ base: "stretch", md: "center" }}
          justify="space-between"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 0 }}
          borderBottom="1px solid"
          borderColor="#ECECEC"
        >
          <Text fontSize="xl" fontWeight="700" color="#111111">
            {viewTitle}
          </Text>
          <Flex align="center" gap={3} w={{ base: "full", md: "auto" }}>
            {activeView === "brands" && (
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
                w={{ base: "full", sm: "auto" }}
              >
                <Flex align="center" gap={2}>
                  <Plus size={18} />
                  Create Brand
                </Flex>
              </Button>
            )}

            {/* Profile avatar */}
            <Flex
              align="center"
              justify="center"
              w="40px"
              h="40px"
              borderRadius="full"
              bg="#EEF2FF"
              border="1.5px solid"
              borderColor="#C7D2FE"
              color="#4F46E5"
              cursor="default"
              flexShrink={0}
              title={user?.email ?? "Profile"}
            >
              {user?.email ? (
                <Text fontSize="15px" fontWeight="700" lineHeight="1">
                  {user.email[0].toUpperCase()}
                </Text>
              ) : (
                <UserCircle size={20} />
              )}
            </Flex>
          </Flex>
        </Flex>

        {/* Content */}
        <Box
          flex={1}
          px={{ base: 4, md: 8, xl: 12 }}
          py={{ base: 6, md: 8 }}
          overflowY="auto"
          maxH={{ base: "none", lg: "calc(100vh - 80px)" }}
        >
          {activeView === "brands" ? (
            <Box>
              {/* Slide-over edit panel */}
              {isEditPanelOpen && (
                <EditBrandPanel
                  draft={editDraft}
                  onChange={(field, value) => setEditDraft(d => ({ ...d, [field]: value }))}
                  onSave={handleSaveBrand}
                  onClose={() => setIsEditPanelOpen(false)}
                  isSaving={isSavingBrand}
                />
              )}

              {isLoadingBrands ? (
                <Flex align="center" justify="center" h="200px">
                  <Spinner size="lg" color="#4F46E5" />
                </Flex>
              ) : allBrands.length === 0 ? (
                <Box bg="white" border="1px solid" borderColor="#ECECEC"
                  borderRadius="20px" p={6} textAlign="center">
                  <Flex w="48px" h="48px" borderRadius="12px"
                    bg="rgba(79, 70, 229, 0.08)" color="#4F46E5"
                    align="center" justify="center" mx="auto" mb={3}>
                    <Building2 size={24} />
                  </Flex>
                  <Text fontSize="md" fontWeight="600" color="#111111" mb={2}>
                    No brands yet
                  </Text>
                  <Text fontSize="sm" color="#6B7280" mb={4}>
                    Create your first brand to get started
                  </Text>
                  <Button bg="#4F46E5" color="white" h="38px" fontSize="13px"
                    fontWeight="600" borderRadius="10px"
                    onClick={() => setIsCreateOpen(true)}>
                    Create Brand
                  </Button>
                </Box>
              ) : (
                <>
                  {renderBrandTabs()}
                  {selectedBrand ? renderBrandProfile() : null}
                </>
              )}
            </Box>
          ) : activeView === "content" ? (
            <ContentTab
              brand={
                selectedBrand
                  ? {
                      id: selectedBrand.id,
                      name: selectedBrand.name,
                      industry: selectedBrand.industry,
                    }
                  : null
              }
              contextBlocks={contextBlocks}
              token={session?.access_token}
              campaign={campaign}
              onNavigateToAssets={() => navigateTo("assets")}
              hasRatedContext={
                contextBlocks.length > 0 &&
                contextBlocks.every(
                  (b) => (ratings[getFeedbackKey(selectedBrand!.id, b.context_index)] ?? 0) > 0,
                )
              }
              onNavigateToBrands={() => navigateTo("brands")}
              hasPendingBatch={hasPendingBatch}
              onBatchGenerated={handleBatchGenerated}
            />
          ) : activeView === "assets" ? (
            <AssetsTab
              trackers={campaign.trackers}
              statuses={campaign.statuses}
              assets={campaign.assets}
              progress={campaign.progress}
              isPolling={campaign.isPolling}
              onRatingGateChange={setHasPendingBatch}
            />
          ) : activeView === "calendar" ? (
            <CalendarTab />
          ) : activeView === "integrations" ? (
            <IntegrationsTab />
          ) : activeView === "settings" ? (
            <SettingsTab />
          ) : activeView === "support" ? (
            <SupportTab />
          ) : null}
        </Box>
      </Flex>

      {/* ─── Create Brand Panel - Modal Overlay ─── */}
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
  );
}
