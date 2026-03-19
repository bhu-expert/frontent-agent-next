/**
 * Layout Templates — 10 universal ad layouts
 * All support format prop (feed_4_5, feed, stories) and scale purely via percentage dimensions.
 */

import { Box, Flex, Image, Text } from "@chakra-ui/react";
import type { TemplateProps } from "../base";
import { TemplateWrapper } from "../base";

/* ─── Shared helpers ────────────────────────────────────────────────────────── */

/** Render image or gradient fallback filling its container */
function ImgZone({
  src,
  primary,
  secondary,
  objectPosition = "center",
}: {
  src: string | null;
  primary: string;
  secondary: string;
  objectPosition?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        position="absolute"
        inset={0}
        w="100%"
        h="100%"
        objectFit="cover"
        style={{ objectPosition }}
      />
    );
  }
  return (
    <Box
      position="absolute"
      inset={0}
      bg={`linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`}
    />
  );
}

/** Logo placed top-right, clipped to max 180px, zIndex 100 */
function Logo({ brandName, color = "white" }: { brandName?: string; color?: string }) {
  if (!brandName) return null;
  return (
    <Text
      position="absolute"
      top="3%"
      right="4%"
      zIndex={100}
      fontSize="clamp(11px, 3.5%, 20px)"
      fontWeight="800"
      color={color}
      letterSpacing="0.12em"
      textTransform="uppercase"
      maxW="180px"
      overflow="hidden"
      whiteSpace="nowrap"
      style={{ textOverflow: "ellipsis" }}
    >
      {brandName}
    </Text>
  );
}

/** Single line of text, truncated */
function T({
  children,
  size = "3.2%",
  weight = "600",
  color = "white",
  align = "left",
  lines = 2,
  letterSpacing,
  mb,
}: {
  children?: React.ReactNode;
  size?: string;
  weight?: string;
  color?: string;
  align?: "left" | "center" | "right";
  lines?: number;
  letterSpacing?: string;
  mb?: string;
}) {
  if (!children) return null;
  return (
    <Text
      fontSize={`clamp(9px, ${size}, 28px)`}
      fontWeight={weight}
      color={color}
      textAlign={align}
      letterSpacing={letterSpacing}
      lineHeight="1.2"
      overflow="hidden"
      mb={mb}
      style={{
        display: "-webkit-box",
        WebkitLineClamp: lines,
        WebkitBoxOrient: "vertical",
      }}
    >
      {children}
    </Text>
  );
}

/* ─── Layout 1: ProcessStack ────────────────────────────────────────────────── */

/**
 * ProcessStack
 * Three image columns (~33% each) occupying ~74% of the card height,
 * with a full-width text footer at the bottom ~26%.
 */
