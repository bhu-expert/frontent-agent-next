/**
 * Sale Template - Variation 1: Bold Offer Badge
 * Centered offer badge with supporting headline
 * Best for: Flash sales, percentage discounts
 */

import { Box, Flex } from "@chakra-ui/react";
import type { TemplateProps } from "../base";
import { BackgroundImage, BrandName, InstagramText, TemplateWrapper } from "../base";

export function SaleVariation1({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  const hasOffer = vd.offer_text && vd.offer_text.trim();

  return (
    <TemplateWrapper bg={primary}>
      {/* Background image texture */}
      {imageUrl && <BackgroundImage src={imageUrl} alt="" opacity={0.15} />}

      {/* Diagonal accent shapes */}
      <Box
        position="absolute"
        top="-30%"
        right="-25%"
        w="70%"
        h="60%"
        bg={accent}
        transform="rotate(15deg)"
        opacity={0.15}
        borderRadius="40px"
      />
      <Box
        position="absolute"
        bottom="-20%"
        left="-20%"
        w="50%"
        h="40%"
        bg={secondary}
        transform="rotate(-10deg)"
        opacity={0.2}
        borderRadius="40px"
      />

      {/* Centered content */}
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        align="center"
        justify="center"
        h="100%"
        p="20px"
        textAlign="center"
      >
        {hasOffer ? (
          <>
            {/* Offer badge - hero element */}
            <Box
              bg={accent}
              borderRadius="14px"
              px="18px"
              py="10px"
              mb="10px"
              boxShadow={`0 12px 40px ${accent}55`}
            >
              <InstagramText
                size="2xl"
                weight="900"
                color={secondary}
                shadow="0 2px 8px rgba(0,0,0,0.2)"
                lineHeight="1.05"
              >
                {vd.offer_text}
              </InstagramText>
            </Box>
            <InstagramText
              size="lg"
              weight="800"
              color="white"
              shadow="0 2px 12px rgba(0,0,0,0.3)"
              lineHeight="1.25"
            >
              {vd.headline || "Sale Headline"}
            </InstagramText>
          </>
        ) : (
          <>
            <InstagramText
              size="xl"
              weight="900"
              color="white"
              shadow="0 4px 16px rgba(0,0,0,0.3)"
              lineHeight="1.2"
              mb="6px"
            >
              {vd.headline || "Sale Headline"}
            </InstagramText>
            {vd.subheadline && (
              <InstagramText
                size="xs"
                weight="500"
                color="rgba(255,255,255,0.85)"
                lineHeight="1.45"
              >
                {vd.subheadline}
              </InstagramText>
            )}
          </>
        )}

        {vd.tagline && (
          <InstagramText
            size="xs"
            weight="600"
            color="rgba(255,255,255,0.65)"
            textTransform="uppercase"
            letterSpacing="0.08em"
            mt="10px"
          >
            {vd.tagline}
          </InstagramText>
        )}
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Sale Template - Variation 2: Corner Burst
 * Dynamic corner burst design for urgency
 * Best for: Limited time offers, flash sales
 */

export function SaleVariation2({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  const hasOffer = vd.offer_text && vd.offer_text.trim();

  return (
    <TemplateWrapper bg={secondary}>
      {/* Corner burst shape */}
      <Box
        position="absolute"
        top={0}
        right={0}
        w="55%"
        h="55%"
        bg={accent}
        borderRadius="0 0 0 90px"
        opacity={0.9}
      />

      {/* Burst text */}
      {hasOffer && (
        <Flex
          position="absolute"
          top="18px"
          right="18px"
          align="center"
          justify="center"
          zIndex={3}
          w="110px"
          h="110px"
        >
          <InstagramText
            size="xl"
            weight="900"
            color={secondary}
            align="center"
            lineHeight="1.05"
          >
            {vd.offer_text}
          </InstagramText>
        </Flex>
      )}

      {/* Background image */}
      {imageUrl && <BackgroundImage src={imageUrl} alt="" opacity={0.2} />}

      {/* Main content */}
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        justify="flex-end"
        h="100%"
        p="20px"
      >
        <InstagramText
          size="lg"
          weight="800"
          color="white"
          shadow="0 2px 12px rgba(0,0,0,0.3)"
          lineHeight="1.25"
          mb="6px"
        >
          {vd.headline || "Sale Headline"}
        </InstagramText>
        {vd.subheadline && (
          <InstagramText
            size="xs"
            weight="400"
            color="rgba(255,255,255,0.85)"
            lineHeight="1.45"
          >
            {vd.subheadline}
          </InstagramText>
        )}
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Sale Template - Variation 3: Strikethrough Price
 * Classic sale design with price emphasis
 * Best for: Price-focused promotions
 */

export function SaleVariation3({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper>
      {/* Background */}
      {imageUrl ? (
        <BackgroundImage src={imageUrl} alt="" opacity={0.9} />
      ) : (
        <Box
          position="absolute"
          inset={0}
          bg={`linear-gradient(180deg, ${primary} 0%, ${secondary} 100%)`}
        />
      )}

      {/* Gradient overlay */}
      <Box
        position="absolute"
        inset={0}
        bg="linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)"
      />

      {/* Content */}
      <Flex
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        direction="column"
        p="20px"
        zIndex={2}
      >
        {/* Sale tag */}
        <Box
          display="inline-block"
          bg={accent}
          borderRadius="8px"
          px="12px"
          py="4px"
          mb="10px"
          alignSelf="flex-start"
        >
          <InstagramText size="xs" weight="700" color="white" textTransform="uppercase">
            {vd.offer_text || "SALE"}
          </InstagramText>
        </Box>

        <InstagramText
          size="lg"
          weight="800"
          color="white"
          shadow="0 2px 8px rgba(0,0,0,0.3)"
          lineHeight="1.25"
          mb="6px"
        >
          {vd.headline || "Sale Headline"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="xs"
            weight="400"
            color="rgba(255,255,255,0.85)"
            lineHeight="1.45"
          >
            {vd.subheadline}
          </InstagramText>
        )}
      </Flex>

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="top-left" />
    </TemplateWrapper>
  );
}

/**
 * Sale Template - Variation 4: Minimalist Sale
 * Clean, modern design for luxury sales
 * Best for: Premium brands, elegant promotions
 */

export function SaleVariation4({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  return (
    <TemplateWrapper bg="white">
      {/* Split design */}
      <Box position="absolute" inset={0} display="flex">
        {/* Image area - left 50% */}
        <Box position="absolute" left={0} top={0} bottom={0} w="50%">
          {imageUrl ? (
            <BackgroundImage src={imageUrl} alt="" objectFit="cover" />
          ) : (
            <Box h="100%" bg={primary} />
          )}
        </Box>

        {/* Text area - right 50% */}
        <Box position="absolute" right={0} top={0} bottom={0} w="50%" bg={secondary} />
      </Box>

      {/* Content */}
      <Flex
        position="absolute"
        right={0}
        top={0}
        bottom={0}
        w="50%"
        direction="column"
        justify="center"
        p="20px"
        zIndex={2}
      >
        <InstagramText
          size="xs"
          weight="700"
          color={accent}
          textTransform="uppercase"
          letterSpacing="0.1em"
          mb="8px"
          lineHeight="1.3"
        >
          {vd.offer_text || "Special Offer"}
        </InstagramText>

        <InstagramText
          size="lg"
          weight="800"
          color="white"
          lineHeight="1.25"
          mb="6px"
        >
          {vd.headline || "Sale Headline"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="xs"
            weight="400"
            color="rgba(255,255,255,0.7)"
            lineHeight="1.45"
          >
            {vd.subheadline}
          </InstagramText>
        )}
      </Flex>
    </TemplateWrapper>
  );
}

/**
 * Sale Template - Variation 5: Urgency Banner
 * Bold banner design for time-sensitive offers
 * Best for: Countdown sales, limited quantity
 */

export function SaleVariation5({ vd, imageUrl, primary, secondary, accent }: TemplateProps) {
  const hasOffer = vd.offer_text && vd.offer_text.trim();

  return (
    <TemplateWrapper bg={primary}>
      {/* Background pattern */}
      <Box
        position="absolute"
        inset={0}
        backgroundImage={`repeating-linear-gradient(45deg, ${accent}15 0px, ${accent}15 2px, transparent 2px, transparent 12px)`}
      />

      {/* Center content */}
      <Flex
        position="relative"
        zIndex={2}
        direction="column"
        align="center"
        justify="center"
        h="100%"
        p="24px"
        textAlign="center"
      >
        {/* Urgency banner */}
        <Box
          bg={accent}
          borderRadius="10px"
          px="18px"
          py="8px"
          mb="12px"
          boxShadow={`0 8px 32px ${accent}44`}
        >
          <InstagramText
            size="md"
            weight="800"
            color={secondary}
            textTransform="uppercase"
            letterSpacing="0.05em"
            lineHeight="1.15"
          >
            {hasOffer ? vd.offer_text : "Limited Time"}
          </InstagramText>
        </Box>

        <InstagramText
          size="xl"
          weight="900"
          color="white"
          shadow="0 4px 16px rgba(0,0,0,0.3)"
          lineHeight="1.25"
          mb="6px"
        >
          {vd.headline || "Sale Headline"}
        </InstagramText>

        {vd.subheadline && (
          <InstagramText
            size="xs"
            weight="500"
            color="rgba(255,255,255,0.85)"
            lineHeight="1.45"
          >
            {vd.subheadline}
          </InstagramText>
        )}
      </Flex>

      {/* Brand name */}
      <BrandName brandName={vd.brand_name} position="bottom-center" />
    </TemplateWrapper>
  );
}
