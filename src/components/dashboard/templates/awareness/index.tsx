/**
 * Awareness Template - Variation 1: Editorial Hero
 * Clean, image-first design with bottom text overlay
 * Best for: Brand storytelling, lifestyle content
 */

import { Box, Flex } from "@chakra-ui/react";
import type { TemplateProps } from "../base";
import { BackgroundImage, BrandName, GradientOverlay, InstagramText, TemplateWrapper } from "../base";

export function AwarenessVariation1({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper>
      {/* Background */}
      {imageUrl ? (
        <BackgroundImage src={imageUrl} alt={vd.headline} opacity={0.9} />
      ) : (
        <Box
          position="absolute"
          inset={0}
          bg={`linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`}
        />
      )}

      {/* Gradient overlay for text readability */}
      <GradientOverlay
        direction="to top"
        colors={["rgba(0,0,0,0.8) 0%", "rgba(0,0,0,0.4) 40%", "transparent 100%"]}
      />

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="top-left" />

      {/* Content - bottom aligned */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        direction="column"
        p="24px"
        pt="60px"
        zIndex={2}
      >
        {vd.tagline && (
          <InstagramText
            size="xs"
            weight="700"
            color={accent}
            textTransform="uppercase"
            letterSpacing="0.12em"
            maxLines={1}
            mb="6px"
          >
            {vd.tagline}
          </InstagramText>
        )}
        <InstagramText
          size="xl"
          weight="800"
          color="white"
          maxLines={2}
          shadow="0 2px 8px rgba(0,0,0,0.3)"
        >
          {vd.headline || "Your Headline Here"}
        </InstagramText>
        {vd.subheadline && (
          <InstagramText
            size="xs"
            weight="400"
            color="rgba(255,255,255,0.85)"
            maxLines={2}
            mt="8px"
            lineHeight="1.4"
          >
            {vd.subheadline}
          </InstagramText>
        )}
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Awareness Template - Variation 2: Center Focus
 * Bold centered text with subtle image background
 * Best for: Quote-style posts, announcements
 */

export function AwarenessVariation2({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg={secondary}>
      {/* Background image with blur */}
      {imageUrl && (
        <>
          <BackgroundImage src={imageUrl} alt="" opacity={0.25} />
          <Box position="absolute" inset={0} backdropFilter="blur(8px)" />
        </>
      )}

      {/* Centered content */}
      <Flex
        position="relative"
        direction="column"
        align="center"
        justify="center"
        h="100%"
        p="36px"
        textAlign="center"
        zIndex={2}
      >
        {/* Decorative line */}
        <Box w="40px" h="3px" bg={accent} borderRadius="2px" mb="20px" />

        <InstagramText
          size="2xl"
          weight="800"
          color="white"
          maxLines={3}
          shadow="0 4px 16px rgba(0,0,0,0.4)"
          lineHeight="1.2"
        >
          {vd.headline || "Your Headline Here"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="sm"
            weight="400"
            color="rgba(255,255,255,0.8)"
            maxLines={2}
            mt="12px"
            maxW="85%"
            lineHeight="1.5"
          >
            {vd.subheadline}
          </InstagramText>
        )}

        {/* Decorative line */}
        <Box w="40px" h="3px" bg={accent} borderRadius="2px" mt="20px" />
      </Flex>

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="bottom-center" />
    </TemplateWrapper>
  );
}

/**
 * Awareness Template - Variation 3: Split Layout
 * Image on one side, solid color on the other
 * Best for: Product features, before/after
 */

export function AwarenessVariation3({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper>
      {/* Split layout */}
      <Box position="absolute" inset={0} display="flex">
        {/* Image side - top 60% */}
        <Box position="absolute" top={0} left={0} right={0} h="60%">
          {imageUrl ? (
            <BackgroundImage src={imageUrl} alt="" objectFit="cover" />
          ) : (
            <Box h="100%" bg={`linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`} />
          )}
        </Box>

        {/* Solid color side - bottom 40% */}
        <Box position="absolute" bottom={0} left={0} right={0} h="40%" bg={secondary} />
      </Box>

      {/* Content area */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="40%"
        direction="column"
        justify="center"
        p="24px"
        zIndex={2}
      >
        {vd.tagline && (
          <InstagramText
            size="xs"
            weight="600"
            color={accent}
            textTransform="uppercase"
            letterSpacing="0.1em"
            maxLines={1}
            mb="6px"
          >
            {vd.tagline}
          </InstagramText>
        )}
        <InstagramText
          size="lg"
          weight="800"
          color="white"
          maxLines={2}
          lineHeight="1.2"
        >
          {vd.headline || "Your Headline Here"}
        </InstagramText>
        {vd.subheadline && (
          <InstagramText
            size="xs"
            weight="400"
            color="rgba(255,255,255,0.75)"
            maxLines={2}
            mt="8px"
            lineHeight="1.4"
          >
            {vd.subheadline}
          </InstagramText>
        )}
      </Flex>

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="top-left" color="white" />
    </TemplateWrapper>
  );
}

/**
 * Awareness Template - Variation 4: Minimal Border
 * Clean design with colored border frame
 * Best for: Minimalist brands, elegant content
 */

export function AwarenessVariation4({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg="white">
      {/* Border frame */}
      <Box
        position="absolute"
        inset="16px"
        border="2px solid"
        borderColor={accent}
        borderRadius="12px"
      />

      {/* Inner content area */}
      <Flex
        position="absolute"
        inset="24px"
        direction="column"
        justify="flex-end"
        zIndex={2}
        pb="4px"
      >
        {/* Image area */}
        <Box flex="1" mb="16px" borderRadius="8px" overflow="hidden">
          {imageUrl ? (
            <BackgroundImage src={imageUrl} alt="" objectFit="cover" />
          ) : (
            <Box
              h="100%"
              bg={`linear-gradient(135deg, ${primary}20 0%, ${secondary}20 100%)`}
            />
          )}
        </Box>

        {/* Text content */}
        <Box>
          <InstagramText
            size="lg"
            weight="700"
            color={secondary}
            maxLines={2}
            lineHeight="1.2"
          >
            {vd.headline || "Your Headline Here"}
          </InstagramText>
          {vd.subheadline && (
            <InstagramText
              size="xs"
              weight="400"
              color="gray.600"
              maxLines={2}
              mt="6px"
              lineHeight="1.4"
            >
              {vd.subheadline}
            </InstagramText>
          )}
        </Box>
      </Flex>

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="top-left" color={secondary} />
    </TemplateWrapper>
  );
}

/**
 * Awareness Template - Variation 5: Full Bleed Bold
 * Maximum impact with full image and bold typography
 * Best for: High-impact announcements, hero content
 */

export function AwarenessVariation5({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper>
      {/* Full bleed background */}
      {imageUrl ? (
        <BackgroundImage src={imageUrl} alt={vd.headline} opacity={0.85} />
      ) : (
        <Box
          position="absolute"
          inset={0}
          bg={`linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`}
        />
      )}

      {/* Dark overlay */}
      <Box position="absolute" inset={0} bg="rgba(0,0,0,0.45)" />

      {/* Centered bold content */}
      <Flex
        position="relative"
        direction="column"
        align="center"
        justify="center"
        h="100%"
        p="32px"
        textAlign="center"
        zIndex={2}
      >
        <InstagramText
          size="3xl"
          weight="900"
          color="white"
          maxLines={3}
          shadow="0 4px 24px rgba(0,0,0,0.5)"
          letterSpacing="-0.01em"
          lineHeight="1.15"
        >
          {vd.headline || "Your Headline Here"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="sm"
            weight="500"
            color="rgba(255,255,255,0.9)"
            maxLines={2}
            mt="14px"
            maxW="90%"
            lineHeight="1.5"
          >
            {vd.subheadline}
          </InstagramText>
        )}

        {/* Accent underline */}
        <Box w="56px" h="4px" bg={accent} borderRadius="2px" mt="18px" />
      </Flex>

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="bottom-right" />
    </TemplateWrapper>
  );
}