export function ProcessStack({ vd, imageUrl, primary, secondary, accent, format }: TemplateProps) {
  const imageH = format === "stories" ? "70%" : "74%";
  const footerH = format === "stories" ? "30%" : "26%";
  const positions: Array<"top" | "center" | "bottom"> = ["top", "center", "bottom"];

  return (
    <TemplateWrapper format={format}>
      {/* Three image columns */}
      <Box position="absolute" top={0} left={0} right={0} h={imageH} display="flex" gap={0}>
        {positions.map((pos, i) => (
          <Box key={i} position="relative" flex="1" overflow="hidden">
            <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition={pos} />
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h={footerH}
        bg={secondary}
        direction="column"
        justify="center"
        px="5%"
        gap="1.5%"
      >
        {vd.tagline && (
          <T size="3.2%" weight="700" color={accent} letterSpacing="0.08em">
            {vd.tagline}
          </T>
        )}
        <T size="4.8%" weight="800" color="white" lines={2}>
          {vd.headline || "Your Headline"}
        </T>
        {vd.cta_text && (
          <T size="2.2%" weight="600" color="rgba(255,255,255,0.75)">
            {vd.cta_text}
          </T>
        )}
      </Flex>

      {/* Logo overlaid on image area */}
      <Logo brandName={vd.brand_name} />
    </TemplateWrapper>
  );
}

/* ─── Layout 2: TitleSandwich ───────────────────────────────────────────────── */

/**
 * TitleSandwich
 * Header bar (primary, tagline + logo) → hero image → footer CTA bar (secondary).
 */
export function TitleSandwich({ vd, imageUrl, primary, secondary, accent, format }: TemplateProps) {
  const headerH = format === "stories" ? "18%" : "22%";
  const footerH = format === "stories" ? "18%" : "22%";
  // image fills the middle
  const imageTop = headerH;

  return (
    <TemplateWrapper format={format}>
      {/* Header */}
      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        h={headerH}
        bg={primary}
        align="center"
        px="5%"
        zIndex={2}
        gap="3%"
      >
        <T size="2.8%" weight="700" color="white" lines={1} letterSpacing="0.04em">
          {vd.tagline || vd.headline}
        </T>
      </Flex>

      {/* Logo sits in header */}
      <Text
        position="absolute"
        top="0"
        right="4%"
        h={headerH}
        zIndex={10}
        display="flex"
        alignItems="center"
        fontSize="clamp(9px, 2.2%, 13px)"
        fontWeight="700"
        color="white"
        letterSpacing="0.1em"
        textTransform="uppercase"
        maxW="180px"
        overflow="hidden"
        whiteSpace="nowrap"
        style={{ textOverflow: "ellipsis" }}
      >
        {vd.brand_name}
      </Text>

      {/* Hero image */}
      <Box
        position="absolute"
        top={imageTop}
        bottom={footerH}
        left={0}
        right={0}
        overflow="hidden"
      >
        <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition="center" />
      </Box>

      {/* Footer */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h={footerH}
        bg={secondary}
        align="center"
        justify="space-between"
        px="5%"
        zIndex={2}
      >
        <T size="4%" weight="800" color="white" lines={1}>
          {vd.cta_text || "Shop Now"}
        </T>
        {vd.subheadline && (
          <T size="2.2%" weight="500" color="rgba(255,255,255,0.7)" align="right" lines={1}>
            {vd.subheadline}
          </T>
        )}
      </Flex>
    </TemplateWrapper>
  );
}

/* ─── Layout 3: GridDuo ─────────────────────────────────────────────────────── */

/**
 * GridDuo
 * 2×2 grid: image | headline text / body text | image.
 * Logo overlaid on top-right quadrant.
 */
export function GridDuo({ vd, imageUrl, primary, secondary, accent, format }: TemplateProps) {
  return (
    <TemplateWrapper format={format}>
      {/* Top-left: image */}
      <Box position="absolute" top={0} left={0} w="50%" h="50%" overflow="hidden">
        <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition="top" />
      </Box>

      {/* Top-right: headline on primary */}
      <Flex
        position="absolute"
        top={0}
        right={0}
        w="50%"
        h="50%"
        bg={primary}
        direction="column"
        justify="center"
        px="6%"
        py="5%"
      >
        {vd.tagline && (
          <T size="2.2%" weight="700" color={accent} letterSpacing="0.08em" mb="4%">
            {vd.tagline}
          </T>
        )}
        <T size="3.8%" weight="800" color="white" lines={3}>
          {vd.headline || "Headline"}
        </T>
      </Flex>

      {/* Bottom-left: body on secondary */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        w="50%"
        h="50%"
        bg={secondary}
        direction="column"
        justify="center"
        px="6%"
        py="5%"
      >
        <T size="2.6%" weight="500" color="rgba(255,255,255,0.9)" lines={4}>
          {vd.body_text || vd.subheadline || "Supporting copy goes here."}
        </T>
        {vd.cta_text && (
          <Box
            mt="6%"
            display="inline-block"
            bg={accent}
            px="8%"
            py="4%"
            borderRadius="4px"
            alignSelf="flex-start"
          >
            <T size="2.2%" weight="700" color="white" lines={1}>
              {vd.cta_text}
            </T>
          </Box>
        )}
      </Flex>

      {/* Bottom-right: image (different crop) */}
      <Box position="absolute" bottom={0} right={0} w="50%" h="50%" overflow="hidden">
        <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition="bottom" />
      </Box>

      {/* Logo on top-right quadrant */}
      <Logo brandName={vd.brand_name} />
    </TemplateWrapper>
  );
}

/* ─── Layout 4: LFrameNarrative ─────────────────────────────────────────────── */

/**
 * LFrameNarrative
 * Right 67% = main image; left 33% split into 3 stacked color zones.
 */
export function LFrameNarrative({ vd, imageUrl, primary, secondary, accent, format }: TemplateProps) {
  const zone1H = format === "stories" ? "33%" : "37%";
  const zone2H = format === "stories" ? "33%" : "37%";
  const zone3H = format === "stories" ? "34%" : "26%";

  return (
    <TemplateWrapper format={format}>
      {/* Right: main image (67% wide) */}
      <Box position="absolute" top={0} bottom={0} right={0} w="67%" overflow="hidden">
        <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition="center" />
      </Box>

      {/* Left column: 33% wide */}
      <Box position="absolute" top={0} bottom={0} left={0} w="33%" display="flex" flexDirection="column">
        {/* Zone 1: tagline, primary bg */}
        <Flex
          flex="none"
          h={zone1H}
          bg={primary}
          direction="column"
          justify="center"
          px="8%"
          py="4%"
        >
          {vd.tagline && (
            <T size="2.6%" weight="700" color={accent} letterSpacing="0.06em" mb="6%">
              {vd.tagline}
            </T>
          )}
          <T size="3%" weight="700" color="white" lines={3}>
            {vd.subheadline || vd.headline}
          </T>
        </Flex>

        {/* Zone 2: headline, secondary bg */}
        <Flex
          flex="none"
          h={zone2H}
          bg={secondary}
          direction="column"
          justify="center"
          px="8%"
          py="4%"
        >
          <T size="3.8%" weight="900" color="white" lines={4} letterSpacing="-0.01em">
            {vd.headline || "Your Headline Here"}
          </T>
        </Flex>

        {/* Zone 3: CTA, accent bg */}
        <Flex
          flex="none"
          h={zone3H}
          bg={accent}
          direction="column"
          justify="center"
          px="8%"
          py="4%"
        >
          <T size="3%" weight="800" color="white" lines={2}>
            {vd.cta_text || "Discover More"}
          </T>
          {vd.brand_name && (
            <T size="2%" weight="600" color="rgba(255,255,255,0.7)" lines={1} letterSpacing="0.08em">
              {vd.brand_name}
            </T>
          )}
        </Flex>
      </Box>

      {/* Logo top-right of image zone */}
      <Logo brandName={vd.brand_name} />
    </TemplateWrapper>
  );
}

/* ─── Layout 5: DataTableau ─────────────────────────────────────────────────── */

/**
 * DataTableau
 * Circular image at top-center (~44% wide), 2×2 stat grid fills the bottom ~55%.
 */
export function DataTableau({ vd, imageUrl, primary, secondary, accent, format }: TemplateProps) {
  const circleTop = "3%";
  const gridTop = format === "stories" ? "40%" : "44%";
  const statLabels = [
    vd.tagline || "Tagline",
    vd.headline || "Headline",
    vd.subheadline || "Subheadline",
    vd.cta_text || "CTA",
  ];
  const bgs = [primary, secondary, secondary, primary];

  return (
    <TemplateWrapper format={format} bg={`${secondary}22`}>
      {/* Background gradient */}
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(160deg, ${primary}18 0%, ${secondary}28 100%)`}
      />

      {/* Circular image */}
      <Box
        position="absolute"
        top={circleTop}
        left="50%"
        transform="translateX(-50%)"
        w="44%"
        style={{ aspectRatio: "1/1" }}
        borderRadius="full"
        overflow="hidden"
        border={`3px solid ${accent}`}
        zIndex={2}
      >
        <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition="top" />
      </Box>

      {/* 2×2 grid */}
      <Box
        position="absolute"
        top={gridTop}
        left={0}
        right={0}
        bottom={0}
        display="grid"
        style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}
      >
        {statLabels.map((label, i) => (
          <Flex
            key={i}
            bg={bgs[i]}
            direction="column"
            justify="center"
            align="center"
            px="6%"
            py="4%"
            borderRight={i % 2 === 0 ? `1px solid rgba(255,255,255,0.15)` : undefined}
            borderBottom={i < 2 ? `1px solid rgba(255,255,255,0.15)` : undefined}
          >
            <T size="2.8%" weight="700" color="white" align="center" lines={3}>
              {label}
            </T>
          </Flex>
        ))}
      </Box>

      {/* Logo */}
      <Logo brandName={vd.brand_name} />
    </TemplateWrapper>
  );
}

/* ─── Layout 6: CinematicLetterbox ──────────────────────────────────────────── */

/**
 * CinematicLetterbox
 * Thin secondary bar (tagline) → wide image → thin primary bar (CTA).
 */
export function CinematicLetterbox({ vd, imageUrl, primary, secondary, accent, format }: TemplateProps) {
  const barH = format === "stories" ? "11%" : "13%";

  return (
    <TemplateWrapper format={format}>
      {/* Top bar */}
      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        h={barH}
        bg={secondary}
        align="center"
        justify="center"
        px="5%"
        zIndex={2}
      >
        <T size="2.6%" weight="700" color="white" align="center" letterSpacing="0.06em" lines={1}>
          {vd.tagline || vd.brand_name}
        </T>
        {/* Logo right-aligned inside bar */}
        {vd.brand_name && (
          <Text
            position="absolute"
            right="4%"
            fontSize="clamp(8px, 2%, 12px)"
            fontWeight="700"
            color="rgba(255,255,255,0.6)"
            letterSpacing="0.1em"
            textTransform="uppercase"
          >
            {vd.brand_name}
          </Text>
        )}
      </Flex>

      {/* Full bleed image */}
      <Box
        position="absolute"
        top={barH}
        bottom={barH}
        left={0}
        right={0}
        overflow="hidden"
      >
        <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition="center" />
        {/* Subtle dark overlay for mood */}
        <Box position="absolute" inset={0} bg="rgba(0,0,0,0.15)" />
      </Box>

      {/* Bottom bar */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h={barH}
        bg={primary}
        align="center"
        justify="center"
        px="5%"
        zIndex={2}
      >
        <T size="3%" weight="800" color="white" align="center" lines={1}>
          {vd.cta_text || vd.headline || "Shop Now"}
        </T>
      </Flex>
    </TemplateWrapper>
  );
}

/* ─── Layout 7: DiagonalSplit ────────────────────────────────────────────────── */

/**
 * DiagonalSplit
 * Top image (50%) + bottom image with color overlay (50%).
 * Floating headline box centered across the split line.
 */
export function DiagonalSplit({ vd, imageUrl, primary, secondary, accent, format }: TemplateProps) {
  return (
    <TemplateWrapper format={format}>
      {/* Top image half */}
      <Box position="absolute" top={0} left={0} right={0} h="50%" overflow="hidden">
        <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition="top" />
      </Box>

      {/* Bottom image half with color overlay */}
      <Box position="absolute" bottom={0} left={0} right={0} h="50%" overflow="hidden">
        <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition="bottom" />
        <Box position="absolute" inset={0} bg={secondary} opacity={0.6} />
      </Box>

      {/* Floating headline box */}
      <Flex
        position="absolute"
        top="50%"
        left="13%"
        right="13%"
        transform="translateY(-50%)"
        bg={primary}
        px="6%"
        py="4%"
        zIndex={5}
        direction="column"
        align="center"
        borderRadius="4px"
        boxShadow="0 8px 32px rgba(0,0,0,0.25)"
      >
        {vd.tagline && (
          <T size="2%" weight="700" color={accent} align="center" letterSpacing="0.1em" mb="3%">
            {vd.tagline}
          </T>
        )}
        <T size="4%" weight="900" color="white" align="center" lines={3}>
          {vd.headline || "Your Headline"}
        </T>
      </Flex>

      {/* CTA at bottom */}
      {vd.cta_text && (
        <Flex
          position="absolute"
          bottom="4%"
          left={0}
          right={0}
          justify="center"
          zIndex={6}
        >
          <T size="2.4%" weight="700" color="white" align="center" lines={1}>
            {vd.cta_text}
          </T>
        </Flex>
      )}

      {/* Logo top-right of top image */}
      <Logo brandName={vd.brand_name} />
    </TemplateWrapper>
  );
}

/* ─── Layout 8: SidebarSocial ────────────────────────────────────────────────── */

/**
 * SidebarSocial
 * Left image (63%) + right column with 3 stacked zones.
 */
export function SidebarSocial({ vd, imageUrl, primary, secondary, accent, format }: TemplateProps) {
  const zone1H = format === "stories" ? "52%" : "56%";
  const zone2H = format === "stories" ? "28%" : "26%";
  const zone3H = format === "stories" ? "20%" : "18%";

  return (
    <TemplateWrapper format={format}>
      {/* Left image */}
      <Box position="absolute" top={0} bottom={0} left={0} w="63%" overflow="hidden">
        <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition="center" />
      </Box>

      {/* Right column */}
      <Box
        position="absolute"
        top={0}
        bottom={0}
        right={0}
        w="37%"
        display="flex"
        flexDirection="column"
      >
        {/* Zone 1: Headline */}
        <Flex
          flex="none"
          h={zone1H}
          bg={primary}
          direction="column"
          justify="center"
          px="8%"
          py="5%"
          position="relative"
        >
          {vd.tagline && (
            <T size="2.2%" weight="700" color={accent} letterSpacing="0.08em" mb="5%">
              {vd.tagline}
            </T>
          )}
          <T size="4%" weight="900" color="white" lines={4} letterSpacing="-0.01em">
            {vd.headline || "Headline"}
          </T>
          {/* Logo inside this zone */}
          <Text
            position="absolute"
            top="5%"
            right="6%"
            fontSize="clamp(8px, 2%, 11px)"
            fontWeight="700"
            color="rgba(255,255,255,0.55)"
            letterSpacing="0.1em"
            textTransform="uppercase"
            maxW="90%"
            overflow="hidden"
            whiteSpace="nowrap"
            style={{ textOverflow: "ellipsis" }}
          >
            {vd.brand_name}
          </Text>
        </Flex>

        {/* Zone 2: Subtext */}
        <Flex
          flex="none"
          h={zone2H}
          bg={secondary}
          direction="column"
          justify="center"
          px="8%"
          py="5%"
        >
          <T size="2.8%" weight="500" color="rgba(255,255,255,0.9)" lines={3}>
            {vd.subheadline || vd.body_text || "Supporting text here."}
          </T>
        </Flex>

        {/* Zone 3: CTA */}
        <Flex
          flex="none"
          h={zone3H}
          bg={accent}
          align="center"
          px="8%"
          py="3%"
        >
          <T size="3%" weight="800" color="white" lines={1}>
            {vd.cta_text || "Learn More"}
          </T>
        </Flex>
      </Box>
    </TemplateWrapper>
  );
}

/* ─── Layout 9: MinimalistFrame ──────────────────────────────────────────────── */

/**
 * MinimalistFrame
 * White bg, inset image with accent border frame, CTA bar at bottom.
 */
export function MinimalistFrame({ vd, imageUrl, primary, secondary, accent, format }: TemplateProps) {
  return (
    <TemplateWrapper format={format} bg="white">
      {/* Badge text top-left */}
      {vd.tagline && (
        <Text
          position="absolute"
          top="3%"
          left="5%"
          zIndex={5}
          fontSize="clamp(8px, 2%, 11px)"
          fontWeight="700"
          color={secondary}
          letterSpacing="0.1em"
          textTransform="uppercase"
        >
          {vd.tagline}
        </Text>
      )}

      {/* Logo top-right */}
      <Logo brandName={vd.brand_name} color={secondary} />

      {/* Accent border framing inset area */}
      <Box
        position="absolute"
        top="7.4%"
        left="7.4%"
        right="7.4%"
        bottom="12%"
        border={`2px solid ${accent}`}
        borderRadius="4px"
        zIndex={1}
        pointerEvents="none"
      />

      {/* Inset image */}
      <Box
        position="absolute"
        top="7.4%"
        left="7.4%"
        right="7.4%"
        bottom="12%"
        overflow="hidden"
        borderRadius="3px"
      >
        <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition="center" />
      </Box>

      {/* CTA bar */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="12%"
        bg={primary}
        align="center"
        justify="space-between"
        px="5%"
        zIndex={3}
      >
        <T size="3.2%" weight="800" color="white" lines={1}>
          {vd.headline || vd.cta_text || "Discover More"}
        </T>
        {vd.cta_text && vd.headline && (
          <T size="2.4%" weight="600" color="rgba(255,255,255,0.75)" align="right" lines={1}>
            {vd.cta_text}
          </T>
        )}
      </Flex>
    </TemplateWrapper>
  );
}

/* ─── Layout 10: SplitQuote ──────────────────────────────────────────────────── */

/**
 * SplitQuote
 * Left portrait (44%) + right column: quote-mark decoration, quote text, attribution.
 */
export function SplitQuote({ vd, imageUrl, primary, secondary, accent, format }: TemplateProps) {
  const quoteMarkH = format === "stories" ? "17%" : "19%";
  const quoteTextH = format === "stories" ? "55%" : "55%";
  const attributionH = format === "stories" ? "28%" : "26%";

  return (
    <TemplateWrapper format={format}>
      {/* Left portrait */}
      <Box position="absolute" top={0} bottom={0} left={0} w="44%" overflow="hidden">
        <ImgZone src={imageUrl} primary={primary} secondary={secondary} objectPosition="center" />
      </Box>

      {/* Right column */}
      <Box
        position="absolute"
        top={0}
        bottom={0}
        right={0}
        w="56%"
        display="flex"
        flexDirection="column"
      >
        {/* Zone 1: Large quote mark decoration */}
        <Flex
          flex="none"
          h={quoteMarkH}
          bg={primary}
          align="center"
          px="8%"
          position="relative"
        >
          <Text
            fontSize="clamp(28px, 9%, 56px)"
            fontWeight="900"
            color={accent}
            lineHeight="1"
            userSelect="none"
          >
            "
          </Text>
          {/* Logo in this zone */}
          <Text
            position="absolute"
            right="6%"
            bottom="12%"
            fontSize="clamp(8px, 2%, 11px)"
            fontWeight="700"
            color="rgba(255,255,255,0.55)"
            letterSpacing="0.1em"
            textTransform="uppercase"
            maxW="140px"
            overflow="hidden"
            whiteSpace="nowrap"
            style={{ textOverflow: "ellipsis" }}
          >
            {vd.brand_name}
          </Text>
        </Flex>

        {/* Zone 2: Quote text */}
        <Flex
          flex="none"
          h={quoteTextH}
          bg={secondary}
          direction="column"
          justify="center"
          px="8%"
          py="5%"
        >
          <T size="3.6%" weight="700" color="white" lines={5} letterSpacing="-0.01em">
            {vd.headline || "Your headline or quote text goes here."}
          </T>
          {vd.subheadline && (
            <Box mt="6%">
              <T size="2.4%" weight="400" color="rgba(255,255,255,0.75)" lines={3}>
                {vd.subheadline}
              </T>
            </Box>
          )}
        </Flex>

        {/* Zone 3: Attribution / CTA */}
        <Flex
          flex="none"
          h={attributionH}
          bg={accent}
          direction="column"
          justify="center"
          px="8%"
          py="4%"
        >
          <T size="3%" weight="800" color="white" lines={1}>
            {vd.cta_text || "Shop Now"}
          </T>
          {vd.brand_name && (
            <Box mt="3%">
              <T size="2%" weight="600" color="rgba(255,255,255,0.7)" lines={1} letterSpacing="0.08em">
                {vd.brand_name}
              </T>
            </Box>
          )}
        </Flex>
      </Box>
    </TemplateWrapper>
  );
}
