"use client";
/* eslint-disable react/no-unstable-nested-components */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Badge, Box, Button, Flex, Image, Text, VStack, Textarea,
} from "@chakra-ui/react";
import {
  Coffee, Download, ImageIcon, Loader, X, Star, Sparkles,
} from "lucide-react";
import type { CampaignTracker } from "@/hooks/useCampaignPolling";
import type { CampaignAsset } from "@/types/onboarding.types";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssetsTabProps {
  trackers: CampaignTracker[];
  statuses: Record<string, { total: number; complete: number; status: string }>;
  assets: Record<string, CampaignAsset[]>;
  progress: number;
  isPolling: boolean;
  onRatingGateChange?: (hasPending: boolean, totalAssets: number, ratedAssets: number) => void;
  onNavigateToContent?: () => void;
  brandId?: string;
  currentGuardrails?: string | null;
  onGuardrailUpdated?: (newGuardrails: string) => void;
}

type MediaType    = "IMAGE" | "VIDEO" | "REELS" | "CAROUSEL" | "STORIES";
type PostMode     = "now" | "schedule";
type ImageFormat  = "stories" | "feed" | "feed_4_5";

const FORMAT_LABELS: Record<ImageFormat, string> = {
  stories:  "Stories (9:16)",
  feed:     "Feed Square (1:1)",
  feed_4_5: "Feed 4:5",
};

const FORMAT_RATIO: Record<ImageFormat, string> = {
  stories:  "9/16",
  feed:     "1/1",
  feed_4_5: "4/5",
};

const FORMAT_IG_TYPE: Record<ImageFormat, MediaType> = {
  stories:  "STORIES",
  feed:     "IMAGE",
  feed_4_5: "IMAGE",
};

interface LibraryFile {
  id: string;
  name: string;
  url: string;
  format: ImageFormat;
  label?: string | null;
  created_at?: string | null;
}

interface PublishTarget {
  url: string;
  label: string;
  defaultMediaType?: MediaType;
}

// ─── Instagram Publish Modal ──────────────────────────────────────────────────

type CaptionTone = "engaging" | "professional" | "playful" | "minimal" | "bold";

const TONE_OPTIONS: { value: CaptionTone; label: string }[] = [
  { value: "engaging",      label: "Engaging" },
  { value: "professional",  label: "Professional" },
  { value: "playful",       label: "Playful" },
  { value: "minimal",       label: "Minimal" },
  { value: "bold",          label: "Bold" },
];

