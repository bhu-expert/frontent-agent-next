"use client";

import { useState } from "react";
import { Box, Button, Flex, SimpleGrid, Text, VStack, Link } from "@chakra-ui/react";
import { useAuth } from "@/store/AuthProvider";
import { toaster } from "@/components/ui/toaster";

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
  const { signInWithFacebook } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const CONNECTED_PLATFORMS = [
    {
      key: "meta",
      name: "Meta (Facebook)",
      description: "Connect your Facebook Page to publish and track posts.",
      Logo: MetaLogo,
      connected: false,
    },
    {
      key: "instagram",
      name: "Instagram",
      description: "Link Instagram Business to auto-publish Reels and Carousels. Requires Facebook connection.",
      Logo: InstagramLogo,
      connected: false,
      requiresFacebook: true,
    },
  ];

  const COMING_SOON = [
    { key: "tiktok", name: "TikTok", abbr: "TT", color: "#010101" },
    { key: "linkedin", name: "LinkedIn", abbr: "in", color: "#0A66C2" },
    { key: "twitter", name: "X / Twitter", abbr: "X", color: "#000000" },
  ];

  const handleConnectFacebook = async () => {
    setIsConnecting(true);
    try {
      await signInWithFacebook();
      toaster.create({
        title: "Redirecting to Facebook",
        description: "You'll be redirected to Facebook to authorize the connection.",
        type: "info",
        duration: 5000,
      });
    } catch (error) {
      toaster.create({
        title: "Connection failed",
        description: "Failed to initiate Facebook connection. Please try again.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

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

        {/* Info note */}
        <Box
          bg="#EFF6FF"
          border="1px solid"
          borderColor="#BFDBFE"
          borderRadius="16px"
          p={4}
          mb={5}
        >
          <Flex gap={3} align="flex-start">
            <Box flexShrink={0}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8" fill="#3B82F6" opacity="0.1"/>
                <path d="M10 6.5V10.5M10 13.5H10.01" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </Box>
            <Box>
              <Text fontSize="13px" fontWeight="600" color="#1E40AF" mb={1}>
                Connecting via Personal Account
              </Text>
              <Text fontSize="12px" color="#1E40AF" lineHeight="1.5">
                When connecting Facebook, you'll authenticate with your personal Facebook account. 
                After authorization, you can select which Facebook Pages to connect. 
                For Instagram, you'll need an Instagram Business account linked to your Facebook Page.
                <Link
                  href="/docs/facebook-integration-guide"
                  color="#1E40AF"
                  textDecoration="underline"
                  fontWeight="600"
                  ml={1}
                >
                  Learn more
                </Link>
              </Text>
            </Box>
          </Flex>
        </Box>

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
              {key === "meta" ? (
                <Button
                  w="full"
                  bg="#1877F2"
                  color="white"
                  borderRadius="14px"
                  h="44px"
                  fontSize="14px"
                  fontWeight="600"
                  _hover={{ bg: "#166FE5" }}
                  loading={isConnecting}
                  onClick={handleConnectFacebook}
                >
                  {isConnecting ? "Connecting..." : "Connect with Facebook"}
                </Button>
              ) : (
                <Button
                  w="full"
                  bg="#E5E7EB"
                  color="#6B7280"
                  borderRadius="14px"
                  h="44px"
                  fontSize="14px"
                  fontWeight="600"
                  cursor="not-allowed"
                  disabled
                >
                  Connect Facebook First
                </Button>
              )}
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
