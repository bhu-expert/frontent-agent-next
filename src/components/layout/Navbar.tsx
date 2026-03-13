"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { NAV_LINKS } from "@/constants";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box as="nav" position="fixed" top="0" left="0" right="0" zIndex="50">
      {/* Main Navbar Bar */}
      <Box
        bg="linear-gradient(135deg, #3B30D4 0%, #4F46E5 50%, #6366F1 100%)"
        px={{ base: "4", md: "8" }}
        pt="4"
        pb="6"
        boxShadow="0 4px 24px rgba(79,70,229,0.35)"
        position="relative"
      >
        <Box
          maxW="7xl"
          mx="auto"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* Logo */}
          <Flex align="center" gap="2.5">
            <Flex
              w="9"
              h="9"
              bg="rgba(255,255,255,0.2)"
              rounded="xl"
              align="center"
              justify="center"
              border="1px solid rgba(255,255,255,0.3)"
              backdropFilter="blur(8px)"
            >
              <Text color="white" fontWeight="800" fontSize="md">
                I
              </Text>
            </Flex>
            <Text
              fontSize="lg"
              fontWeight="800"
              color="white"
              letterSpacing="-0.02em"
            >
              Insta Agent
            </Text>
          </Flex>

          {/* Desktop Nav */}
          <Flex
            display={{ base: "none", md: "flex" }}
            gap="8"
            fontSize="sm"
            fontWeight="500"
          >
            {NAV_LINKS.map((link) => (
              <Link key={link.label} href={link.href}>
                <Text
                  color="rgba(255,255,255,0.8)"
                  _hover={{ color: "white" }}
                  transition="color 0.2s"
                  cursor="pointer"
                >
                  {link.label}
                </Text>
              </Link>
            ))}
          </Flex>

          {/* Desktop CTA */}
          <Flex display={{ base: "none", md: "flex" }} align="center" gap="4">
            <Link href="/login">
              <Text
                fontSize="sm"
                fontWeight="500"
                color="rgba(255,255,255,0.8)"
                _hover={{ color: "white" }}
                transition="color 0.2s"
              >
                Log in
              </Text>
            </Link>
            <Link href="/onboarding">
              <Box
                bg="white"
                color="#4F46E5"
                px="5"
                py="2"
                rounded="full"
                fontSize="sm"
                fontWeight="700"
                _hover={{
                  bg: "rgba(255,255,255,0.9)",
                  transform: "translateY(-1px)",
                }}
                transition="all 0.2s"
                boxShadow="0 4px 14px rgba(0,0,0,0.15)"
              >
                Start for free
              </Box>
            </Link>
          </Flex>

          {/* Mobile Hamburger */}
          <Box
            display={{ base: "flex", md: "none" }}
            as="button"
            aria-label="Toggle Navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
            color="white"
            p="1"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </Box>
        </Box>
      </Box>

      {/* Curvy bottom edge — SVG wave */}
      <Box position="relative" mt="-1px" lineHeight="0" pointerEvents="none">
        <svg
          viewBox="0 0 1440 48"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: "48px" }}
        >
          <path
            d="M0,0 C240,48 480,48 720,24 C960,0 1200,0 1440,32 L1440,0 L0,0 Z"
            fill="#4F46E5"
          />
        </svg>
      </Box>

      {/* Mobile Menu */}
      {mobileOpen && (
        <Box
          mx="4"
          mt="-8"
          position="relative"
          zIndex="10"
          bg="white"
          rounded="2xl"
          border="1px solid"
          borderColor="indigo.100"
          boxShadow="0 12px 40px rgba(79,70,229,0.15)"
          p="5"
          display={{ md: "none" }}
        >
          <Flex direction="column" gap="4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
              >
                <Text
                  fontSize="sm"
                  fontWeight="500"
                  color="gray.700"
                  _hover={{ color: "#4F46E5" }}
                >
                  {link.label}
                </Text>
              </Link>
            ))}
            <Box h="1px" bg="gray.100" />
            <Flex gap="3" direction="column">
              <Link href="/login">
                <Text fontSize="sm" fontWeight="500" color="gray.600">
                  Log in
                </Text>
              </Link>
              <Link href="/onboarding">
                <Box
                  bg="#4F46E5"
                  color="white"
                  px="5"
                  py="2.5"
                  rounded="full"
                  fontSize="sm"
                  fontWeight="600"
                  textAlign="center"
                  boxShadow="0 4px 14px rgba(79,70,229,0.3)"
                >
                  Start for free
                </Box>
              </Link>
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
