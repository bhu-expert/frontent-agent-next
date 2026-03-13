"use client";

import { Box, Button, Flex, SimpleGrid, Text, VStack } from "@chakra-ui/react";

// ─── Inline SVG logos ────────────────────────────────────────────────────────

function MetaLogo() {
  return (
    <Flex
      w="48px"
      h="48px"
      borderRadius="14px"
      bg="#1877F2"
      align="center"
      justify="center"
      flexShrink={0}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9.198 21.5h5.604c.278 0 .51-.197.554-.471L17 9H7l1.644 12.029a.562.562 0 0 0 .554.471Z"
          fill="white"
          opacity="0"
        />
        <text x="7" y="18" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="900" fill="white">f</text>
      </svg>
    </Flex>
  );
}

function InstagramLogo() {
  return (
    <Flex
      w="48px"
      h="48px"
      borderRadius="14px"
      align="center"
      justify="center"
      flexShrink={0}
      style={{
        background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="17.5" cy="6.5" r="1" fill="white" />
      </svg>
    </Flex>
  );
}

function PlatformPlaceholderLogo({ label, color }: { label: string; color: string }) {
  return (
    <Flex
      w="36px"
      h="36px"
      borderRadius="10px"
      bg={color}
      align="center"
      justify="center"
      flexShrink={0}
    >
      <Text fontSize="11px" fontWeight="800" color="white">
        {label}
      </Text>
    </Flex>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function IntegrationsTab() {
  const CONNECTED_PLATFORMS = [
    {
      key: "meta",
      name: "Meta (Facebook)",
      description: "Connect your Facebook Page to publish and track posts.",
      Logo: MetaLogo,
    },
    {
      key: "instagram",
      name: "Instagram",
      description: "Link Instagram Business to auto-publish Reels and Carousels.",
      Logo: InstagramLogo,
    },
  ];

  const COMING_SOON = [
    { key: "tiktok", name: "TikTok", abbr: "TT", color: "#010101" },
    { key: "linkedin", name: "LinkedIn", abbr: "in", color: "#0A66C2" },
    { key: "twitter", name: "X / Twitter", abbr: "X", color: "#000000" },
  ];

  return (
    <VStack align="stretch" gap={8}>
      {/* Page heading */}
      <Box>
        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="700" color="#111111" lineHeight="1.05" mb={2}>
          Integrations
        </Text>
        <Text fontSize="15px" color="#6B7280">
          Connect your social platforms to publish content directly from PostGini.
        </Text>
      </Box>

      {/* Connected Platforms section */}
      <Box>
        <Text fontSize="13px" fontWeight="800" color="#6B7280" letterSpacing="0.06em" textTransform="uppercase" mb={4}>
          Connected Platforms
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
          {CONNECTED_PLATFORMS.map(({ key, name, description, Logo }) => (
            <Box
              key={key}
              bg="white"
              border="1px solid"
              borderColor="#ECECEC"
              borderRadius="24px"
              p={6}
              boxShadow="0 12px 48px rgba(0,0,0,0.04)"
              transition="all 0.2s ease"
              _hover={{ borderColor: "#D1D5DB", boxShadow: "0 16px 56px rgba(0,0,0,0.07)" }}
            >
              {/* Logo + title row */}
              <Flex align="center" gap={4} mb={4}>
                <Logo />
                <Box>
                  <Text fontSize="17px" fontWeight="700" color="#111111" lineHeight="1.2">
                    {name}
                  </Text>
                  {/* Not Connected badge */}
                  <Box
                    display="inline-block"
                    mt={1.5}
                    px={2.5}
                    py={0.5}
                    bg="#F3F4F6"
                    borderRadius="999px"
                    border="1px solid"
                    borderColor="#E5E7EB"
                  >
                    <Text fontSize="11px" fontWeight="600" color="#6B7280">
                      Not Connected
                    </Text>
                  </Box>
                </Box>
              </Flex>

              {/* Description */}
              <Text fontSize="14px" color="#6B7280" lineHeight="1.55" mb={5}>
                {description}
              </Text>

              {/* Connect button */}
              <Button
                w="full"
                bg="#4F46E5"
                color="white"
                borderRadius="14px"
                h="44px"
                fontSize="14px"
                fontWeight="600"
                _hover={{ bg: "#4338CA" }}
              >
                Connect
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* Coming Soon section */}
      <Box>
        <Text fontSize="13px" fontWeight="800" color="#6B7280" letterSpacing="0.06em" textTransform="uppercase" mb={4}>
          Coming Soon
        </Text>

        <Flex gap={4} wrap="wrap">
          {COMING_SOON.map(({ key, name, abbr, color }) => (
            <Flex
              key={key}
              align="center"
              gap={3}
              bg="white"
              border="1px solid"
              borderColor="#ECECEC"
              borderRadius="16px"
              px={4}
              py={3}
              boxShadow="0 4px 16px rgba(0,0,0,0.03)"
              opacity={0.7}
            >
              <PlatformPlaceholderLogo label={abbr} color={color} />
              <Box>
                <Text fontSize="14px" fontWeight="600" color="#111111">
                  {name}
                </Text>
                <Box
                  display="inline-block"
                  mt={0.5}
                  px={2}
                  py={0.5}
                  bg="#FEF3C7"
                  borderRadius="999px"
                  border="1px solid"
                  borderColor="#FDE68A"
                >
                  <Text fontSize="10px" fontWeight="700" color="#92400E">
                    Coming soon
                  </Text>
                </Box>
              </Box>
            </Flex>
          ))}
        </Flex>
      </Box>
    </VStack>
  );
}
