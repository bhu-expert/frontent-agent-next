"use client";

import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ChevronDown,
  ChevronUp,
  Coffee,
  Download,
  ImageIcon,
  Loader,
} from "lucide-react";
import type { CampaignAsset } from "@/types/onboarding.types";
import type { CampaignTracker } from "@/hooks/useCampaignPolling";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface AssetsTabProps {
  trackers: CampaignTracker[];
  statuses: Record<string, { total: number; complete: number; status: string }>;
  assets: Record<string, CampaignAsset[]>;
  progress: number;
  isPolling: boolean;
}

interface TemplateProps {
  vd: Record<string, string>;
  imageUrl: string | null;
  primary: string;
  secondary: string;
  accent: string;
}

/* ─── Progress Header ────────────────────────────────────────────────── */

function ProgressHeader({ progress, isPolling, totalAssets, totalJobs }: {
  progress: number;
  isPolling: boolean;
  totalAssets: number;
  totalJobs: number;
}) {
  const isComplete = progress === 100 && !isPolling;

  return (
    <Box
      bg={isComplete ? "#F0FDF4" : "white"}
      border="1px solid"
      borderColor={isComplete ? "#BBF7D0" : "#E5E7EB"}
      borderRadius="20px"
      p={{ base: 5, md: 6 }}
    >
      <Flex align="center" gap={4}>
        <Flex
          w="56px" h="56px" borderRadius="full" position="relative"
          align="center" justify="center" flexShrink={0}
          bg={isComplete ? "#DCFCE7" : "#F3F4F6"}
        >
          <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
            <circle cx="28" cy="28" r="24" fill="none" stroke={isComplete ? "#BBF7D0" : "#E5E7EB"} strokeWidth="4" />
            <circle
              cx="28" cy="28" r="24" fill="none"
              stroke={isComplete ? "#22C55E" : "#4F46E5"}
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <Text fontSize="14px" fontWeight="700" color={isComplete ? "#166534" : "#4F46E5"}>
            {progress}%
          </Text>
        </Flex>

        <Box flex="1">
          <Flex align="center" gap={2}>
            <Text fontSize="18px" fontWeight="700" color="#111">
              {isComplete ? "All Assets Ready" : "Generating Assets"}
            </Text>
            {isPolling && (
              <Loader size={16} color="#4F46E5" style={{ animation: "spin 1.5s linear infinite" }} />
            )}
          </Flex>
          <Text fontSize="14px" color="#6B7280" mt={0.5}>
            {isComplete
              ? `${totalAssets} images generated and uploaded to your library.`
              : `${totalAssets} of ${totalJobs} images complete. New assets appear below as they finish.`}
          </Text>
          {isPolling && !isComplete && (
            <Flex align="center" gap={1.5} mt={1.5}>
              <Coffee size={14} color="#A78BFA" />
              <Text fontSize="13px" color="#7C3AED" fontWeight="500">
                Go grab a coffee — this runs in the background, even if you close the tab.
              </Text>
            </Flex>
          )}
        </Box>

        <Box flex="1" maxW="300px" display={{ base: "none", md: "block" }}>
          <Box bg="#F3F4F6" borderRadius="999px" h="10px" overflow="hidden">
            <Box
              bg={isComplete
                ? "linear-gradient(90deg, #22C55E 0%, #16A34A 100%)"
                : "linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)"}
              h="100%"
              borderRadius="999px"
              w={`${progress}%`}
              transition="width 0.6s ease"
            />
          </Box>
          <Text fontSize="12px" color="#9CA3AF" mt={1} textAlign="right">
            {totalAssets} / {totalJobs}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

/* ─── Skeleton Card ──────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <Box
      border="1px solid" borderColor="#F3F4F6" borderRadius="18px"
      overflow="hidden" bg="white"
    >
      <Box bg="#F3F4F6" position="relative" style={{ aspectRatio: "4/5" }}>
        <Flex
          position="absolute" inset={0} align="center" justify="center"
          bg="linear-gradient(135deg, #F9FAFB 25%, #F3F4F6 50%, #F9FAFB 75%)"
          backgroundSize="400% 400%"
          style={{ animation: "shimmer 1.8s ease-in-out infinite" }}
        >
          <ImageIcon size={28} color="#D1D5DB" />
        </Flex>
      </Box>
      <Box p={4}>
        <Box h="16px" w="70%" bg="#F3F4F6" borderRadius="8px" mb={2} />
        <Box h="12px" w="50%" bg="#F3F4F6" borderRadius="8px" />
      </Box>
    </Box>
  );
}

/* ─── Template: AWARENESS — Editorial Hero ───────────────────────────── */

function AwarenessTemplate({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <Box position="relative" w="100%" h="100%">
      {/* Image — hero-dominant */}
      {imageUrl ? (
        <Image
          src={imageUrl} alt={vd.headline || ""}
          position="absolute" inset={0} w="100%" h="100%"
          objectFit="cover" opacity={0.9}
        />
      ) : (
        <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`} />
      )}

      {/* Brand name — subtle top-left */}
      {vd.brand_name && (
        <Text
          position="absolute" top="20px" left="24px" zIndex={3}
          fontSize="10px" fontWeight="600" color="rgba(255,255,255,0.6)"
          letterSpacing="0.1em" textTransform="uppercase"
        >
          {vd.brand_name}
        </Text>
      )}

      {/* Bottom text band */}
      <Flex
        position="absolute" bottom={0} left={0} right={0} zIndex={2}
        direction="column" p="24px" pt="64px"
        bg="linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)"
      >
        {vd.tagline && (
          <Text
            fontSize="10px" fontWeight="600" textTransform="uppercase"
            letterSpacing="0.12em" color={accent} mb="6px"
          >
            {vd.tagline}
          </Text>
        )}
        <Text
          fontSize="22px" fontWeight="800" color="white"
          lineHeight="1.15" mb="4px"
          overflow="hidden"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
        >
          {vd.headline || "Untitled"}
        </Text>
        {vd.subheadline && (
          <Text
            fontSize="12px" fontWeight="400" color="rgba(255,255,255,0.75)"
            lineHeight="1.4"
            overflow="hidden"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {vd.subheadline}
          </Text>
        )}
      </Flex>
    </Box>
  );
}

/* ─── Template: SALE — Bold Promo ────────────────────────────────────── */

function SaleTemplate({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  const hasOffer = vd.offer_text && vd.offer_text.trim();

  return (
    <Box position="relative" w="100%" h="100%" bg={primary}>
      {/* Image — faded texture */}
      {imageUrl && (
        <Image
          src={imageUrl} alt=""
          position="absolute" inset={0} w="100%" h="100%"
          objectFit="cover" opacity={0.15}
        />
      )}

      {/* Diagonal accent shape */}
      <Box
        position="absolute" top="-30%" right="-25%" w="70%" h="60%"
        bg={accent} transform="rotate(15deg)" opacity={0.15}
        borderRadius="40px"
      />
      <Box
        position="absolute" bottom="-20%" left="-20%" w="50%" h="40%"
        bg={secondary} transform="rotate(-10deg)" opacity={0.2}
        borderRadius="40px"
      />

      {/* Centered content */}
      <Flex
        position="relative" zIndex={2}
        direction="column" align="center" justify="center"
        h="100%" p="28px" textAlign="center"
      >
        {hasOffer ? (
          <>
            {/* Offer badge — hero element */}
            <Box
              bg={accent} borderRadius="16px"
              px="24px" py="10px" mb="14px"
              boxShadow={`0 8px 32px ${accent}44`}
            >
              <Text
                fontSize="42px" fontWeight="900" color={secondary}
                lineHeight="1.0" letterSpacing="-0.02em"
              >
                {vd.offer_text}
              </Text>
            </Box>
            <Text
              fontSize="20px" fontWeight="800" color="white"
              lineHeight="1.15" mb="8px"
              textShadow="0 2px 8px rgba(0,0,0,0.2)"
              overflow="hidden"
              style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
            >
              {vd.headline || "Untitled"}
            </Text>
          </>
        ) : (
          <>
            {/* No offer — headline as hero */}
            <Text
              fontSize="34px" fontWeight="900" color="white"
              lineHeight="1.05" mb="10px"
              textShadow="0 2px 12px rgba(0,0,0,0.2)"
              overflow="hidden" textAlign="center"
              style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
            >
              {vd.headline || "Untitled"}
            </Text>
            {vd.subheadline && (
              <Text
                fontSize="14px" fontWeight="500" color="rgba(255,255,255,0.8)"
                lineHeight="1.4"
                overflow="hidden"
                style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
              >
                {vd.subheadline}
              </Text>
            )}
          </>
        )}

        {/* Tagline */}
        {vd.tagline && (
          <Text
            fontSize="11px" fontWeight="600" color="rgba(255,255,255,0.6)"
            textTransform="uppercase" letterSpacing="0.1em"
            mt="12px"
          >
            {vd.tagline}
          </Text>
        )}
      </Flex>
    </Box>
  );
}

/* ─── Template: LAUNCH — Dark Cinematic ──────────────────────────────── */

function LaunchTemplate({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  const label = vd.launch_label || "NEW";

  return (
    <Box position="relative" w="100%" h="100%" bg={secondary}>
      {/* Image — medium opacity */}
      {imageUrl && (
        <Image
          src={imageUrl} alt=""
          position="absolute" inset={0} w="100%" h="100%"
          objectFit="cover" opacity={0.45}
        />
      )}

      {/* Dark overlay */}
      <Box
        position="absolute" inset={0}
        bg="linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.65) 100%)"
      />

      {/* Radial glow */}
      <Box
        position="absolute" top="35%" left="50%"
        transform="translate(-50%, -50%)"
        w="220px" h="220px" borderRadius="full"
        bg={`radial-gradient(circle, ${accent}30 0%, transparent 70%)`}
        filter="blur(40px)" pointerEvents="none"
      />

      {/* Content — centered */}
      <Flex
        position="relative" zIndex={2}
        direction="column" align="center" justify="center"
        h="100%" p="28px" textAlign="center"
      >
        {/* Launch label — glowing pill */}
        <Box
          bg="rgba(255,255,255,0.08)"
          border="1px solid" borderColor={`${accent}66`}
          borderRadius="999px" px="18px" py="6px" mb="20px"
          backdropFilter="blur(8px)"
          boxShadow={`0 0 24px ${accent}33, 0 0 48px ${accent}18`}
        >
          <Text
            fontSize="11px" fontWeight="700" color={accent}
            textTransform="uppercase" letterSpacing="0.18em"
          >
            {label}
          </Text>
        </Box>

        <Text
          fontSize="24px" fontWeight="800" color="white"
          lineHeight="1.1" mb="10px"
          overflow="hidden"
          style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
        >
          {vd.headline || "Untitled"}
        </Text>

        {vd.subheadline && (
          <Text
            fontSize="13px" fontWeight="400" color="rgba(255,255,255,0.6)"
            lineHeight="1.45" maxW="90%"
            overflow="hidden"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {vd.subheadline}
          </Text>
        )}
      </Flex>

      {/* Brand name — bottom right */}
      {vd.brand_name && (
        <Text
          position="absolute" bottom="18px" right="24px" zIndex={3}
          fontSize="9px" fontWeight="600" color="rgba(255,255,255,0.3)"
          letterSpacing="0.12em" textTransform="uppercase"
        >
          {vd.brand_name}
        </Text>
      )}
    </Box>
  );
}

/* ─── Template: STORY_NARRATIVE — Cinematic Quote ────────────────────── */

function StoryNarrativeTemplate({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <Box position="relative" w="100%" h="100%">
      {/* Image — cinematic full bleed */}
      {imageUrl ? (
        <Image
          src={imageUrl} alt=""
          position="absolute" inset={0} w="100%" h="100%"
          objectFit="cover" opacity={0.85}
        />
      ) : (
        <Box position="absolute" inset={0} bg={`linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)`} />
      )}

      {/* Dark vignette */}
      <Box
        position="absolute" inset={0}
        bg="radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)"
      />

      {/* Story theme pill — top left */}
      {vd.story_theme && (
        <Box
          position="absolute" top="20px" left="24px" zIndex={3}
          bg="rgba(255,255,255,0.12)" backdropFilter="blur(8px)"
          borderRadius="999px" px="14px" py="5px"
        >
          <Text
            fontSize="9px" fontWeight="700" color="rgba(255,255,255,0.85)"
            textTransform="uppercase" letterSpacing="0.12em"
          >
            {vd.story_theme}
          </Text>
        </Box>
      )}

      {/* Bottom editorial text */}
      <Flex
        position="absolute" bottom={0} left={0} right={0} zIndex={2}
        direction="column" p="24px" pt="72px"
        bg="linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)"
      >
        {/* Decorative quote mark */}
        <Text
          fontSize="52px" lineHeight="0.6" color={`${accent}88`}
          fontFamily="Georgia, 'Times New Roman', serif" mb="8px"
        >
          {"\u201C"}
        </Text>

        <Text
          fontSize="20px" fontWeight="700" color="white"
          lineHeight="1.2" fontStyle="italic" mb="8px"
          overflow="hidden"
          style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
        >
          {vd.headline || "Untitled"}
        </Text>

        {vd.body_text && (
          <Text
            fontSize="12px" fontWeight="400" color="rgba(255,255,255,0.65)"
            lineHeight="1.5"
            overflow="hidden"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {vd.body_text}
          </Text>
        )}
      </Flex>

      {/* Brand name — bottom right */}
      {vd.brand_name && (
        <Text
          position="absolute" bottom="18px" right="24px" zIndex={3}
          fontSize="9px" fontWeight="600" color="rgba(255,255,255,0.35)"
          letterSpacing="0.12em" textTransform="uppercase"
        >
          {vd.brand_name}
        </Text>
      )}
    </Box>
  );
}

/* ─── Template: ENGAGEMENT — Geometric Bold ──────────────────────────── */

function EngagementTemplate({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <Box position="relative" w="100%" h="100%" bg={primary} overflow="hidden">
      {/* Geometric crosshatch pattern */}
      <Box
        position="absolute" inset={0} opacity={0.1} pointerEvents="none"
        backgroundImage={`repeating-linear-gradient(45deg, ${accent} 0px, ${accent} 1.5px, transparent 1.5px, transparent 22px), repeating-linear-gradient(-45deg, ${accent} 0px, ${accent} 1.5px, transparent 1.5px, transparent 22px)`}
      />

      {/* Subtle image texture */}
      {imageUrl && (
        <Image
          src={imageUrl} alt=""
          position="absolute" inset={0} w="100%" h="100%"
          objectFit="cover" opacity={0.08}
        />
      )}

      {/* Content — fully centered */}
      <Flex
        position="relative" zIndex={2}
        direction="column" align="center" justify="center"
        h="100%" p="32px" textAlign="center"
      >
        {/* Accent dot */}
        <Box w="8px" h="8px" borderRadius="full" bg={accent} mb="20px" />

        <Text
          fontSize="26px" fontWeight="900" color="white"
          lineHeight="1.1" mb="14px"
          textShadow="0 2px 16px rgba(0,0,0,0.15)"
          overflow="hidden"
          style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
        >
          {vd.headline || "Untitled"}
        </Text>

        {vd.subheadline && (
          <Text
            fontSize="13px" fontWeight="500" color="rgba(255,255,255,0.7)"
            lineHeight="1.45" maxW="88%"
            overflow="hidden"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {vd.subheadline}
          </Text>
        )}

        {/* Accent line separator */}
        <Box w="40px" h="3px" bg={accent} borderRadius="2px" mt="20px" />
      </Flex>

      {/* Tagline — bottom center */}
      {vd.tagline && (
        <Text
          position="absolute" bottom="18px" left="24px" right="24px" zIndex={3}
          textAlign="center" fontSize="10px" fontWeight="600"
          color="rgba(255,255,255,0.4)"
          textTransform="uppercase" letterSpacing="0.12em"
        >
          {vd.tagline}
        </Text>
      )}
    </Box>
  );
}

/* ─── Asset Card — Dispatcher ────────────────────────────────────────── */

function AssetCard({ asset }: { asset: CampaignAsset }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const vd = asset.variation_data as Record<string, string>;
  const primary = vd.primary_color || "#4F46E5";
  const secondary = vd.secondary_color || "#1E1B4B";
  const accent = vd.accent_color || "#7C3AED";
  const templateProps: TemplateProps = { vd, imageUrl: asset.image_url, primary, secondary, accent };

  return (
    <Box
      borderRadius="18px" overflow="hidden" bg="white"
      border="1px solid" borderColor="#ECECEC"
      transition="all 0.3s ease"
      _hover={{ boxShadow: "0 16px 48px rgba(0,0,0,0.1)", transform: "translateY(-3px)" }}
      style={{ animation: "fadeInUp 0.4s ease-out" }}
    >
      {/* Creative area — 4:5 Instagram ratio */}
      <Box position="relative" overflow="hidden" style={{ aspectRatio: "4/5" }}>
        {/* Template content */}
        {(() => {
          switch (asset.ad_type) {
            case "sale": return <SaleTemplate {...templateProps} />;
            case "launch": return <LaunchTemplate {...templateProps} />;
            case "story_narrative": return <StoryNarrativeTemplate {...templateProps} />;
            case "engagement": return <EngagementTemplate {...templateProps} />;
            default: return <AwarenessTemplate {...templateProps} />;
          }
        })()}

        {/* Badge row + Download — shared across all */}
        <Flex
          position="absolute" top={3} left={3} right={3}
          justify="space-between" align="center" zIndex={10}
        >
          <Badge
            bg="rgba(0,0,0,0.45)" color="white" backdropFilter="blur(4px)"
            borderRadius="8px" px={2.5} py={1} fontSize="10px" fontWeight="600"
            textTransform="capitalize"
          >
            {asset.ad_type?.replace("_", " ")}
          </Badge>
          {asset.image_url && (
            <Button
              size="xs" bg="rgba(255,255,255,0.15)" color="white" borderRadius="8px"
              backdropFilter="blur(4px)"
              _hover={{ bg: "rgba(255,255,255,0.3)" }}
              h="28px" w="28px" p={0} minW="28px"
              onClick={async (e) => {
                e.stopPropagation();
                if (!asset.image_url) return;
                try {
                  const res = await fetch(asset.image_url);
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${asset.variation_id || "ad"}.webp`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                } catch {
                  window.open(asset.image_url, "_blank");
                }
              }}
            >
              <Download size={13} />
            </Button>
          )}
        </Flex>

        {/* Processing overlay when no image */}
        {!asset.image_url && (
          <Flex position="absolute" inset={0} align="center" justify="center" zIndex={5}>
            <VStack gap={1}>
              <Loader size={24} color="white" style={{ animation: "spin 1.5s linear infinite" }} />
              <Text fontSize="12px" color="rgba(255,255,255,0.7)">Generating image...</Text>
            </VStack>
          </Flex>
        )}
      </Box>

      {/* Footer: color chips + prompt toggle */}
      <Box p={3.5}>
        <Flex align="center" justify="space-between">
          <Flex gap={1.5}>
            {[primary, secondary, accent].map((c, i) => (
              <Box key={i} w="16px" h="16px" borderRadius="4px" bg={c} border="1px solid" borderColor="#E5E7EB" />
            ))}
          </Flex>
          <Button
            variant="ghost" size="xs"
            fontSize="11px" color="#9CA3AF" h="26px" px={2}
            _hover={{ color: "#6B7280", bg: "#F9FAFB" }}
            onClick={() => setShowPrompt(!showPrompt)}
          >
            {showPrompt ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <Text ml={1}>{showPrompt ? "Hide" : "Prompt"}</Text>
          </Button>
        </Flex>

        {showPrompt && vd.image_prompt && (
          <Box mt={2.5} bg="#F9FAFB" borderRadius="10px" p={3}>
            <Text fontSize="11px" fontWeight="600" color="#9CA3AF" mb={1}>IMAGE PROMPT</Text>
            <Text fontSize="12px" color="#6B7280" lineHeight="1.4">{vd.image_prompt}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export default function AssetsTab({ trackers, statuses, assets, progress, isPolling }: AssetsTabProps) {
  const allAssets = trackers.flatMap((t) => assets[t.campaignId] || []);
  const totalJobs = Object.values(statuses).reduce((sum, s) => sum + s.total, 0);
  const pendingCount = totalJobs - allAssets.length;

  if (trackers.length === 0) {
    return (
      <Flex
        direction="column" align="center" justify="center"
        bg="white" border="1px solid" borderColor="#ECECEC" borderRadius="24px"
        p={{ base: 8, md: 16 }} textAlign="center" minH="400px"
      >
        <Flex
          w="64px" h="64px" borderRadius="16px" bg="#F3F4F6"
          align="center" justify="center" mb={4}
        >
          <ImageIcon size={28} color="#D1D5DB" />
        </Flex>
        <Text fontSize="xl" fontWeight="700" color="#111" mb={2}>
          No Assets Yet
        </Text>
        <Text fontSize="15px" color="#6B7280" maxW="400px">
          Go to the Content tab, select your contexts and templates, then hit Generate. Your ads will be created in the background — feel free to grab a coffee while you wait.
        </Text>
      </Flex>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <Flex align="center" justify="space-between">
        <Box>
          <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="700" color="#111" lineHeight="1.05" mb={1}>
            Assets
          </Text>
          <Text fontSize="15px" color="#6B7280">
            Your generated ad creatives appear here in real-time.
          </Text>
        </Box>
        {allAssets.length > 0 && (
          <Badge bg="#EEF2FF" color="#4338CA" px={3} py={2} borderRadius="999px" fontSize="14px">
            {allAssets.length} {allAssets.length === 1 ? "asset" : "assets"}
          </Badge>
        )}
      </Flex>

      <ProgressHeader
        progress={progress}
        isPolling={isPolling}
        totalAssets={allAssets.length}
        totalJobs={totalJobs}
      />

      <Box
        display="grid"
        gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }}
        gap={5}
      >
        {allAssets.map((asset) => (
          <AssetCard key={asset.variation_id} asset={asset} />
        ))}

        {isPolling && Array.from({ length: Math.min(pendingCount, 8) }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))}
      </Box>

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
    </VStack>
  );
}
