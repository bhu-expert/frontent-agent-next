/**
 * Launch Template - Variation 1: Dark Cinematic
 * Premium dark theme with glowing accents
 * Best for: Product launches, premium reveals
 */

import { Box, Flex } from "@chakra-ui/react";
import type { TemplateProps } from "../base";
import { BackgroundImage, BrandName, InstagramText, TemplateWrapper, VignetteOverlay } from "../base";

export function LaunchVariation1({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  const label = vd.launch_label || "NEW";

  return (
    <TemplateWrapper bg={secondary}>
      {/* Background image */}
      {imageUrl && <BackgroundImage src={imageUrl} alt="" opacity={0.45} />}

      {/* Dark overlay */}
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)"
      />

      {/* Radial glow effect */}
      <Box
        position="absolute"
        top="40%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="280px"
        h="280px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${accent}25 0%, transparent 70%)`}
        filter="blur(50px)"
        pointerEvents="none"
      />

      {/* Vignette */}
      <VignetteOverlay opacity={0.6} />

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
        {/* Launch pill badge */}
        <Box
          bg="rgba(255,255,255,0.08)"
          border="1px solid"
          borderColor={`${accent}66`}
          borderRadius="999px"
          px="20px"
          py="8px"
          mb="24px"
          backdropFilter="blur(8px)"
          boxShadow={`0 0 32px ${accent}33, 0 0 64px ${accent}18`}
        >
          <InstagramText
            size="xs"
            weight="700"
            color={accent}
            textTransform="uppercase"
            letterSpacing="0.2em"
          >
            {label}
          </InstagramText>
        </Box>

        <InstagramText
          size="2xl"
          weight="800"
          color="white"
          maxLines={2}
          shadow="0 2px 16px rgba(0,0,0,0.4)"
        >
          {vd.headline || "Product Launch"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="sm"
            weight="400"
            color="rgba(255,255,255,0.65)"
            maxLines={2}
            mt="10px"
            maxW="85%"
          >
            {vd.subheadline}
          </InstagramText>
        )}
      </Flex>

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="bottom-right" />
    </TemplateWrapper>
  );
}

/**
 * Launch Template - Variation 2: Bold Reveal
 * High-contrast design with dramatic reveal
 * Best for: Major announcements, new collections
 */

