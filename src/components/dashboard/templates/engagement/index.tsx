/**
 * @deprecated These templates are superseded by the 10-layout system in
 * `src/components/dashboard/templates/layouts/index.tsx`.
 * Use `getTemplateComponent(adType, variationIndex)` from the templates barrel
 * instead of importing individual variation components.
 *
 * These exports are kept only for backwards compatibility and will be removed
 * in a future cleanup. Do not add new usages.
 */

/**
 * Engagement Template - Variation 1: Geometric Bold
 * Modern geometric patterns with centered content
 * Best for: Questions, polls, interactive content
 */

import { Box, Flex, Text } from "@chakra-ui/react";
import type { TemplateProps } from "../base";
import { AccentDot, BackgroundImage, BrandName, InstagramText, TemplateWrapper } from "../base";

export function EngagementVariation1({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg={primary} overflow="hidden">
      {/* Geometric crosshatch pattern */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.1}
        pointerEvents="none"
        backgroundImage={`
          repeating-linear-gradient(45deg, ${accent} 0px, ${accent} 1.5px, transparent 1.5px, transparent 22px),
          repeating-linear-gradient(-45deg, ${accent} 0px, ${accent} 1.5px, transparent 1.5px, transparent 22px)
        `}
      />

      {/* Subtle image texture */}
      {imageUrl && <BackgroundImage src={imageUrl} alt="" opacity={0.08} />}

      {/* Centered content */}
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        align="center"
        justify="center"
        h="100%"
        p="32px"
        textAlign="center"
      >
        {/* Accent dot */}
        <AccentDot color={accent} size="10px" />

        <InstagramText
          size="2xl"
          weight="900"
          color="white"
          maxLines={3}
          mt="20px"
          shadow="0 2px 16px rgba(0,0,0,0.15)"
        >
          {vd.headline || "Engage Your Audience"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="md"
            weight="500"
            color="rgba(255,255,255,0.75)"
            maxLines={2}
            mt="14px"
            maxW="85%"
          >
            {vd.subheadline}
          </InstagramText>
        )}

        {/* Accent line */}
        <Box w="48px" h="3px" bg={accent} borderRadius="2px" mt="24px" />
      </Flex>

      {/* Tagline */}
      {vd.tagline && (
        <Text
          position="absolute"
          bottom="20px"
          left="24px"
          right="24px"
          fontSize="10px"
          fontWeight="600"
          color="rgba(255,255,255,0.4)"
          textTransform="uppercase"
          letterSpacing="0.12em"
          textAlign="center"
          zIndex={3}
        >
          {vd.tagline}
        </Text>
      )}
    </TemplateWrapper>
  );
}

/**
 * Engagement Template - Variation 2: Question Card
 * Card-style design optimized for questions
 * Best for: Q&A posts, audience questions
 */

