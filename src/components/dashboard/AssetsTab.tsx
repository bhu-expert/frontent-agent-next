"use client";
/* eslint-disable react/no-unstable-nested-components */

import { useState, useEffect, useCallback } from "react";
import {
  Badge, Box, Button, Flex, Image, Text, VStack, Textarea,
} from "@chakra-ui/react";
import {
  Coffee, Download, ImageIcon, Loader, Lock, X, Star, MessageSquare, Sparkles,
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
  currentBatchCampaignIds: string[];
  onVariationRated: (variationId: string) => void;
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


// ─── Feedback Panel ──────────────────────────────────────────────────────────

function FeedbackPanel({ imageId, onRated }: { imageId: string; onRated?: (imageId: string) => void }) {
  const [rating, setRating]       = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [loaded, setLoaded]       = useState(false);

  // Load existing feedback on mount
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("image_feedback")
        .select("rating, feedback")
        .eq("image_id", imageId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setRating((data as { rating: number; feedback: string | null }).rating);
        setFeedback((data as { rating: number; feedback: string | null }).feedback || "");
        setSaved(true);
      }
      setLoaded(true);
    })();
  }, [imageId]);

  const handleSave = async () => {
    if (rating === 0) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("image_feedback").upsert(
        { image_id: imageId, user_id: user.id, rating, feedback: feedback || null, updated_at: new Date().toISOString() },
        { onConflict: "image_id,user_id" }
      );
      setSaved(true);
      onRated?.(imageId);
    } catch (err) {
      console.error("Feedback save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  return (
    <Box mt={2} pt={2} borderTop="1px solid" borderColor="#F3F4F6">
      {/* Star Rating */}
      <Flex align="center" gap={1} mb={1.5}>
        {[1, 2, 3, 4, 5].map(star => (
          <Box
            key={star}
            cursor="pointer"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => { setRating(star); setSaved(false); }}
            transition="transform 0.15s"
            _hover={{ transform: "scale(1.2)" }}
          >
            <Star
              size={16}
              color={(hoverRating || rating) >= star ? "#F59E0B" : "#D1D5DB"}
              fill={(hoverRating || rating) >= star ? "#F59E0B" : "none"}
              strokeWidth={2}
            />
          </Box>
        ))}
        {rating > 0 && (
          <Text fontSize="11px" color="#9CA3AF" ml={1}>{rating}/5</Text>
        )}
      </Flex>

      {/* Feedback input */}
      <Flex gap={1.5}>
        <input
          value={feedback}
          onChange={e => { setFeedback(e.target.value); setSaved(false); }}
          placeholder="Leave feedback..."
          style={{
            flex: 1, fontSize: "12px", padding: "6px 10px",
            border: "1px solid #E5E7EB", borderRadius: "8px",
            outline: "none", color: "#374151", background: "#F9FAFB",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "#6366F1"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
        />
        <Button
          size="xs" h="30px" px={2.5} borderRadius="8px"
          bg={saved ? "#DCFCE7" : "#4F46E5"}
          color={saved ? "#166534" : "white"}
          fontSize="11px" fontWeight="600"
          _hover={{ opacity: 0.85 }}
          disabled={rating === 0 || saving}
          onClick={handleSave}
        >
          {saving ? <Loader size={10} style={{ animation: "spin 1.5s linear infinite" }} /> : saved ? "Saved" : "Save"}
        </Button>
      </Flex>
    </Box>
  );
}

// ─── Batch Asset Card ─────────────────────────────────────────────────────────

function BatchAssetCard({ asset, isRated, onRated }: {
  asset: CampaignAsset;
  isRated: boolean;
  onRated: (variationId: string) => void;
}) {
  const imageUrl = asset.overlay_url || asset.image_url;

  return (
    <Box
      borderRadius="18px" overflow="hidden" bg="white"
      border="2px solid" borderColor={isRated ? "#22C55E" : "#ECECEC"}
      transition="all 0.3s ease"
      _hover={{ boxShadow: "0 16px 48px rgba(0,0,0,0.1)", transform: "translateY(-3px)" }}
    >
      <Box position="relative" style={{ aspectRatio: "4/5" }} overflow="hidden" bg="#F3F4F6">
        {imageUrl ? (
          <Image src={imageUrl} alt={`Variation ${asset.variation_index}`} objectFit="cover" w="full" h="full" />
        ) : (
          <Flex position="absolute" inset={0} align="center" justify="center" direction="column" gap={2}>
            <Loader size={24} color="#9CA3AF" style={{ animation: "spin 1.5s linear infinite" }} />
            <Text fontSize="11px" color="#9CA3AF">Generating...</Text>
          </Flex>
        )}
        {isRated && (
          <Flex
            position="absolute" inset={0}
            align="center" justify="center"
            bg="rgba(34,197,94,0.15)"
          >
            <Flex
              w="40px" h="40px" borderRadius="full" bg="#22C55E"
              align="center" justify="center"
              boxShadow="0 4px 12px rgba(34,197,94,0.4)"
            >
              <Text color="white" fontSize="18px" fontWeight="700">&#10003;</Text>
            </Flex>
          </Flex>
        )}
      </Box>
      <Box p={3}>
        <Text fontSize="12px" color="#6B7280" mb={2}>Variation {asset.variation_index + 1}</Text>
        <FeedbackPanel imageId={asset.variation_id} onRated={onRated} />
      </Box>
    </Box>
  );
}

// ─── Library Image Card ───────────────────────────────────────────────────────

function LibraryCard({ file, igConnected, onPublish }: {
  file: LibraryFile;
  igConnected: boolean;
  onPublish: (t: PublishTarget) => void;
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const igType = FORMAT_IG_TYPE[file.format];

  return (
    <Box borderRadius="18px" overflow="hidden" bg="white"
      border="1px solid" borderColor="#ECECEC"
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
        <Flex justify="space-between" align="center">
          <Box flex={1} minW={0}>
            <Text fontSize="13px" fontWeight="600" color="#111111"
              overflow="hidden" whiteSpace="nowrap" style={{ textOverflow: "ellipsis" }}>
              {file.label || file.name}
            </Text>
            <Text fontSize="11px" color="#9CA3AF" mt={0.5}>{FORMAT_LABELS[file.format]}</Text>
          </Box>
          <Button variant="ghost" size="xs" h="26px" px={2} borderRadius="8px"
            color={showFeedback ? "#4F46E5" : "#9CA3AF"}
            _hover={{ color: "#4F46E5", bg: "#EEF2FF" }}
            onClick={() => setShowFeedback(!showFeedback)}>
            <MessageSquare size={13} />
            <Text ml={1} fontSize="11px">{showFeedback ? "Hide" : "Rate"}</Text>
          </Button>
        </Flex>
        {showFeedback && <FeedbackPanel imageId={file.id} />}
      </Box>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const STORAGE_BUCKET = "ad-images";
const FORMATS: ImageFormat[] = ["stories", "feed", "feed_4_5"];

export default function AssetsTab({ trackers, statuses, assets, progress, isPolling, currentBatchCampaignIds, onVariationRated }: AssetsTabProps) {
  const [igConnected,    setIgConnected]    = useState(false);
  const [libraryFiles,   setLibraryFiles]   = useState<LibraryFile[]>([]);
  const [loadingLib,     setLoadingLib]     = useState(true);
  const [publishTarget,  setPublishTarget]  = useState<PublishTarget | null>(null);
  const [activeFormat,   setActiveFormat]   = useState<ImageFormat | "all">("all");
  const [localBatchRated, setLocalBatchRated] = useState<Set<string>>(new Set());

  const allAssets  = trackers.flatMap(t => (assets[t.campaignId] || []));
  const totalJobs  = Object.values(statuses).reduce((sum, s) => sum + s.total, 0);
  const isGenerating = isPolling && totalJobs > 0;
  const isComplete   = progress === 100 && !isPolling && totalJobs > 0;

  // Batch assets and rating state
  const batchAssets = currentBatchCampaignIds.flatMap(cid => assets[cid] ?? []);
  const allBatchRated = batchAssets.length > 0 && batchAssets.every(a => localBatchRated.has(a.variation_id));

  // Seed localBatchRated from DB when batch assets load
  useEffect(() => {
    if (currentBatchCampaignIds.length === 0 || batchAssets.length === 0) return;
    const variationIds = batchAssets.map(a => a.variation_id).filter(Boolean);
    if (variationIds.length === 0) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("image_feedback")
        .select("image_id")
        .in("image_id", variationIds)
        .eq("user_id", user.id);
      if (data) {
        setLocalBatchRated(prev => {
          const next = new Set(prev);
          for (const row of data as { image_id: string }[]) next.add(row.image_id);
          return next;
        });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBatchCampaignIds, assets]);

  const handleBatchVariationRated = (variationId: string) => {
    setLocalBatchRated(prev => new Set([...prev, variationId]));
    onVariationRated(variationId);
  };

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
      if (!user) { setLibraryFiles([]); return; }

      const { data, error } = await supabase
        .from("library_images")
        .select("id, storage_path, external_url, format, label, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error || !data) { setLibraryFiles([]); return; }

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
      setLibraryFiles(files);
    } catch (err) {
      console.error("Library load error:", err);
      setLibraryFiles([]);
    } finally {
      setLoadingLib(false);
    }
  }, []);

  useEffect(() => { loadLibrary(); }, [loadLibrary]);

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (libraryFiles.length === 0 && !loadingLib && batchAssets.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center"
        bg="white" border="1px solid" borderColor="#ECECEC" borderRadius="24px"
        p={{ base: 8, md: 16 }} textAlign="center" minH="400px">
        <Flex w="64px" h="64px" borderRadius="16px" bg="#F3F4F6" align="center" justify="center" mb={4}>
          <ImageIcon size={28} color="#D1D5DB" />
        </Flex>
        <Text fontSize="xl" fontWeight="700" color="#111" mb={2}>No Assets Yet</Text>
        <Text fontSize="15px" color="#6B7280" maxW="400px">
          Go to the Content tab, select your contexts and templates, then hit Generate. Your ads will appear here in real-time.
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
            {libraryFiles.length > 0 && (
              <Badge bg="#EEF2FF" color="#4338CA" px={3} py={2} borderRadius="999px" fontSize="14px">
                {libraryFiles.length} {libraryFiles.length === 1 ? "asset" : "assets"}
              </Badge>
            )}
          </Flex>
        </Flex>

        {/* Generation progress */}
        {(isGenerating || isComplete) && (
          <Box bg={isComplete ? "#F0FDF4" : "white"} border="1px solid"
            borderColor={isComplete ? "#BBF7D0" : "#E5E7EB"} borderRadius="20px"
            p={{ base: 5, md: 6 }}>
            <Flex align="center" gap={4}>
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
                    {isComplete ? "All Assets Ready" : "Generating Assets"}
                  </Text>
                  {isGenerating && <Loader size={16} color="#4F46E5" style={{ animation: "spin 1.5s linear infinite" }} />}
                </Flex>
                <Text fontSize="14px" color="#6B7280" mt={0.5}>
                  {isComplete
                    ? `${allAssets.length} images generated — they'll appear in your library once uploaded.`
                    : `${allAssets.length} of ${totalJobs} images complete. New assets appear as they finish.`}
                </Text>
                {isGenerating && (
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

        {/* Current Batch section */}
        {currentBatchCampaignIds.length > 0 && batchAssets.length > 0 && (
          <Box>
            {/* Header */}
            <Flex align="center" justify="space-between" mb={4}>
              <Flex align="center" gap={3}>
                <Text fontSize="13px" fontWeight="800" color="#111111" letterSpacing="0.06em" textTransform="uppercase">
                  Current Batch
                </Text>
                <Badge
                  bg={allBatchRated ? "#DCFCE7" : "#FFF7ED"}
                  color={allBatchRated ? "#166534" : "#9A3412"}
                  border="1px solid"
                  borderColor={allBatchRated ? "#BBF7D0" : "#FED7AA"}
                  borderRadius="999px" px={3} py={1} fontSize="12px" fontWeight="700"
                >
                  {localBatchRated.size} / {batchAssets.length} rated
                </Badge>
              </Flex>
              {allBatchRated && (
                <Badge bg="#DCFCE7" color="#166534" borderRadius="999px" px={3} py={1} fontSize="12px" fontWeight="700">
                  Next batch unlocked!
                </Badge>
              )}
            </Flex>

            {/* Progress bar */}
            <Box bg="#F3F4F6" borderRadius="999px" h="8px" overflow="hidden" mb={3}>
              <Box
                bg={allBatchRated
                  ? "linear-gradient(90deg, #22C55E 0%, #16A34A 100%)"
                  : "linear-gradient(90deg, #F97316 0%, #EA580C 100%)"}
                h="100%" borderRadius="999px"
                w={`${batchAssets.length > 0 ? (localBatchRated.size / batchAssets.length) * 100 : 0}%`}
                transition="width 0.4s ease"
              />
            </Box>

            {/* Lock notice */}
            {!allBatchRated && (
              <Flex
                align="center" gap={3} mb={5}
                bg="#FFF7ED" border="1px solid" borderColor="#FED7AA"
                borderRadius="12px" px={4} py={3}
              >
                <Lock size={14} color="#EA580C" />
                <Text fontSize="13px" color="#9A3412" fontWeight="500">
                  Rate all {batchAssets.length} assets to unlock the next generation batch
                </Text>
              </Flex>
            )}

            {/* Batch asset grid */}
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }}
              gap={5}
              mb={8}
            >
              {batchAssets.map(asset => (
                <BatchAssetCard
                  key={asset.variation_id}
                  asset={asset}
                  isRated={localBatchRated.has(asset.variation_id)}
                  onRated={handleBatchVariationRated}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Library images */}
        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="13px" fontWeight="800" color="#6B7280" letterSpacing="0.06em" textTransform="uppercase">
              Upload Library
            </Text>
            <Button variant="ghost" size="xs" onClick={loadLibrary} loading={loadingLib}
              color="#6B7280" _hover={{ color: "#111111" }}>
              Refresh
            </Button>
          </Flex>

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

          {loadingLib ? (
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
          ) : libraryFiles.length === 0 ? (
            <Box bg="white" border="1px solid" borderColor="#E5E7EB" borderRadius="16px" p={6} textAlign="center">
              <Text fontSize="14px" color="#9CA3AF">No library images assigned to you yet.</Text>
              <Text fontSize="13px" color="#D1D5DB" mt={1}>
                Upload to Supabase Storage → <strong>{STORAGE_BUCKET}/</strong>&#123;stories|feed|feed_4_5&#125;/ then insert a row in <strong>library_images</strong>.
              </Text>
            </Box>
          ) : (
            <Box display="grid"
              gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }}
              gap={5}>
              {libraryFiles
                .filter(f => activeFormat === "all" || f.format === activeFormat)
                .map(file => (
                  <LibraryCard key={file.id} file={file}
                    igConnected={igConnected} onPublish={setPublishTarget} />
                ))}
            </Box>
          )}
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
