/**
 * Base types and utilities for ad templates
 * Supports multiple aspect ratios: 4:5 (feed), 1:1 (square), 9:16 (stories)
 */

import { Box, Flex, Text, Image, type BoxProps } from "@chakra-ui/react";

/* ─── Types ──────────────────────────────────────────────────────────── */

export type ImageFormat = "feed_4_5" | "feed" | "stories";

export interface TemplateProps {
  vd: Record<string, string>;
  imageUrl: string | null;
  primary: string;
  secondary: string;
  accent: string;
  format?: ImageFormat;
}

export interface BaseTemplateWrapperProps extends BoxProps {
  children: React.ReactNode;
  format?: ImageFormat;
}

/* ─── Constants ──────────────────────────────────────────────────────── */

/** Instagram optimal post size: 1080x1350 (4:5 ratio) */
export const INSTAGRAM_ASPECT_RATIO = "4/5";

/** Safe zone padding - keep critical content within this area */
export const SAFE_ZONE_PADDING = "24px";

/** Character limits for Instagram readability */
export const MAX_CHARS = {
  headline: 40,
  subheadline: 80,
  body: 120,
  tagline: 30,
  cta: 20,
};

/** Aspect ratio values per format */
export const ASPECT_RATIO_MAP: Record<ImageFormat, string> = {
  feed_4_5: "4/5",
  feed: "1/1",
  stories: "9/16",
};

/* ─── Base Wrapper ───────────────────────────────────────────────────── */

/**
 * Base wrapper for all ad templates.
 * Enforces the aspect ratio determined by the format prop and clips overflow.
 */
export function TemplateWrapper({ children, format, ...props }: BaseTemplateWrapperProps) {
  return (
    <Box
      position="relative"
      w="100%"
      h="100%"
      style={{ aspectRatio: ASPECT_RATIO_MAP[format ?? "feed_4_5"] }}
      overflow="hidden"
      {...props}
    >
      {children}
    </Box>
  );
}

/* ─── Typography Components ──────────────────────────────────────────── */

interface InstagramTextProps {
  children: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  weight?: "400" | "500" | "600" | "700" | "800" | "900";
  color?: string;
  align?: "left" | "center" | "right";
  maxLines?: 1 | 2 | 3;
  textTransform?: "uppercase" | "lowercase" | "none";
  letterSpacing?: string;
  shadow?: string;
  mt?: string;
  mb?: string;
  ml?: string;
  mr?: string;
  px?: string;
  py?: string;
  lineHeight?: string;
  maxW?: string;
  fontStyle?: string;
  fontFamily?: string;
  position?: string;
  inset?: string;
  w?: string;
  h?: string;
  textAlign?: string;
  zIndex?: number;
  opacity?: number;
  transformCss?: string;
  fontWeight?: string;
  fontSize?: string;
  display?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  bg?: string;
  borderRadius?: string;
}

/**
 * Instagram-optimized text component with line clamping
 */
export function InstagramText({
  children,
  size = "md",
  weight = "400",
  color = "white",
  align = "left",
  maxLines,
  textTransform = "none",
  letterSpacing,
  shadow,
  mt,
  mb,
  ml,
  mr,
  px,
  py,
  lineHeight,
  maxW,
  fontStyle,
  fontFamily,
  position,
  inset,
  w,
  h,
  textAlign,
  zIndex,
  opacity,
  transformCss,
  fontWeight,
  fontSize,
  display,
  alignItems,
  justifyContent,
  gap,
  bg,
  borderRadius,
}: InstagramTextProps) {
  const sizeMap = {
    xs: "10px",
    sm: "12px",
    md: "14px",
    lg: "18px",
    xl: "22px",
    "2xl": "28px",
    "3xl": "34px",
    "4xl": "42px",
  };

  return (
    <Text
      fontSize={fontSize || sizeMap[size]}
      fontWeight={fontWeight || weight}
      color={color}
      textAlign={textAlign || align}
      textTransform={textTransform}
      letterSpacing={letterSpacing}
      textShadow={shadow}
      lineHeight={lineHeight || "1.15"}
      marginTop={mt}
      marginBottom={mb}
      marginLeft={ml}
      marginRight={mr}
      maxWidth={maxW}
      fontStyle={fontStyle}
      fontFamily={fontFamily}
      position={position}
      inset={inset}
      width={w}
      height={h}
      zIndex={zIndex}
      opacity={opacity}
      transform={transformCss}
      display={display}
      alignItems={alignItems}
      justifyContent={justifyContent}
      gap={gap}
      bg={bg}
      borderRadius={borderRadius}
      paddingX={px}
      paddingY={py}
      overflow="hidden"
      style={{
        display: maxLines ? "-webkit-box" : display,
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: "vertical",
      }}
    >
      {children}
    </Text>
  );
}