export function EngagementVariation2({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg={`linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`}>
      {/* Background image accent */}
      {imageUrl && (
        <Box
          position="absolute"
          top="10%"
          right="-10%"
          w="60%"
          h="40%"
          borderRadius="20px"
          overflow="hidden"
          opacity={0.15}
          transform="rotate(15deg)"
        >
          <BackgroundImage src={imageUrl} alt="" objectFit="cover" />
        </Box>
      )}

      {/* Content card */}
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        justify="center"
        h="100%"
        p="32px"
      >
        {/* Question mark accent */}
        <Box
          position="absolute"
          top="24px"
          right="24px"
          fontSize="64px"
          fontWeight="900"
          color={accent}
          opacity={0.3}
          lineHeight="1"
        >
          ?
        </Box>

        <InstagramText
          size="2xl"
          weight="800"
          color="white"
          maxLines={3}
          shadow="0 2px 12px rgba(0,0,0,0.2)"
        >
          {vd.headline || "What Do You Think?"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="md"
            weight="400"
            color="rgba(255,255,255,0.7)"
            maxLines={3}
            mt="12px"
          >
            {vd.subheadline}
          </InstagramText>
        )}

        {/* CTA prompt */}
        <Flex
          align="center"
          gap="10px"
          mt="24px"
          bg="rgba(255,255,255,0.1)"
          borderRadius="12px"
          px="16px"
          py="12px"
        >
          <Box w="8px" h="8px" borderRadius="full" bg={accent} />
          <InstagramText size="sm" weight="600" color="white">
            Drop your answer below 👇
          </InstagramText>
        </Flex>
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Engagement Template - Variation 3: Poll Style
 * Clean design optimized for polls and voting
 * Best for: Polls, this-or-that posts
 */

export function EngagementVariation3({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg="white">
      {/* Top image area */}
      <Box position="absolute" top={0} left={0} right={0} h="45%">
        {imageUrl ? (
          <BackgroundImage src={imageUrl} alt="" objectFit="cover" />
        ) : (
          <Box h="100%" bg={`linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`} />
        )}
      </Box>

      {/* Bottom content area */}
      <Box position="absolute" bottom={0} left={0} right={0} top="45%" bg="white" />

      {/* Content */}
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        justify="center"
        h="100%"
        p="32px"
        pt="55%"
      >
        {/* Poll indicator */}
        <Flex align="center" gap="8px" mb="16px">
          <Box w="32px" h="32px" borderRadius="8px" bg={primary} opacity={0.2} />
          <Box w="32px" h="32px" borderRadius="8px" bg={secondary} opacity={0.2} />
          <InstagramText size="xs" weight="600" color="gray.400" ml="8px">
            POLL
          </InstagramText>
        </Flex>

        <InstagramText
          size="xl"
          weight="800"
          color={secondary}
          maxLines={2}
        >
          {vd.headline || "Which One?"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="sm"
            weight="400"
            color="gray.600"
            maxLines={2}
            mt="10px"
          >
            {vd.subheadline}
          </InstagramText>
        )}

        {/* Vote prompt */}
        <Flex
          align="center"
          justify="space-between"
          mt="20px"
          bg={`linear-gradient(90deg, ${primary}20 0%, ${secondary}20 100%)`}
          borderRadius="12px"
          px="16px"
          py="10px"
        >
          <InstagramText size="xs" weight="600" color={primary}>
            ← Option A
          </InstagramText>
          <InstagramText size="xs" weight="600" color={secondary}>
            Option B →
          </InstagramText>
        </Flex>
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Engagement Template - Variation 4: Conversation Starter
 * Speech bubble inspired design
 * Best for: Discussion prompts, hot takes
 */

export function EngagementVariation4({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg={secondary}>
      {/* Background pattern */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.05}
        backgroundImage={`radial-gradient(${accent} 2px, transparent 2px)`}
        backgroundSize="24px 24px"
      />

      {/* Speech bubble container */}
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        justify="center"
        h="100%"
        p="32px"
      >
        {/* Speech bubble */}
        <Box
          bg="white"
          borderRadius="24px"
          p="28px"
          mb="24px"
          boxShadow="0 8px 32px rgba(0,0,0,0.15)"
          position="relative"
        >
          {/* Speech bubble tail */}
          <Box
            position="absolute"
            bottom="-12px"
            left="40px"
            w="20px"
            h="20px"
            bg="white"
            transform="rotate(45deg)"
          />

          <InstagramText
            size="xl"
            weight="700"
            color={secondary}
            maxLines={3}
          >
            {vd.headline || "Let's talk about it..."}
          </InstagramText>
        </Box>

        {/* Prompt text */}
        {vd.subheadline && (
          <InstagramText
            size="md"
            weight="500"
            color="rgba(255,255,255,0.8)"
            maxLines={2}
          >
            {vd.subheadline}
          </InstagramText>
        )}

        {/* Comment prompt */}
        <Flex align="center" gap="10px" mt="20px">
          <Box
            w="36px"
            h="36px"
            borderRadius="full"
            bg={accent}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <InstagramText size="sm" weight="700" color="white">
              💬
            </InstagramText>
          </Box>
          <InstagramText size="sm" weight="600" color="rgba(255,255,255,0.7)">
            Share your thoughts below
          </InstagramText>
        </Flex>
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Engagement Template - Variation 5: Fill in the Blank
 * Interactive blank-filling design
 * Best for: Fill-in-the-blank posts, completions
 */

export function EngagementVariation5({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg={`linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`}>
      {/* Decorative circles */}
      <Box
        position="absolute"
        top="-50px"
        right="-50px"
        w="200px"
        h="200px"
        borderRadius="full"
        border="2px solid"
        borderColor={accent}
        opacity={0.2}
      />
      <Box
        position="absolute"
        bottom="-30px"
        left="-30px"
        w="120px"
        h="120px"
        borderRadius="full"
        bg={accent}
        opacity={0.1}
      />

      {/* Content */}
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        align="center"
        justify="center"
        h="100%"
        p="32px"
        textAlign="center"
      >
        <InstagramText
          size="lg"
          weight="600"
          color="rgba(255,255,255,0.6)"
          textTransform="uppercase"
          letterSpacing="0.1em"
          mb="20px"
        >
          Fill in the blank
        </InstagramText>

        <Box
          borderBottom="3px solid"
          borderColor={accent}
          px="16px"
          py="8px"
          mb="16px"
        >
          <InstagramText
            size="2xl"
            weight="800"
            color="white"
            maxLines={2}
          >
            {vd.headline || "I love _____"}
          </InstagramText>
        </Box>

        {vd.subheadline && (
          <InstagramText
            size="sm"
            weight="400"
            color="rgba(255,255,255,0.7)"
            maxLines={2}
          >
            {vd.subheadline}
          </InstagramText>
        )}

        {/* Prompt */}
        <Flex
          align="center"
          gap="8px"
          mt="24px"
          bg="rgba(255,255,255,0.1)"
          borderRadius="999px"
          px="20px"
          py="10px"
        >
          <InstagramText size="xs" weight="600" color="rgba(255,255,255,0.8)">
            Comment your answer
          </InstagramText>
          <Box w="6px" h="6px" borderRadius="full" bg={accent} />
        </Flex>
      </Flex>
    </TemplateWrapper>
  );
}
