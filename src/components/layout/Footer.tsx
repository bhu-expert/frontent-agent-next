"use client";

import { Box, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Updates", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Resources: [
    { label: "Support", href: "#" },
    { label: "Affiliate program", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Preferences", href: "#" },
    { label: "Terms of service", href: "#" },
    { label: "Contacts", href: "#" },
  ],
  Download: [
    { label: "iOS", href: "#" },
    { label: "Android", href: "#" },
    { label: "Mac", href: "#" },
    { label: "Sign In", href: "#" },
  ],
  "Get in touch": [
    { label: "hi@adforge.ai", href: "#" },
    { label: "Discord", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "X", href: "#" },
  ],
};

const headingColors: Record<string, string> = {
  Product: "#a78bfa",
  Resources: "#34d399",
  Download: "#fbbf24",
  "Get in touch": "#fb923c",
};

export default function Footer() {
  return (
    <Box bg="#fadcf2" p={{ base: "4", md: "10" }}>
      <Box
        bg="#0f111a"
        borderRadius={{ base: "3xl", md: "40px" }}
        px={{ base: "6", md: "16", lg: "24" }}
        py={{ base: "10", md: "20" }}
        maxW="100%"
        mx="auto"
        color="#8B949E"
        minH={{ md: "350px" }}
      >
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          gap={{ base: "10", lg: "8" }}
          maxW="7xl"
          mx="auto"
        >
          {/* Link columns */}
          <Grid
            templateColumns={{
              base: "1fr 1fr",
              md: "repeat(4, 1fr)",
            }}
            gap={{ base: "8", md: "12", lg: "20" }}
            w={{ lg: "70%" }}
          >
            {Object.entries(footerLinks).map(([title, links]) => (
              <Box key={title}>
                <Heading
                  fontSize={{ base: "13px", md: "15px" }}
                  mb={{ base: "4", md: "5" }}
                  color={headingColors[title]}
                  fontWeight="600"
                >
                  {title}
                </Heading>
                <Flex direction="column" gap={{ base: "3", md: "4" }}>
                  {links.map((link) => (
                    <Link key={link.label} href={link.href}>
                      <Text
                        fontSize={{ base: "12px", md: "13px" }}
                        color="#9CA3AF"
                        _hover={{ color: "white" }}
                        transition="0.2s"
                        cursor="pointer"
                      >
                        {link.label}
                      </Text>
                    </Link>
                  ))}
                </Flex>
              </Box>
            ))}
          </Grid>

          {/* Last Update Card */}
          <Box display="flex" justifyContent={{ base: "flex-start", lg: "flex-end" }} w={{ lg: "30%" }}>
            <Box
              bg="#1a1a2e"
              p={{ base: "4", md: "5" }}
              borderRadius="2xl"
              w="full"
              maxW={{ base: "full", lg: "240px" }}
              h="fit-content"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Text fontSize="11px" mb="1" color="#60a5fa" fontWeight="500">
                Last update
              </Text>
              <Text color="gray.300" fontSize={{ base: "13px", md: "14px" }} mb="1" fontWeight="500">
                AdForge Generation Model
              </Text>
              <Text fontSize="11px" color="gray.600">
                March 25, 2026
              </Text>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}