export function LaunchVariation2({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  const label = vd.launch_label || "LAUNCH";

  return (
    <TemplateWrapper bg={primary}>
      {/* Diagonal split */}
      <Box
        position="absolute"
        inset={0}
        bg={`linear-gradient(135deg, ${primary} 0%, ${secondary} 50%, ${primary} 100%)`}
      />

      {/* Image overlay */}
      {imageUrl && (
        <Box
          position="absolute"
          inset={0}
          backgroundImage={`url(${imageUrl})`}
          backgroundSize="cover"
          backgroundPosition="center"
          opacity={0.2}
          mixBlendMode="overlay"
        />
      )}

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
        {/* Large launch label */}
        <InstagramText
          size="4xl"
          weight="900"
          color={accent}
          textTransform="uppercase"
          letterSpacing="0.25em"
          shadow={`0 0 40px ${accent}66`}
          mb="16px"
        >
          {label}
        </InstagramText>

        <InstagramText
          size="2xl"
          weight="800"
          color="white"
          maxLines={2}
          shadow="0 4px 20px rgba(0,0,0,0.4)"
        >
          {vd.headline || "Coming Soon"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="md"
            weight="400"
            color="rgba(255,255,255,0.7)"
            maxLines={2}
            mt="12px"
          >
            {vd.subheadline}
          </InstagramText>
        )}
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Launch Template - Variation 3: Minimalist Launch
 * Clean, sophisticated design for premium brands
 * Best for: Luxury products, tech launches
 */

export function LaunchVariation3({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg="white">
      {/* Image area - top 65% */}
      <Box position="absolute" top={0} left={0} right={0} h="65%">
        {imageUrl ? (
          <BackgroundImage src={imageUrl} alt="" objectFit="cover" />
        ) : (
          <Box h="100%" bg={`linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`} />
        )}
      </Box>

      {/* Text area - bottom 35% */}
      <Box position="absolute" bottom={0} left={0} right={0} h="35%" bg="white" />

      {/* Content */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        h="35%"
        direction="column"
        align="center"
        justify="center"
        p="28px"
        textAlign="center"
        zIndex={2}
      >
        <Box
          bg={accent}
          borderRadius="999px"
          px="16px"
          py="5px"
          mb="14px"
        >
          <InstagramText
            size="xs"
            weight="700"
            color="white"
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            {vd.launch_label || "NEW"}
          </InstagramText>
        </Box>

        <InstagramText
          size="xl"
          weight="800"
          color={secondary}
          maxLines={2}
        >
          {vd.headline || "Product Launch"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="sm"
            weight="400"
            color="gray.500"
            maxLines={2}
            mt="8px"
          >
            {vd.subheadline}
          </InstagramText>
        )}
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Launch Template - Variation 4: Neon Glow
 * Electric, energetic design with neon effects
 * Best for: Tech products, gaming, youth brands
 */

export function LaunchVariation4({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  const label = vd.launch_label || "DROPPING SOON";

  return (
    <TemplateWrapper bg={secondary}>
      {/* Grid pattern */}
      <Box
        position="absolute"
        inset={0}
        backgroundImage={`
          linear-gradient(${accent}10 1px, transparent 1px),
          linear-gradient(90deg, ${accent}10 1px, transparent 1px)
        `}
        backgroundSize="40px 40px"
      />

      {/* Central glow */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="300px"
        h="300px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${accent}40 0%, transparent 60%)`}
        filter="blur(60px)"
      />

      {/* Image */}
      {imageUrl && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="80%"
          h="50%"
          borderRadius="16px"
          overflow="hidden"
          boxShadow={`0 0 60px ${accent}55`}
        >
          <BackgroundImage src={imageUrl} alt="" objectFit="cover" />
        </Box>
      )}

      {/* Content */}
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        align="center"
        justify="flex-end"
        h="100%"
        p="32px"
        textAlign="center"
      >
        <InstagramText
          size="lg"
          weight="800"
          color={accent}
          textTransform="uppercase"
          letterSpacing="0.2em"
          shadow={`0 0 20px ${accent}`}
          mb="12px"
        >
          {label}
        </InstagramText>

        <InstagramText
          size="2xl"
          weight="900"
          color="white"
          maxLines={2}
          shadow={`0 0 30px ${accent}88`}
        >
          {vd.headline || "Coming Soon"}
        </InstagramText>
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Launch Template - Variation 5: Countdown Style
 * Creates anticipation with countdown aesthetic
 * Best for: Pre-launches, upcoming events
 */

export function LaunchVariation5({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper>
      {/* Background */}
      {imageUrl ? (
        <BackgroundImage src={imageUrl} alt="" opacity={0.8} />
      ) : (
        <Box
          position="absolute"
          inset={0}
          bg={`linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`}
        />
      )}

      {/* Overlay */}
      <Box position="absolute" inset={0} bg="rgba(0,0,0,0.5)" />

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
        {/* Countdown-style badge */}
        <Box
          border="2px solid"
          borderColor={accent}
          borderRadius="16px"
          px="24px"
          py="12px"
          mb="24px"
          backdropFilter="blur(4px)"
        >
          <InstagramText
            size="lg"
            weight="800"
            color={accent}
            textTransform="uppercase"
            letterSpacing="0.15em"
          >
            {vd.launch_label || "COMING SOON"}
          </InstagramText>
        </Box>

        <InstagramText
          size="3xl"
          weight="900"
          color="white"
          maxLines={2}
          shadow="0 4px 24px rgba(0,0,0,0.5)"
          letterSpacing="-0.02em"
        >
          {vd.headline || "Something Amazing"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="md"
            weight="400"
            color="rgba(255,255,255,0.75)"
            maxLines={2}
            mt="14px"
          >
            {vd.subheadline}
          </InstagramText>
        )}

        {/* Decorative line */}
        <Box w="80px" h="3px" bg={accent} borderRadius="2px" mt="24px" />
      </Flex>

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="top-left" />
    </TemplateWrapper>
  );
}