/* ─── Image Components ───────────────────────────────────────────────── */

interface BackgroundImageProps {
  src: string;
  alt?: string;
  opacity?: number;
  objectFit?: "cover" | "contain" | "fill";
}

/**
 * Background image with configurable opacity
 */
export function BackgroundImage({
  src,
  alt = "",
  opacity = 1,
  objectFit = "cover",
}: BackgroundImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      position="absolute"
      inset={0}
      w="100%"
      h="100%"
      objectFit={objectFit}
      opacity={opacity}
    />
  );
}

/* ─── Overlay Components ─────────────────────────────────────────────── */

/**
 * Gradient overlay for text readability
 */
export function GradientOverlay({
  direction = "to top",
  colors,
  position = "absolute",
  ...props
}: {
  direction?: "to top" | "to bottom" | "to left" | "to right";
  colors: string[];
  position?: "absolute" | "relative";
} & BoxProps) {
  return (
    <Box
      position={position}
      inset={0}
      bg={`linear-gradient(${direction}, ${colors.join(", ")})`}
      {...props}
    />
  );
}

/**
 * Vignette overlay for cinematic effect
 */
export function VignetteOverlay({ opacity = 0.5 }: { opacity?: number }) {
  return (
    <Box
      position="absolute"
      inset={0}
      bg="radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)"
      opacity={opacity}
      pointerEvents="none"
    />
  );
}

/* ─── Branding Components ────────────────────────────────────────────── */

interface BrandNameProps {
  brandName: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom-center";
  color?: string;
  opacity?: number;
}

/**
 * Subtle brand name placement
 */
export function BrandName({
  brandName,
  position = "top-left",
  color = "white",
  opacity = 0.6,
}: BrandNameProps) {
  if (!brandName) return null;

  const positionMap = {
    "top-left": { top: "20px", left: "24px" },
    "top-right": { top: "20px", right: "24px" },
    "bottom-left": { bottom: "18px", left: "24px" },
    "bottom-right": { bottom: "18px", right: "24px" },
    "bottom-center": { bottom: "18px", left: "50%", transform: "translateX(-50%)" },
  };

  return (
    <Text
      position="absolute"
      {...positionMap[position]}
      zIndex={10}
      fontSize="10px"
      fontWeight="600"
      color={color}
      opacity={opacity}
      letterSpacing="0.12em"
      textTransform="uppercase"
    >
      {brandName}
    </Text>
  );
}

/* ─── Utility Components ─────────────────────────────────────────────── */

/**
 * Badge component for labels (sale, new, etc.)
 */
export function TemplateBadge({
  children,
  color,
  position = "top-left",
}: {
  children: React.ReactNode;
  color: string;
  position?: "top-left" | "top-right";
}) {
  const positionMap = {
    "top-left": { left: "24px" },
    "top-right": { right: "24px" },
  };

  return (
    <Flex
      position="absolute"
      top="20px"
      {...positionMap[position]}
      zIndex={10}
      align="center"
      justify="center"
      bg={color}
      borderRadius="999px"
      px="16px"
      py="6px"
    >
      <InstagramText size="xs" weight="700" color="white" textTransform="uppercase" letterSpacing="0.1em">
        {children}
      </InstagramText>
    </Flex>
  );
}

/**
 * Decorative accent element (dot, line, etc.)
 */
export function AccentDot({ color, size = "8px" }: { color: string; size?: string }) {
  return (
    <Box
      w={size}
      h={size}
      borderRadius="full"
      bg={color}
    />
  );
}

/**
 * Safe zone container - keeps content within Instagram-safe area
 */
export function SafeZone({
  children,
  padding = SAFE_ZONE_PADDING,
  ...props
}: {
  children: React.ReactNode;
  padding?: string;
} & BoxProps) {
  return (
    <Box p={padding} {...props}>
      {children}
    </Box>
  );
}