function PublishModal({
  target,
  onClose,
}: {
  target: PublishTarget;
  onClose: () => void;
}) {
  const [mode,          setMode]          = useState<PostMode>("now");
  const [mediaType,     setMediaType]     = useState<MediaType>(target.defaultMediaType ?? "IMAGE");
  const [caption,       setCaption]       = useState("");
  const [scheduledAt,   setScheduledAt]   = useState("");
  const [isPosting,     setIsPosting]     = useState(false);
  const [isGenerating,  setIsGenerating]  = useState(false);
  const [captionTone,   setCaptionTone]   = useState<CaptionTone>("engaging");

  const handleGenerateCaption = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/integrations/instagram/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          image_url: target.url,
          tone: captionTone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Caption generation failed");

      const captionText = data.caption || "";
      const hashtags = Array.isArray(data.hashtags)
        ? data.hashtags.map((t: string) => (t.startsWith("#") ? t : `#${t}`)).join(" ")
        : "";
      setCaption(
        hashtags ? `${captionText}\n\n${hashtags}` : captionText
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Caption generation failed";
      alert(`Caption generation failed: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    setIsPosting(true);
    try {
      const body: Record<string, unknown> = {
        media_type: mediaType,
        media_url:  target.url,
        caption:    caption || undefined,
      };
      if (mode === "schedule") {
        if (!scheduledAt) {
          alert("Please pick a date/time.");
          setIsPosting(false);
          return;
        }
        body.scheduled_at = new Date(scheduledAt).toISOString();
      }

      const endpoint = mode === "now"
        ? "/api/integrations/instagram/publish"
        : "/api/integrations/instagram/schedule";

      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      onClose();
      alert(mode === "now"
        ? `Published! ${data.post_url}`
        : `Scheduled for ${new Date(scheduledAt).toLocaleString()}`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Publish failed";
      alert(message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    // Backdrop
    <Box
      position="fixed" inset={0} zIndex={1000}
      bg="rgba(0,0,0,0.55)" backdropFilter="blur(4px)"
      display="flex" alignItems="center" justifyContent="center"
      onClick={onClose}
    >
      {/* Modal */}
      <Box
        bg="white" borderRadius="24px" p={6} w="full" maxW="440px" mx={4}
        boxShadow="0 32px 80px rgba(0,0,0,0.2)"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <Flex justify="space-between" align="center" mb={5}>
          <Flex align="center" gap={2}>
            <Box w="28px" h="28px" borderRadius="8px" flexShrink={0}
              style={{ background: "linear-gradient(135deg, #f09433 0%, #dc2743 50%, #bc1888 100%)" }}
              display="flex" alignItems="center" justifyContent="center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="17.5" cy="6.5" r="1" fill="white" />
              </svg>
            </Box>
            <Text fontSize="16px" fontWeight="700" color="#111111">Post to Instagram</Text>
          </Flex>
          <Button variant="ghost" size="xs" onClick={onClose} p={1} borderRadius="8px"
            _hover={{ bg: "#F3F4F6" }}>
            <X size={16} color="#6B7280" />
          </Button>
        </Flex>

        {/* Preview */}
        <Box mb={4} borderRadius="12px" overflow="hidden" border="1px solid" borderColor="#E5E7EB"
          style={{ aspectRatio: "4/5", maxHeight: "180px" }}>
          <Image src={target.url} alt={target.label} objectFit="cover" w="full" h="full" />
        </Box>

        {/* Mode toggle */}
        <Flex gap={2} mb={4} bg="#F9FAFB" p={1} borderRadius="10px">
          {(["now", "schedule"] as PostMode[]).map(m => (
            <Button key={m} flex={1} size="sm" borderRadius="8px" h="32px" fontSize="12px" fontWeight="600"
              bg={mode === m ? "white" : "transparent"}
              color={mode === m ? "#111111" : "#6B7280"}
              boxShadow={mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none"}
              _hover={{ bg: mode === m ? "white" : "#F3F4F6" }}
              onClick={() => setMode(m)}>
              {m === "now" ? "Now" : "Schedule"}
            </Button>
          ))}
        </Flex>

        {/* Media type */}
        <Box mb={4}>
          <Text fontSize="12px" fontWeight="600" color="#374151" mb={1.5}>Media Type</Text>
          <Flex gap={1.5} wrap="wrap">
            {(["IMAGE", "VIDEO", "REELS", "CAROUSEL", "STORIES"] as MediaType[]).map(type => (
              <Button key={type} size="xs" borderRadius="999px" h="26px" px={2.5} fontSize="11px" fontWeight="600"
                bg={mediaType === type ? "#111111" : "#F3F4F6"}
                color={mediaType === type ? "white" : "#374151"}
                border="1px solid" borderColor={mediaType === type ? "#111111" : "#E5E7EB"}
                _hover={{ bg: mediaType === type ? "#111111" : "#E5E7EB" }}
                onClick={() => setMediaType(type)}>
                {type}
              </Button>
            ))}
          </Flex>
        </Box>

        {/* Caption */}
        {mediaType !== "STORIES" && (
          <Box mb={4}>
            <Flex justify="space-between" align="center" mb={1.5}>
              <Flex align="center" gap={2}>
                <Text fontSize="12px" fontWeight="600" color="#374151">Caption</Text>
                <Button
                  size="xs" h="24px" px={2} borderRadius="8px"
                  fontSize="11px" fontWeight="600"
                  bg={isGenerating ? "transparent" : "linear-gradient(135deg, #6366F1, #8B5CF6)"}
                  color={isGenerating ? "#6366F1" : "white"}
                  border={isGenerating ? "1px solid" : "none"}
                  borderColor="#6366F1"
                  _hover={{ opacity: 0.85 }}
                  disabled={isGenerating}
                  onClick={handleGenerateCaption}
                  style={isGenerating ? {
                    background: "linear-gradient(90deg, #EEF2FF 25%, #E0E7FF 50%, #EEF2FF 75%)",
                    backgroundSize: "400% 400%",
                    animation: "shimmer 1.8s ease-in-out infinite",
                  } : {}}
                  gap={1}
                >
                  {isGenerating ? (
                    <Loader size={10} style={{ animation: "spin 1.5s linear infinite" }} />
                  ) : (
                    <Sparkles size={10} />
                  )}
                  {isGenerating ? "Generating..." : "AI Caption"}
                </Button>
              </Flex>
              <Text fontSize="11px" color="#9CA3AF">{caption.length}/2200</Text>
            </Flex>

            {/* Tone selector pills */}
            <Flex gap={1} mb={2} wrap="wrap">
              {TONE_OPTIONS.map(tone => (
                <Button key={tone.value} size="xs" borderRadius="999px" h="22px" px={2}
                  fontSize="10px" fontWeight="600"
                  bg={captionTone === tone.value ? "#EEF2FF" : "#F9FAFB"}
                  color={captionTone === tone.value ? "#4338CA" : "#9CA3AF"}
                  border="1px solid"
                  borderColor={captionTone === tone.value ? "#C7D2FE" : "#F3F4F6"}
                  _hover={{ bg: captionTone === tone.value ? "#EEF2FF" : "#F3F4F6" }}
                  onClick={() => setCaptionTone(tone.value)}>
                  {tone.label}
                </Button>
              ))}
            </Flex>

            <Textarea
              value={caption}
              onChange={e => setCaption(e.target.value.slice(0, 2200))}
              placeholder="Write your caption, add hashtags... or use AI Caption above"
              rows={3} fontSize="13px" borderRadius="10px"
              border="1px solid" borderColor="#E5E7EB"
              _focus={{ borderColor: "#6366F1", boxShadow: "0 0 0 3px rgba(99,102,241,0.1)" }}
            />
          </Box>
        )}

        {/* Schedule datetime */}
        {mode === "schedule" && (
          <Box mb={4}>
            <Text fontSize="12px" fontWeight="600" color="#374151" mb={1}>Schedule Date & Time</Text>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              style={{
                width: "100%", padding: "8px 12px", fontSize: "13px",
                border: "1px solid #E5E7EB", borderRadius: "10px",
                outline: "none", fontFamily: "inherit", color: "#111111", background: "white",
              }}
            />
          </Box>
        )}

        {/* Submit */}
        <Button w="full" h="44px" borderRadius="12px" fontSize="14px" fontWeight="700"
          color="white" loading={isPosting}
          style={{ background: mode === "now"
            ? "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
            : "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
          }}
          _hover={{ opacity: 0.9 }}
          onClick={handlePublish}>
          {mode === "now" ? "Publish Now" : "Schedule Post"}
        </Button>
      </Box>
    </Box>
  );
}


// ─── Instagram Publish Button (overlay) ──────────────────────────────────────

function IgPublishButton({ url, label, onPublish }: { url: string; label: string; onPublish: (t: PublishTarget) => void }) {
  return (
    <Button
      size="xs" borderRadius="8px" h="28px" px={2}
      bg="rgba(0,0,0,0.45)" color="white"
      backdropFilter="blur(4px)"
      _hover={{ bg: "rgba(220,39,67,0.85)" }}
      onClick={e => { e.stopPropagation(); onPublish({ url, label }); }}
      gap={1}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="17.5" cy="6.5" r="1" fill="white" />
      </svg>
      <Text fontSize="10px" fontWeight="700">Post</Text>
    </Button>
  );
}


// ─── Guardrail Prompt Modal ────────────────────────────────────────────────────

function GuardrailPromptModal({
  feedback,
  onConfirm,
  onDismiss,
  isSaving,
}: {
  feedback: string;
  onConfirm: () => void;
  onDismiss: () => void;
  isSaving: boolean;
}) {
  return (
    <Box
      position="fixed" inset={0} zIndex={2000}
      bg="rgba(0,0,0,0.45)" backdropFilter="blur(4px)"
      display="flex" alignItems="center" justifyContent="center"
      onClick={onDismiss}
    >
      <Box
        bg="white" borderRadius="20px" p={6} w="full" maxW="420px" mx={4}
        boxShadow="0 24px 64px rgba(0,0,0,0.18)"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <Flex justify="space-between" align="flex-start" mb={4}>
          <Flex align="center" gap={2.5}>
            <Box w="36px" h="36px" borderRadius="10px" flexShrink={0}
              bg="#FFFBEB" border="1.5px solid #FDE68A"
              display="flex" alignItems="center" justifyContent="center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v6c0 5.25 3.75 10.14 9 11.32C17.25 23.14 21 18.25 21 13V7L12 2z"
                  stroke="#D97706" strokeWidth="2" fill="none" strokeLinejoin="round" />
              </svg>
            </Box>
            <Box>
              <Text fontSize="15px" fontWeight="700" color="#111111">Add to Guardrails?</Text>
              <Text fontSize="12px" color="#6B7280" mt={0.5}>Use this feedback as a content rule</Text>
            </Box>
          </Flex>
          <Button variant="ghost" size="xs" onClick={onDismiss} p={1} borderRadius="8px"
            _hover={{ bg: "#F3F4F6" }}>
            <X size={15} color="#9CA3AF" />
          </Button>
        </Flex>

        {/* Feedback preview */}
        <Box bg="#FFFBEB" border="1px solid" borderColor="#FDE68A" borderRadius="12px" p={3.5} mb={5}>
          <Text fontSize="12px" fontWeight="600" color="#92400E" mb={1.5} letterSpacing="0.04em" textTransform="uppercase">
            Feedback
          </Text>
          <Text fontSize="13px" color="#78350F" lineHeight="1.6" fontStyle="italic">
            &ldquo;{feedback}&rdquo;
          </Text>
        </Box>

        <Text fontSize="13px" color="#6B7280" mb={4} lineHeight="1.6">
          This will be appended to your brand&apos;s guardrails so future AI-generated content follows this rule.
        </Text>

        {/* Actions */}
        <Flex gap={2.5}>
          <Button flex={1} h="40px" borderRadius="10px" fontSize="13px" fontWeight="600"
            bg="#F3F4F6" color="#374151" _hover={{ bg: "#E5E7EB" }}
            onClick={onDismiss} disabled={isSaving}>
            Dismiss
          </Button>
          <Button flex={1} h="40px" borderRadius="10px" fontSize="13px" fontWeight="700"
            color="white" loading={isSaving}
            style={{ background: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)" }}
            _hover={{ opacity: 0.9 }}
            onClick={onConfirm}>
            Add to Guardrails
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}


// ─── Feedback Panel ──────────────────────────────────────────────────────────

function FeedbackPanel({ imageId, onRated, initialRating = 0, initialFeedback = "", onAddToGuardrails }: {
  imageId: string;
  onRated?: (imageId: string) => void;
  initialRating?: number;
  initialFeedback?: string;
  onAddToGuardrails?: (feedback: string) => void;
}) {
  const [rating, setRating]               = useState(initialRating);
  const [hoverRating, setHoverRating]     = useState(0);
  const [feedback, setFeedback]           = useState(initialFeedback);
  const [saving, setSaving]               = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(initialFeedback);

  // Sync when parent's async loadLibrary delivers rating data
  useEffect(() => {
    setRating(initialRating);
    setFeedback(initialFeedback);
    setSavedFeedback(initialFeedback);
  }, [initialRating, initialFeedback]);

  const saveToDb = async (star: number, text: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("image_feedback").upsert(
      { image_id: imageId, user_id: user.id, rating: star, feedback: text || null, updated_at: new Date().toISOString() },
      { onConflict: "image_id,user_id" }
    );
  };

  const handleStarClick = async (star: number) => {
    setRating(star);
    setSaving(true);
    try {
      await saveToDb(star, feedback);
      setSavedFeedback(feedback);
      onRated?.(imageId);
    } catch (err) {
      console.error("Feedback save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFeedbackBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#E5E7EB";
    if (rating === 0 || feedback === savedFeedback || saving) return;
    setSaving(true);
    try {
      await saveToDb(rating, feedback);
      setSavedFeedback(feedback);
      if (feedback.trim()) {
        onAddToGuardrails?.(feedback.trim());
      }
    } catch (err) {
      console.error("Feedback save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const isSaved = rating > 0 && feedback === savedFeedback && !saving;

  return (
    <Box mt={2} pt={2} borderTop="1px solid" borderColor="#F3F4F6">
      {/* Star Rating — auto-saves on click */}
      <Flex align="center" gap={1} mb={1.5}>
        {[1, 2, 3, 4, 5].map(star => (
          <Box
            key={star}
            cursor={saving ? "wait" : "pointer"}
            onMouseEnter={() => !saving && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => !saving && handleStarClick(star)}
            transition="transform 0.15s"
            _hover={{ transform: saving ? "none" : "scale(1.2)" }}
          >
            <Star
              size={16}
              color={(hoverRating || rating) >= star ? "#F59E0B" : "#D1D5DB"}
              fill={(hoverRating || rating) >= star ? "#F59E0B" : "none"}
              strokeWidth={2}
            />
          </Box>
        ))}
        {saving && <Loader size={10} color="#9CA3AF" style={{ animation: "spin 1.5s linear infinite", marginLeft: 4 }} />}
        {!saving && isSaved && (
          <Text fontSize="11px" color="#22C55E" ml={1} fontWeight="600">✓</Text>
        )}
        {!saving && rating > 0 && (
          <Text fontSize="11px" color="#9CA3AF" ml={isSaved ? 0 : 1}>{rating}/5</Text>
        )}
      </Flex>

      {/* Feedback input — saves on blur when already rated */}
      <input
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Leave feedback..."
        style={{
          width: "100%", fontSize: "12px", padding: "6px 10px",
          border: "1px solid #E5E7EB", borderRadius: "8px",
          outline: "none", color: "#374151", background: "#F9FAFB",
        }}
        onFocus={e => { e.currentTarget.style.borderColor = "#6366F1"; }}
        onBlur={handleFeedbackBlur}
      />
    </Box>
  );
}

// ─── Library Image Card ───────────────────────────────────────────────────────

function LibraryCard({ file, igConnected, onPublish, onRated, isRated, ratingData, onAddToGuardrails }: {
  file: LibraryFile;
  igConnected: boolean;
  onPublish: (t: PublishTarget) => void;
  onRated?: (fileId: string) => void;
  isRated?: boolean;
  ratingData?: { rating: number; feedback: string };
  onAddToGuardrails?: (feedback: string) => void;
}) {
  const igType = FORMAT_IG_TYPE[file.format];

  return (
    <Box borderRadius="18px" overflow="hidden" bg="white"
      border="1.5px solid" borderColor={isRated ? "#D1FAE5" : "#FDE68A"}
      transition="all 0.3s ease"
      _hover={{ boxShadow: "0 16px 48px rgba(0,0,0,0.1)", transform: "translateY(-3px)" }}>
      <Box position="relative" overflow="hidden" style={{ aspectRatio: FORMAT_RATIO[file.format] }}>
        <Image src={file.url} alt={file.label || file.name} objectFit="cover" w="full" h="full" />

        <Flex position="absolute" top={3} left={3} right={3}
          justify="space-between" align="center" zIndex={10}>
          <Badge bg="rgba(0,0,0,0.45)" color="white" backdropFilter="blur(4px)"
            borderRadius="8px" px={2.5} py={1} fontSize="10px" fontWeight="600">
            {FORMAT_LABELS[file.format]}
          </Badge>
          <Flex gap={1.5}>
            {igConnected && (
              <IgPublishButton
                url={file.url}
                label={file.label || file.name}
                onPublish={t => onPublish({ ...t, defaultMediaType: igType })}
              />
            )}
            <Button size="xs" bg="rgba(255,255,255,0.15)" color="white" borderRadius="8px"
              backdropFilter="blur(4px)" _hover={{ bg: "rgba(255,255,255,0.3)" }}
              h="28px" w="28px" p={0} minW="28px"
              onClick={async e => {
                e.stopPropagation();
                try {
                  const res = await fetch(file.url);
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = file.name;
                  document.body.appendChild(a); a.click();
                  document.body.removeChild(a); URL.revokeObjectURL(url);
                } catch { window.open(file.url, "_blank"); }
              }}>
              <Download size={13} />
            </Button>
          </Flex>
        </Flex>
      </Box>

      <Box p={3.5}>
        <Box mb={2}>
          <Text fontSize="13px" fontWeight="600" color="#111111"
            overflow="hidden" whiteSpace="nowrap" style={{ textOverflow: "ellipsis" }}>
            {file.label || file.name}
          </Text>
          <Text fontSize="11px" color="#9CA3AF" mt={0.5}>{FORMAT_LABELS[file.format]}</Text>
        </Box>
        <FeedbackPanel imageId={file.id} onRated={onRated} initialRating={ratingData?.rating ?? 0} initialFeedback={ratingData?.feedback ?? ""} onAddToGuardrails={onAddToGuardrails} />
      </Box>
    </Box>
  );
}

// ─── Carousel Bundle Card ─────────────────────────────────────────────────────

function CarouselBundleCard({ slides, igConnected, onPublish, onRated, ratedFileIds, ratingDataMap, onAddToGuardrails }: {
  slides: LibraryFile[];
  igConnected: boolean;
  onPublish: (t: PublishTarget) => void;
  onRated?: (fileId: string) => void;
  ratedFileIds: Set<string>;
  ratingDataMap: Map<string, { rating: number; feedback: string }>;
  onAddToGuardrails?: (feedback: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slideNumRe = new RegExp('-s(\\d+)[_.]');
  const sorted = [...slides].sort((a, b) => {
    const aNum = parseInt(a.name.match(slideNumRe)?.[1] ?? "1");
    const bNum = parseInt(b.name.match(slideNumRe)?.[1] ?? "1");
    return aNum - bNum;
  });

  const current = sorted[currentIndex] ?? sorted[0];
  if (!current) return null;

  const allRated = sorted.every(s => ratedFileIds.has(s.id));

  const prev = () => setCurrentIndex(i => (i - 1 + sorted.length) % sorted.length);
  const next = () => setCurrentIndex(i => (i + 1) % sorted.length);

  return (
    <Box borderRadius="18px" overflow="hidden" bg="white"
      border="1.5px solid" borderColor={allRated ? "#D1FAE5" : "#FDE68A"}
      transition="all 0.3s ease"
      _hover={{ boxShadow: "0 16px 48px rgba(0,0,0,0.1)", transform: "translateY(-3px)" }}>

      {/* Slide viewer */}
      <Box position="relative" overflow="hidden" style={{ aspectRatio: "1/1" }}>
        <Image src={current.url} alt={current.label || current.name} objectFit="cover" w="full" h="full" />

        {/* Top row: badge + actions */}
        <Flex position="absolute" top={3} left={3} right={3} justify="space-between" align="center" zIndex={10}>
          <Badge bg="rgba(0,0,0,0.50)" color="white" backdropFilter="blur(4px)"
            borderRadius="8px" px={2.5} py={1} fontSize="10px" fontWeight="700">
            Carousel {currentIndex + 1}/{sorted.length}
          </Badge>
          <Flex gap={1.5}>
            {igConnected && (
              <IgPublishButton url={current.url} label={current.label || current.name}
                onPublish={t => onPublish({ ...t, defaultMediaType: "CAROUSEL" })} />
            )}
            <Button size="xs" bg="rgba(255,255,255,0.15)" color="white" borderRadius="8px"
              backdropFilter="blur(4px)" _hover={{ bg: "rgba(255,255,255,0.3)" }}
              h="28px" w="28px" p={0} minW="28px"
              onClick={async e => {
                e.stopPropagation();
                try {
                  const res = await fetch(current.url);
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url; a.download = current.name;
                  document.body.appendChild(a); a.click();
                  document.body.removeChild(a); URL.revokeObjectURL(url);
                } catch { window.open(current.url, "_blank"); }
              }}>
              <Download size={13} />
            </Button>
          </Flex>
        </Flex>

        {/* Prev / Next */}
        {sorted.length > 1 && (
          <>
            <Button position="absolute" left={2} top="50%" transform="translateY(-50%)"
              h="28px" w="28px" p={0} minW="28px" borderRadius="full" zIndex={10}
              bg="rgba(255,255,255,0.88)" color="#111" fontSize="18px" lineHeight={1}
              _hover={{ bg: "white" }} onClick={prev}>
              ‹
            </Button>
            <Button position="absolute" right={2} top="50%" transform="translateY(-50%)"
              h="28px" w="28px" p={0} minW="28px" borderRadius="full" zIndex={10}
              bg="rgba(255,255,255,0.88)" color="#111" fontSize="18px" lineHeight={1}
              _hover={{ bg: "white" }} onClick={next}>
              ›
            </Button>
          </>
        )}

        {/* Dot indicators */}
        <Flex position="absolute" bottom={3} left={0} right={0} justify="center" gap={1} zIndex={10}>
          {sorted.map((_, i) => (
            <Box key={i} w="6px" h="6px" borderRadius="full" cursor="pointer"
              bg={i === currentIndex ? "white" : "rgba(255,255,255,0.45)"}
              transition="background 0.2s"
              onClick={() => setCurrentIndex(i)} />
          ))}
        </Flex>
      </Box>

      {/* Info + thumbnail strip + rating */}
      <Box p={3.5}>
        <Box mb={2}>
          <Text fontSize="13px" fontWeight="600" color="#111111">
            Carousel — {sorted.length} slides
          </Text>
          <Text fontSize="11px" color="#9CA3AF" mt={0.5}>Feed Square (1:1)</Text>
        </Box>

        {/* Thumbnail strip */}
        <Flex gap={1.5} mb={2.5} overflowX="auto" pb={0.5}
          css={{ "&::-webkit-scrollbar": { display: "none" } }}>
          {sorted.map((slide, i) => (
            <Box key={slide.id} flexShrink={0} w="36px" h="36px" borderRadius="6px" overflow="hidden"
              border="2px solid" borderColor={i === currentIndex ? "#4F46E5" : "#E5E7EB"}
              cursor="pointer" onClick={() => setCurrentIndex(i)}
              transition="border-color 0.15s">
              <Image src={slide.url} alt={`Slide ${i + 1}`} objectFit="cover" w="full" h="full" />
            </Box>
          ))}
        </Flex>

        <FeedbackPanel
          imageId={current.id}
          onRated={onRated}
          initialRating={ratingDataMap.get(current.id)?.rating ?? 0}
          initialFeedback={ratingDataMap.get(current.id)?.feedback ?? ""}
          onAddToGuardrails={onAddToGuardrails}
        />
      </Box>
    </Box>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────

const STORAGE_BUCKET = "ad-images";
const FORMATS: ImageFormat[] = ["stories", "feed", "feed_4_5"];

export default function AssetsTab({ trackers, statuses, assets, progress, isPolling, onRatingGateChange, onNavigateToContent, brandId, currentGuardrails, onGuardrailUpdated }: AssetsTabProps) {
  const [igConnected,    setIgConnected]    = useState(false);
  const [libraryFiles,   setLibraryFiles]   = useState<LibraryFile[]>([]);
  const [loadingLib,     setLoadingLib]     = useState(true);
  const [publishTarget,  setPublishTarget]  = useState<PublishTarget | null>(null);
  const [activeFormat,   setActiveFormat]   = useState<ImageFormat | "all">("all");
  const [ratingFilter,   setRatingFilter]   = useState<"all" | "rated" | "unrated">("all");
  const [completeBannerDismissed, setCompleteBannerDismissed] = useState(false);
  const [ratedFileIds,   setRatedFileIds]   = useState<Set<string>>(new Set());
  const [ratingDataMap,  setRatingDataMap]  = useState<Map<string, { rating: number; feedback: string }>>(new Map());
  const [guardrailPrompt, setGuardrailPrompt] = useState<string | null>(null);
  const [savingGuardrail, setSavingGuardrail] = useState(false);

  const allAssets    = trackers.flatMap(t => (assets[t.campaignId] || []));
  const totalJobs    = Object.values(statuses).reduce((sum, s) => sum + s.total, 0);
  // isPolling is set immediately when addCampaign is called (statuses seeded at that point too)
  const isGenerating = isPolling;
  const allJobsDone  = !isPolling && totalJobs > 0 && progress === 100;

  // Only show "Applying Overlays" during a live generation session, never on cold page load.
  // wasPollingRef tracks whether isPolling went true→false in this browser session.
  const wasPollingRef = useRef(false);
  useEffect(() => {
    if (isPolling) {
      wasPollingRef.current = true;
    } else if (trackers.length === 0) {
      wasPollingRef.current = false; // campaigns cleared — reset for next generation
    }
  }, [isPolling, trackers.length]);

  const isOverlaying = allJobsDone && wasPollingRef.current && libraryFiles.length < totalJobs;
  const isComplete   = allJobsDone && wasPollingRef.current && !isOverlaying;

  // ── Load IG connection state ────────────────────────────────────────────────
  useEffect(() => {
    const checkIgConnected = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.ig_connection?.access_token) {
        setIgConnected(true);
        return;
      }
      // Fallback: check integrations table in case user_metadata propagation is delayed
      if (user) {
        const { data: integration } = await supabase
          .from("integrations")
          .select("status")
          .eq("provider", "instagram")
          .maybeSingle();
        if ((integration as any)?.status === "active") {
          setIgConnected(true);
          return;
        }
      }
      setIgConnected(false);
    };
    checkIgConnected();

    // Reactively update when session is refreshed (e.g. after connecting Instagram in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.user_metadata?.ig_connection?.access_token) {
        setIgConnected(true);
      } else {
        checkIgConnected();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Load library_images from Supabase table ────────────────────────────────
  const loadLibrary = useCallback(async () => {
    setLoadingLib(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLibraryFiles([]); setRatedFileIds(new Set()); return; }

      // Fetch files and their ratings in parallel so both states update atomically
      const [{ data, error }, { data: existingRatings }] = await Promise.all([
        supabase
          .from("library_images")
          .select("id, storage_path, external_url, format, label, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("image_feedback")
          .select("image_id, rating, feedback")
          .eq("user_id", user.id),
      ]);

      if (error || !data) { setLibraryFiles([]); setRatedFileIds(new Set()); return; }

      const files: LibraryFile[] = data.map(row => ({
        id:         row.id as string,
        name:       (row.storage_path as string).split("/").pop() || row.storage_path as string,
        // Use external_url if present, otherwise derive from storage bucket
        url:        (row.external_url as string | null) ||
                    supabase.storage.from(STORAGE_BUCKET).getPublicUrl(row.storage_path as string).data.publicUrl,
        format:     row.format as ImageFormat,
        label:      row.label as string | null,
        created_at: row.created_at as string | null,
      }));

      const ratingRows = (existingRatings as { image_id: string; rating: number; feedback: string | null }[] | null) ?? [];
      const ratedIds   = new Set(ratingRows.map(r => r.image_id));
      const ratingMap  = new Map(ratingRows.map(r => [r.image_id, { rating: r.rating, feedback: r.feedback || "" }]));

      // Set atomically — React 18 batches these into one render,
      // so onRatingGateChange always sees consistent files + ratings from DB.
      setLibraryFiles(files);
      setRatedFileIds(ratedIds);
      setRatingDataMap(ratingMap);
    } catch (err) {
      console.error("Library load error:", err);
      setLibraryFiles([]);
    } finally {
      setLoadingLib(false);
    }
  }, []);

  useEffect(() => { loadLibrary(); }, [loadLibrary]);

  // Report gate status to parent whenever library or rating state changes
  useEffect(() => {
    const hasPending = libraryFiles.length > 0 && libraryFiles.some(f => !ratedFileIds.has(f.id));
    onRatingGateChange?.(hasPending, libraryFiles.length, ratedFileIds.size);
  }, [libraryFiles, ratedFileIds, onRatingGateChange]);

  const handleFileRated = useCallback((fileId: string) => {
    setRatedFileIds(prev => new Set([...prev, fileId]));
  }, []);

  const handleAddToGuardrails = useCallback((feedback: string) => {
    if (!brandId) return;
    setGuardrailPrompt(feedback);
  }, [brandId]);

  const handleConfirmGuardrail = useCallback(async () => {
    if (!guardrailPrompt || !brandId) return;
    setSavingGuardrail(true);
    try {
      const newRule = `- ${guardrailPrompt}`;
      const updated = currentGuardrails
        ? `${currentGuardrails.trimEnd()}\n${newRule}`
        : newRule;
      await supabase
        .from("brands")
        .update({ guardrails: updated })
        .eq("id", brandId);
      onGuardrailUpdated?.(updated);
      setGuardrailPrompt(null);
    } catch (err) {
      console.error("Guardrail update error:", err);
    } finally {
      setSavingGuardrail(false);
    }
  }, [guardrailPrompt, brandId, currentGuardrails, onGuardrailUpdated]);

  // ── Subscribe to library_images inserts via Supabase Realtime ────────────────
  // Whenever a new image lands in the library (for any user row), re-fetch the list.
  // This replaces the old 5s setInterval and delivers updates within milliseconds.
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      channel = supabase
        .channel("library-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "library_images",
            filter: `user_id=eq.${user.id}`,
          },
          () => { loadLibrary(); },
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [loadLibrary]);

  // ── Auto-dismiss "All Assets Ready" banner after 8s ─────────────────────────
  useEffect(() => {
    if (!isComplete) { setCompleteBannerDismissed(false); return; }
    const t = setTimeout(() => setCompleteBannerDismissed(true), 8000);
    return () => clearTimeout(t);
  }, [isComplete]);

  // ── Empty state ─────────────────────────────────────────────────────────────
  // Guard: also require trackers.length === 0 so we don't flash "No Assets Yet"
  // in the window between library load completing and the polling hook initializing
  // (isPolling starts false until listCampaigns() returns, even during active generation).
  if (libraryFiles.length === 0 && !loadingLib && !isGenerating && !isOverlaying && trackers.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center"
        bg="white" border="1px solid" borderColor="#ECECEC" borderRadius="24px"
        p={{ base: 8, md: 16 }} textAlign="center" minH="400px">
        <Flex w="64px" h="64px" borderRadius="16px" bg="#F3F4F6" align="center" justify="center" mb={4}>
          <ImageIcon size={28} color="#D1D5DB" />
        </Flex>
        <Text fontSize="xl" fontWeight="700" color="#111" mb={2}>No Assets Yet</Text>
        <Text fontSize="15px" color="#6B7280" maxW="400px">
          Go to the{" "}
          <Text
            as="span"
            color="#4F46E5"
            fontWeight="600"
            cursor="pointer"
            textDecoration="underline"
            onClick={onNavigateToContent}
          >
            Content tab
          </Text>
          , select your contexts and templates, then hit Generate. Your ads will appear here in real-time.
        </Text>
      </Flex>
    );
  }

  return (
    <>
      {/* Publish modal */}
      {publishTarget && (
        <PublishModal target={publishTarget} onClose={() => setPublishTarget(null)} />
      )}

      {/* Guardrail suggestion popup */}
      {guardrailPrompt && (
        <GuardrailPromptModal
          feedback={guardrailPrompt}
          onConfirm={handleConfirmGuardrail}
          onDismiss={() => setGuardrailPrompt(null)}
          isSaving={savingGuardrail}
        />
      )}

      <VStack align="stretch" gap={6}>

        {/* Header */}
        <Flex align="center" justify="space-between">
          <Box>
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="700" color="#111" lineHeight="1.05" mb={1}>
              Assets
            </Text>
            <Text fontSize="15px" color="#6B7280">
              Your uploaded library images.
            </Text>
          </Box>
          <Flex gap={2} align="center">
            {igConnected && (
              <Box px={3} py={1.5} borderRadius="999px"
                style={{ background: "linear-gradient(135deg, #f09433, #dc2743, #bc1888)" }}>
                <Text fontSize="11px" fontWeight="700" color="white">IG Connected</Text>
              </Box>
            )}
          </Flex>
        </Flex>

        {/* Generation progress */}
        {(isGenerating || isOverlaying || isComplete) && !completeBannerDismissed && (
          <Box bg={isComplete ? "#F0FDF4" : "white"} border="1px solid"
            borderColor={isComplete ? "#BBF7D0" : "#E5E7EB"} borderRadius="20px"
            p={{ base: 5, md: 6 }}>
            <Flex align="center" gap={4} position="relative">
              <Button
                variant="ghost" size="xs" position="absolute" top="-12px" right="-12px"
                p={1} borderRadius="8px" _hover={{ bg: isComplete ? "#DCFCE7" : "#F3F4F6" }}
                onClick={() => setCompleteBannerDismissed(true)}
              >
                <X size={14} color="#9CA3AF" />
              </Button>
              {/* Circular progress */}
              <Flex w="56px" h="56px" borderRadius="full" position="relative"
                align="center" justify="center" flexShrink={0}
                bg={isComplete ? "#DCFCE7" : "#F3F4F6"}>
                <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
                  <circle cx="28" cy="28" r="24" fill="none" stroke={isComplete ? "#BBF7D0" : "#E5E7EB"} strokeWidth="4" />
                  <circle cx="28" cy="28" r="24" fill="none"
                    stroke={isComplete ? "#22C55E" : "#4F46E5"} strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.6s ease" }} />
                </svg>
                <Text fontSize="14px" fontWeight="700" color={isComplete ? "#166534" : "#4F46E5"}>{progress}%</Text>
              </Flex>

              {/* Status text */}
              <Box flex="1">
                <Flex align="center" gap={2}>
                  <Text fontSize="18px" fontWeight="700" color="#111">
                    {isComplete ? "All Assets Ready" : isOverlaying ? "Applying Overlays" : "Generating Assets"}
                  </Text>
                  {(isGenerating || isOverlaying) && <Loader size={16} color="#4F46E5" style={{ animation: "spin 1.5s linear infinite" }} />}
                </Flex>
                <Text fontSize="14px" color="#6B7280" mt={0.5}>
                  {isComplete
                    ? `${libraryFiles.length} ads ready in your library.`
                    : isOverlaying
                    ? `Base images done — applying brand overlays. Ads will appear shortly.`
                    : `${allAssets.length} of ${totalJobs} images complete. New assets appear as they finish.`}
                </Text>
                {(isGenerating || isOverlaying) && (
                  <Flex align="center" gap={1.5} mt={1.5}>
                    <Coffee size={14} color="#A78BFA" />
                    <Text fontSize="13px" color="#7C3AED" fontWeight="500">
                      Go grab a coffee — this runs in the background, even if you close the tab.
                    </Text>
                  </Flex>
                )}
              </Box>

              {/* Progress bar */}
              <Box flex="1" maxW="300px" display={{ base: "none", md: "block" }}>
                <Box bg="#F3F4F6" borderRadius="999px" h="10px" overflow="hidden">
                  <Box bg={isComplete
                      ? "linear-gradient(90deg, #22C55E 0%, #16A34A 100%)"
                      : "linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)"}
                    h="100%" borderRadius="999px" w={`${progress}%`} transition="width 0.6s ease" />
                </Box>
                <Text fontSize="12px" color="#9CA3AF" mt={1} textAlign="right">{allAssets.length} / {totalJobs}</Text>
              </Box>
            </Flex>
          </Box>
        )}

        {/* Library images */}
        <Box>
          <Text fontSize="13px" fontWeight="800" color="#6B7280" letterSpacing="0.06em" textTransform="uppercase" mb={4}>
            Upload Library
          </Text>

          {/* Rating stat blocks — clickable filters */}
          {libraryFiles.length > 0 && (() => {
            const unratedCount = libraryFiles.length - ratedFileIds.size;
            const statBlocks: { key: "all" | "rated" | "unrated"; label: string; count: number; activeBg: string; activeBorder: string; activeText: string; idleBg: string; idleBorder: string; idleText: string; dotColor: string }[] = [
              { key: "all",     label: "All Assets",  count: libraryFiles.length, activeBg: "#111111",  activeBorder: "#111111",  activeText: "white",   idleBg: "white", idleBorder: "#E5E7EB", idleText: "#374151", dotColor: "#9CA3AF" },
              { key: "rated",   label: "Rated",       count: ratedFileIds.size,   activeBg: "#F0FDF4",  activeBorder: "#22C55E",  activeText: "#166534", idleBg: "white", idleBorder: "#E5E7EB", idleText: "#374151", dotColor: "#22C55E" },
              { key: "unrated", label: "Unrated",     count: unratedCount,        activeBg: "#FFFBEB",  activeBorder: "#F59E0B",  activeText: "#92400E", idleBg: "white", idleBorder: "#E5E7EB", idleText: "#374151", dotColor: "#F59E0B" },
            ];
            return (
              <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={3} mb={5}>
                {statBlocks.map(({ key, label, count, activeBg, activeBorder, activeText, idleBg, idleBorder, idleText, dotColor }) => {
                  const isActive = ratingFilter === key;
                  return (
                    <Box
                      key={key}
                      cursor="pointer"
                      bg={isActive ? activeBg : idleBg}
                      border="2px solid"
                      borderColor={isActive ? activeBorder : idleBorder}
                      borderRadius="16px"
                      p={4}
                      transition="all 0.18s ease"
                      _hover={{ borderColor: activeBorder, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                      onClick={() => setRatingFilter(key)}
                    >
                      <Flex align="center" gap={1.5} mb={2}>
                        <Box w="8px" h="8px" borderRadius="full" bg={isActive ? (key === "all" ? "white" : dotColor) : dotColor} flexShrink={0} />
                        <Text fontSize="12px" fontWeight="600" color={isActive ? activeText : "#6B7280"}>
                          {label}
                        </Text>
                      </Flex>
                      <Text fontSize="28px" fontWeight="800" color={isActive ? activeText : "#111111"} lineHeight="1">
                        {count}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            );
          })()}

          {/* Format filter tabs */}
          {libraryFiles.length > 0 && (
            <Flex gap={2} mb={5} wrap="wrap">
              {(["all", ...FORMATS] as (ImageFormat | "all")[]).map(f => {
                const count = f === "all" ? libraryFiles.length : libraryFiles.filter(img => img.format === f).length;
                return (
                  <Button key={f} size="sm" borderRadius="999px" h="32px" px={3} fontSize="12px" fontWeight="600"
                    bg={activeFormat === f ? "#111111" : "#F3F4F6"}
                    color={activeFormat === f ? "white" : "#374151"}
                    border="1px solid" borderColor={activeFormat === f ? "#111111" : "#E5E7EB"}
                    _hover={{ bg: activeFormat === f ? "#111111" : "#E5E7EB" }}
                    onClick={() => setActiveFormat(f)}>
                    {f === "all" ? "All" : FORMAT_LABELS[f]} ({count})
                  </Button>
                );
              })}
            </Flex>
          )}

          {(() => {
            const pendingCount = (isGenerating || isOverlaying) ? Math.max(0, totalJobs - libraryFiles.length) : 0;
            const filteredFiles = libraryFiles
              .filter(f => activeFormat === "all" || f.format === activeFormat)
              .filter(f => ratingFilter === "all" || (ratingFilter === "rated" ? ratedFileIds.has(f.id) : !ratedFileIds.has(f.id)));

            if (loadingLib && libraryFiles.length === 0) {
              return (
                <Box display="grid"
                  gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }}
                  gap={5}>
                  {[1, 2, 3, 4].map(i => (
                    <Box key={i} border="1px solid" borderColor="#F3F4F6" borderRadius="18px" overflow="hidden" bg="white">
                      <Box bg="#F3F4F6" position="relative" style={{ aspectRatio: "4/5" }}>
                        <Flex position="absolute" inset={0} align="center" justify="center"
                          bg="linear-gradient(135deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%)"
                          backgroundSize="400% 400%"
                          style={{ animation: "shimmer 1.8s ease-in-out infinite" }}>
                          <ImageIcon size={28} color="#D1D5DB" />
                        </Flex>
                      </Box>
                      <Box p={4}>
                        <Box h="16px" w="70%" bg="#F3F4F6" borderRadius="8px" mb={2} />
                        <Box h="12px" w="50%" bg="#F3F4F6" borderRadius="8px" />
                      </Box>
                    </Box>
                  ))}
                </Box>
              );
            }

            if (filteredFiles.length === 0 && pendingCount === 0) {
              // If campaigns exist but polling hasn't initialised yet, show skeleton rather than empty
              if (trackers.length > 0) {
                return (
                  <Box display="grid"
                    gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }}
                    gap={5}>
                    {[1, 2, 3, 4].map(i => (
                      <Box key={i} border="1px solid" borderColor="#F3F4F6" borderRadius="18px" overflow="hidden" bg="white">
                        <Box bg="#F3F4F6" position="relative" style={{ aspectRatio: "4/5" }}>
                          <Flex position="absolute" inset={0} align="center" justify="center"
                            bg="linear-gradient(135deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%)"
                            backgroundSize="400% 400%"
                            style={{ animation: "shimmer 1.8s ease-in-out infinite" }}>
                            <ImageIcon size={28} color="#D1D5DB" />
                          </Flex>
                        </Box>
                        <Box p={4}>
                          <Box h="16px" w="70%" bg="#F3F4F6" borderRadius="8px" mb={2} />
                          <Box h="12px" w="50%" bg="#F3F4F6" borderRadius="8px" />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                );
              }
              return (
                <Box bg="white" border="1px solid" borderColor="#E5E7EB" borderRadius="16px" p={6} textAlign="center">
                  <Text fontSize="14px" color="#9CA3AF">No library images assigned to you yet.</Text>
                  <Text fontSize="13px" color="#D1D5DB" mt={1}>
                    Upload to Supabase Storage → <strong>{STORAGE_BUCKET}/</strong>&#123;stories|feed|feed_4_5&#125;/ then insert a row in <strong>library_images</strong>.
                  </Text>
                </Box>
              );
            }

            // Group carousel slides by variation key, pass regular files through
            const carouselGroups = new Map<string, LibraryFile[]>();
            const regularFiles: LibraryFile[] = [];
            for (const file of filteredFiles) {
              // Name: {campaign_id}-{brand_id}-carousel-v{N}-s{M}_overlay.webp
              const match = file.name.match(/^(.+-carousel-v\d+)-s\d+[_.].*$/);
              if (match) {
                const key = match[1];
                if (!carouselGroups.has(key)) carouselGroups.set(key, []);
                carouselGroups.get(key)!.push(file);
              } else if (file.label?.startsWith("Carousel ·")) {
                // Fallback: group by label prefix when name pattern differs
                const key = `carousel-fallback-${file.created_at?.slice(0, 10) ?? file.id.slice(0, 8)}`;
                if (!carouselGroups.has(key)) carouselGroups.set(key, []);
                carouselGroups.get(key)!.push(file);
              } else {
                regularFiles.push(file);
              }
            }

            return (
              <Box display="grid"
                gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }}
                gap={5}>
                {/* Skeleton placeholders for in-flight ads */}
                {Array.from({ length: pendingCount }).map((_, i) => (
                  <Box key={`skel-${i}`} borderRadius="18px" overflow="hidden" border="1px solid" borderColor="#F3F4F6" bg="white">
                    <Flex
                      style={{
                        aspectRatio: "4/5",
                        animation: "shimmer 1.8s ease-in-out infinite",
                        background: "linear-gradient(135deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%)",
                        backgroundSize: "400% 400%",
                      }}
                      align="center" justify="center" direction="column" gap={2}>
                      <Loader size={20} color="#D1D5DB" style={{ animation: "spin 1.5s linear infinite" }} />
                      <Text fontSize="11px" color="#D1D5DB">Generating...</Text>
                    </Flex>
                    <Box p={4}>
                      <Box h="14px" w="60%" bg="#F3F4F6" borderRadius="8px" mb={2} />
                      <Box h="11px" w="40%" bg="#F3F4F6" borderRadius="8px" />
                    </Box>
                  </Box>
                ))}
                {/* Carousel bundle cards — one card per variation group */}
                {Array.from(carouselGroups.entries()).map(([key, slides]) => (
                  <CarouselBundleCard key={key} slides={slides}
                    igConnected={igConnected} onPublish={setPublishTarget}
                    onRated={handleFileRated} ratedFileIds={ratedFileIds}
                    ratingDataMap={ratingDataMap}
                    onAddToGuardrails={brandId ? handleAddToGuardrails : undefined} />
                ))}
                {/* Regular (non-carousel) library cards */}
                {regularFiles.map(file => (
                  <LibraryCard key={file.id} file={file}
                    igConnected={igConnected} onPublish={setPublishTarget}
                    onRated={handleFileRated} isRated={ratedFileIds.has(file.id)}
                    ratingData={ratingDataMap.get(file.id)}
                    onAddToGuardrails={brandId ? handleAddToGuardrails : undefined} />
                ))}
              </Box>
            );
          })()}
        </Box>
      </VStack>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
