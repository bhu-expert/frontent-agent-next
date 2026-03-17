/**
 * Story Narrative Template - Variation 1: Cinematic Quote
 * Dramatic quote-style layout with vignette
 * Best for: Storytelling, testimonials, quotes
 */

import { Box, Flex } from "@chakra-ui/react";
import type { TemplateProps } from "../base";
import { BackgroundImage, BrandName, GradientOverlay, InstagramText, TemplateWrapper, VignetteOverlay } from "../base";

export function StoryNarrativeVariation1({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper>
      {/* Cinematic full bleed image */}
      {imageUrl ? (
        <BackgroundImage src={imageUrl} alt="" opacity={0.85} />
      ) : (
        <Box
          position="absolute"
          inset={0}
          bg={`linear-gradient(135deg, ${secondary} 0%, ${primary} 100%)`}
        />
      )}

      {/* Dark vignette */}
      <VignetteOverlay opacity={0.6} />

      {/* Story theme pill */}
      {vd.story_theme && (
        <Box
          position="absolute"
          top="20px"
          left="24px"
          zIndex={3}
          bg="rgba(255,255,255,0.12)"
          backdropFilter="blur(8px)"
          borderRadius="999px"
          px="14px"
          py="5px"
        >
          <InstagramText
            size="xs"
            weight="700"
            color="rgba(255,255,255,0.85)"
            textTransform="uppercase"
            letterSpacing="0.12em"
          >
            {vd.story_theme}
          </InstagramText>
        </Box>
      )}

      {/* Bottom editorial text */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        zIndex={2}
        direction="column"
        p="28px"
        pt="80px"
      >
        {/* Decorative quote mark */}
        <InstagramText
          size="4xl"
          weight="900"
          color={`${accent}AA`}
          fontFamily="Georgia, 'Times New Roman', serif"
          lineHeight="0.5"
          mb="8px"
        >
          {"\u201C"}
        </InstagramText>

        <InstagramText
          size="xl"
          weight="700"
          color="white"
          maxLines={3}
          fontStyle="italic"
          shadow="0 2px 12px rgba(0,0,0,0.4)"
        >
          {vd.headline || "Your story headline here"}
        </InstagramText>

        {vd.body_text && (
          <InstagramText
            size="sm"
            weight="400"
            color="rgba(255,255,255,0.7)"
            maxLines={2}
            mt="10px"
            lineHeight="1.5"
          >
            {vd.body_text}
          </InstagramText>
        )}
      </Flex>

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="bottom-right" />
    </TemplateWrapper>
  );
}

/**
 * Story Narrative Template - Variation 2: Chapter Style
 * Book chapter inspired design
 * Best for: Series content, episodic stories
 */

export function StoryNarrativeVariation2({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg={secondary}>
      {/* Top image band */}
      <Box position="absolute" top={0} left={0} right={0} h="35%">
        {imageUrl ? (
          <BackgroundImage src={imageUrl} alt="" objectFit="cover" />
        ) : (
          <Box h="100%" bg={`linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`} />
        )}
      </Box>

      {/* Content area */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        top="35%"
        direction="column"
        p="32px"
        zIndex={2}
      >
        {/* Chapter indicator */}
        <Flex align="center" gap="12px" mb="16px">
          <Box w="40px" h="2px" bg={accent} />
          <InstagramText
            size="xs"
            weight="700"
            color={accent}
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            {vd.story_theme || "Chapter"}
          </InstagramText>
          <Box w="40px" h="2px" bg={accent} />
        </Flex>

        <InstagramText
          size="2xl"
          weight="800"
          color="white"
          maxLines={2}
          textAlign="center"
        >
          {vd.headline || "Story Title"}
        </InstagramText>

        {vd.body_text && (
          <Box
            mt="20px"
            pt="20px"
            borderTop="1px solid"
            borderColor="rgba(255,255,255,0.15)"
          >
            <InstagramText
              size="sm"
              weight="400"
              color="rgba(255,255,255,0.7)"
              maxLines={3}
              textAlign="center"
              lineHeight="1.6"
              fontStyle="italic"
            >
              {vd.body_text}
            </InstagramText>
          </Box>
        )}
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Story Narrative Template - Variation 3: Diary Entry
 * Personal, intimate diary-style design
 * Best for: Personal stories, behind-the-scenes
 */

export function StoryNarrativeVariation3({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg="#FEF9E7">
      {/* Paper texture effect */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.5}
        backgroundImage={`repeating-linear-gradient(
          ${primary}10 0px,
          ${primary}10 1px,
          transparent 1px,
          transparent 32px
        )`}
      />

      {/* Image polaroid style */}
      {imageUrl && (
        <Box
          position="absolute"
          top="24px"
          left="50%"
          transform="translateX(-50%)"
          w="70%"
          aspectRatio="4/3"
          bg="white"
          p="8px"
          borderRadius="4px"
          boxShadow="0 4px 16px rgba(0,0,0,0.15)"
        >
          <BackgroundImage src={imageUrl} alt="" objectFit="cover" />
        </Box>
      )}

      {/* Content */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        direction="column"
        p="32px"
        pt={imageUrl ? "55%" : "32px"}
        zIndex={2}
      >
        {/* Date/theme */}
        <InstagramText
          size="xs"
          weight="600"
          color={primary}
          textTransform="uppercase"
          letterSpacing="0.1em"
          mb="12px"
        >
          {vd.story_theme || "Dear Diary"}
        </InstagramText>

        <InstagramText
          size="lg"
          weight="700"
          color={secondary}
          maxLines={2}
          fontFamily="Georgia, serif"
        >
          {vd.headline || "Today I learned..."}
        </InstagramText>

        {vd.body_text && (
          <InstagramText
            size="sm"
            weight="400"
            color="gray.600"
            maxLines={3}
            mt="12px"
            lineHeight="1.6"
            fontFamily="Georgia, serif"
          >
            {vd.body_text}
          </InstagramText>
        )}
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Story Narrative Template - Variation 4: Epic Hero
 * Dramatic hero layout for epic stories
 * Best for: Brand stories, origin stories
 */

export function StoryNarrativeVariation4({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper>
      {/* Full background */}
      {imageUrl ? (
        <BackgroundImage src={imageUrl} alt="" opacity={0.7} />
      ) : (
        <Box
          position="absolute"
          inset={0}
          bg={`linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`}
        />
      )}

      {/* Gradient overlays */}
      <GradientOverlay
        direction="to bottom"
        colors={["rgba(0,0,0,0.6) 0%", "transparent 30%", "rgba(0,0,0,0.8) 100%"]}
      />

      {/* Top content */}
      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        p="28px"
        pt="32px"
        zIndex={2}
        direction="column"
      >
        {vd.story_theme && (
          <InstagramText
            size="xs"
            weight="700"
            color="rgba(255,255,255,0.6)"
            textTransform="uppercase"
            letterSpacing="0.15em"
            mb="8px"
          >
            {vd.story_theme}
          </InstagramText>
        )}

        <InstagramText
          size="2xl"
          weight="800"
          color="white"
          maxLines={2}
          shadow="0 2px 16px rgba(0,0,0,0.4)"
        >
          {vd.headline || "The Story Begins"}
        </InstagramText>
      </Flex>

      {/* Bottom content */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        p="28px"
        pb="32px"
        zIndex={2}
        direction="column"
      >
        {vd.body_text && (
          <Box
            borderLeft="3px solid"
            borderColor={accent}
            pl="16px"
            mb="16px"
          >
            <InstagramText
              size="sm"
              weight="400"
              color="rgba(255,255,255,0.75)"
              maxLines={3}
              lineHeight="1.5"
              fontStyle="italic"
            >
              {vd.body_text}
            </InstagramText>
          </Box>
        )}

        {/* Continue reading prompt */}
        <Flex align="center" gap="8px">
          <InstagramText
            size="xs"
            weight="600"
            color={accent}
            textTransform="uppercase"
            letterSpacing="0.1em"
          >
            Read more
          </InstagramText>
          <Box w="24px" h="2px" bg={accent} />
        </Flex>
      </Flex>

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="top-right" />
    </TemplateWrapper>
  );
}

/**
 * Story Narrative Template - Variation 5: Minimalist Story
 * Clean, minimal design for focused storytelling
 * Best for: Thoughtful content, reflections
 */

export function StoryNarrativeVariation5({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg="white">
      {/* Subtle accent border */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        h="6px"
        bg={`linear-gradient(90deg, ${primary} 0%, ${accent} 50%, ${secondary} 100%)`}
      />

      {/* Content */}
      <Flex
        position="absolute"
        inset={0}
        direction="column"
        justify="center"
        p="36px"
        zIndex={2}
      >
        {/* Opening mark */}
        <Box
          fontSize="24px"
          color={accent}
          mb="16px"
          fontWeight="300"
        >
          —
        </Box>

        <InstagramText
          size="xl"
          weight="700"
          color={secondary}
          maxLines={3}
          lineHeight="1.3"
        >
          {vd.headline || "A story worth telling"}
        </InstagramText>

        {vd.body_text && (
          <InstagramText
            size="sm"
            weight="400"
            color="gray.600"
            maxLines={3}
            mt="16px"
            lineHeight="1.7"
          >
            {vd.body_text}
          </InstagramText>
        )}

        {/* Story theme */}
        {vd.story_theme && (
          <InstagramText
            size="xs"
            weight="600"
            color={primary}
            textTransform="uppercase"
            letterSpacing="0.12em"
            mt="24px"
          >
            {vd.story_theme}
          </InstagramText>
        )}
      </Flex>

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="bottom-center" color={secondary} />
    </TemplateWrapper>
  );
}
