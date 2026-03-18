"use client";

import {
  Box,
  Container,
  Text,
  VStack,
  Heading,
  Link,
  Flex,
  Button,
  Circle,
  Separator,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { ArrowLeft, Shield, Lock, Trash2, Mail, Globe, Cpu, Eye, Database } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const sections = [
  {
    number: "01",
    title: "Introduction",
    icon: Shield,
    iconBg: "purple.50",
    iconColor: "purple.600",
    content: (
      <VStack align="stretch" gap={4} color="gray.600" fontSize="15px" lineHeight="1.9">
        <Text>
          Plug and Play Agent ("we", "our", or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your
          information when you use our AI-powered Instagram growth platform and related
          services (collectively, the "Service").
        </Text>
        <Text>
          By using Plug and Play Agent, you agree to the collection and use of information
          in accordance with this policy. If you do not agree with our policies and
          practices, please do not use our Service.
        </Text>
      </VStack>
    ),
  },
  {
    number: "02",
    title: "Information We Collect",
    icon: Database,
    iconBg: "blue.50",
    iconColor: "blue.600",
    content: (
      <VStack align="stretch" gap={8} color="gray.600" fontSize="15px" lineHeight="1.9">
        {[
          {
            sub: "Personal Information",
            desc: "When you create an account, we collect:",
            items: ["Email address", "Name", "Password (encrypted)", "Profile information"],
          },
          {
            sub: "Social Media Account Information",
            desc: "When you connect Instagram accounts, we collect:",
            items: [
              "Public profile information from connected platforms",
              "Page information and permissions you grant",
              "Content you publish through our Service",
              "Engagement metrics and analytics data",
            ],
          },
          {
            sub: "Usage Data",
            desc: "We automatically collect information about how you use our Service:",
            items: [
              "Device information (browser type, operating system)",
              "IP address and access times",
              "Pages visited and features used",
              "Click patterns and interactions",
            ],
          },
        ].map((block) => (
          <Box key={block.sub}>
            <Text fontWeight="700" color="gray.800" mb={2} fontSize="14px"
              textTransform="uppercase" letterSpacing="0.06em">
              {block.sub}
            </Text>
            <Text mb={3}>{block.desc}</Text>
            <VStack align="stretch" gap={1.5} pl={4} borderLeft="2px solid" borderColor="blue.100">
              {block.items.map((item) => (
                <Text key={item} fontSize="14px" color="gray.500">→ {item}</Text>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    ),
  },
  {
    number: "03",
    title: "How We Use Your Information",
    icon: Cpu,
    iconBg: "orange.50",
    iconColor: "orange.500",
    content: (
      <VStack align="stretch" gap={2} color="gray.600" fontSize="15px" lineHeight="1.9">
        <Text mb={2}>We use the collected information for the following purposes:</Text>
        <VStack align="stretch" gap={1.5} pl={4} borderLeft="2px solid" borderColor="orange.100">
          {[
            "To provide, maintain, and improve our Service",
            "To publish content to your connected Instagram account",
            "To send you technical notices and support messages",
            "To respond to your comments and questions",
            "To develop new features and services",
            "To monitor and analyze trends, usage, and activities",
            "To detect, investigate, and prevent fraudulent transactions",
            "To personalize your experience",
          ].map((item) => (
            <Text key={item} fontSize="14px" color="gray.500">→ {item}</Text>
          ))}
        </VStack>
      </VStack>
    ),
  },
  {
    number: "04",
    title: "Data Sharing & Third Parties",
    icon: Globe,
    iconBg: "teal.50",
    iconColor: "teal.600",
    content: (
      <VStack align="stretch" gap={4} color="gray.600" fontSize="15px" lineHeight="1.9">
        <Text>
          We do not sell, trade, or rent your personal information to third parties.
          We may share your data only in the following limited circumstances:
        </Text>
        <VStack align="stretch" gap={1.5} pl={4} borderLeft="2px solid" borderColor="teal.100">
          {[
            "With service providers who assist in operating our platform (e.g. Supabase, Stripe)",
            "When required by law or to respond to legal processes",
            "To protect the rights and safety of Plug and Play Agent and its users",
            "In connection with a business merger or acquisition (users notified in advance)",
          ].map((item) => (
            <Text key={item} fontSize="14px" color="gray.500">→ {item}</Text>
          ))}
        </VStack>
      </VStack>
    ),
  },
  {
    number: "05",
    title: "Your Rights",
    icon: Eye,
    iconBg: "green.50",
    iconColor: "green.600",
    content: (
      <VStack align="stretch" gap={4} color="gray.600" fontSize="15px" lineHeight="1.9">
        <Text>
          Depending on your location, you may have the following rights regarding your
          personal data under GDPR, CCPA, or applicable local laws:
        </Text>
        <VStack align="stretch" gap={1.5} pl={4} borderLeft="2px solid" borderColor="green.100">
          {[
            "Right to access — request a copy of your personal data",
            "Right to rectification — correct inaccurate or incomplete data",
            "Right to erasure — request deletion of your data",
            "Right to portability — receive your data in a structured format",
            "Right to object — opt out of certain processing activities",
            "Right to restrict processing — limit how we use your data",
          ].map((item) => (
            <Text key={item} fontSize="14px" color="gray.500">→ {item}</Text>
          ))}
        </VStack>
        <Text>
          To exercise any of these rights, please contact us at{" "}
          <Link href="mailto:contact@plugandplayagent.com" color="purple.600" fontWeight="600">
            contact@plugandplayagent.com
          </Link>
          . We will respond within 30 days.
        </Text>
      </VStack>
    ),
  },
  {
    number: "06",
    title: "Data Retention & Security",
    icon: Lock,
    iconBg: "red.50",
    iconColor: "red.500",
    content: (
      <VStack align="stretch" gap={4} color="gray.600" fontSize="15px" lineHeight="1.9">
        <Text>
          We retain your personal data for as long as your account is active or as needed
          to provide our Service. Upon account deletion, your data is permanently removed
          within 30 days, except where required by law.
        </Text>
        <Text>
          We implement industry-standard security measures including AES-256 encryption
          at rest, TLS 1.3 in transit, regular security audits, and strict access controls
          to protect your data from unauthorized access, alteration, or disclosure.
        </Text>
      </VStack>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <Box bg="#fafafa" minH="100vh">
      <Navbar />

      {/* Hero */}
      <Box
        pt={{ base: "32", md: "44" }}
        pb={{ base: "16", md: "24" }}
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.100"
        textAlign="center"
      >
        <Container maxW="3xl" mx="auto" px={6}>
          <NextLink href="/" passHref>
            <Button
              variant="ghost"
              size="sm"
              mb={8}
              color="purple.600"
              _hover={{ bg: "purple.50" }}
              fontWeight="600"
            >
              <ArrowLeft size={15} style={{ marginRight: "6px" }} />
              Back to Home
            </Button>
          </NextLink>

          {/* Badge */}
          <Flex justify="center" mb={5}>
            <Box
              px={4} py={1.5}
              bg="purple.50"
              color="purple.700"
              borderRadius="full"
              fontSize="xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.08em"
            >
              Legal
            </Box>
          </Flex>

          <Heading
            as="h1"
            fontSize={{ base: "4xl", md: "6xl" }}
            fontWeight="800"
            color="gray.900"
            mb={5}
            letterSpacing="-0.03em"
            lineHeight="1.1"
          >
            Privacy Policy
          </Heading>

          <Text
            fontSize={{ base: "lg", md: "xl" }}
            color="gray.500"
            maxW="xl"
            mx="auto"
            lineHeight="1.7"
            mb={8}
          >
            Your privacy is our priority. We are committed to protecting your data
            and being fully transparent about how we use it.
          </Text>

          <Flex
            justify="center"
            align="center"
            gap={3}
            fontSize="sm"
            color="gray.400"
          >
            <Box w={1.5} h={1.5} borderRadius="full" bg="green.400" />
            <Text>Last Updated: <Text as="span" fontWeight="600" color="gray.600">March 17, 2026</Text></Text>
          </Flex>
        </Container>
      </Box>

      {/* Table of Contents */}
      <Container maxW="3xl" mx="auto" px={6} pt={12} pb={2}>
        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="2xl"
          p={{ base: 6, md: 8 }}
        >
          <Text
            fontSize="xs"
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing="0.1em"
            color="gray.400"
            mb={5}
          >
            Contents
          </Text>
          <Flex wrap="wrap" gap={3}>
            {sections.map((s) => (
              <Box
                key={s.number}
                px={4} py={2}
                bg="gray.50"
                borderRadius="full"
                fontSize="13px"
                fontWeight="600"
                color="gray.600"
                cursor="pointer"
                _hover={{ bg: "purple.50", color: "purple.700" }}
                transition="all 0.2s"
              >
                {s.number}. {s.title}
              </Box>
            ))}
            <Box
              px={4} py={2}
              bg="gray.50"
              borderRadius="full"
              fontSize="13px"
              fontWeight="600"
              color="gray.600"
              cursor="pointer"
              _hover={{ bg: "purple.50", color: "purple.700" }}
              transition="all 0.2s"
            >
              07. Account Deletion
            </Box>
            <Box
              px={4} py={2}
              bg="gray.50"
              borderRadius="full"
              fontSize="13px"
              fontWeight="600"
              color="gray.600"
              cursor="pointer"
              _hover={{ bg: "purple.50", color: "purple.700" }}
              transition="all 0.2s"
            >
              08. Contact Us
            </Box>
          </Flex>
        </Box>
      </Container>

      {/* Main Content */}
      <Container maxW="3xl" mx="auto" px={6} py={12}>
        <VStack align="stretch" gap={6}>
          {sections.map((section, i) => (
            <Box
              key={section.number}
              bg="white"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="2xl"
              p={{ base: 6, md: 10 }}
              boxShadow="0 1px 3px rgba(0,0,0,0.04)"
              _hover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)", borderColor: "gray.200" }}
              transition="all 0.2s"
            >
              <Flex align="center" gap={4} mb={7}>
                <Circle size="11" bg={section.iconBg}>
                  <Box color={section.iconColor}>
                    <section.icon size={20} />
                  </Box>
                </Circle>
                <Box>
                  <Text
                    fontSize="11px"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.1em"
                    color="gray.400"
                    mb={0.5}
                  >
                    Section {section.number}
                  </Text>
                  <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} fontWeight="700" color="gray.900">
                    {section.title}
                  </Heading>
                </Box>
              </Flex>
              {section.content}
            </Box>
          ))}

          {/* Account Deletion — special red card */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="red.100"
            borderRadius="2xl"
            p={{ base: 6, md: 10 }}
            boxShadow="0 1px 3px rgba(0,0,0,0.04)"
          >
            <Flex align="center" gap={4} mb={7}>
              <Circle size="11" bg="red.50">
                <Box color="red.500">
                  <Trash2 size={20} />
                </Box>
              </Circle>
              <Box>
                <Text fontSize="11px" fontWeight="700" textTransform="uppercase"
                  letterSpacing="0.1em" color="gray.400" mb={0.5}>
                  Section 07
                </Text>
                <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} fontWeight="700" color="gray.900">
                  Account Deletion
                </Heading>
              </Box>
            </Flex>
            <Text color="gray.600" fontSize="15px" lineHeight="1.9" mb={6}>
              You have the right to delete your Plug and Play Agent account at any time.
              This will permanently remove your Brand DNA data, content history, and
              disconnect all Instagram integrations. Data is fully purged within 30 days.
            </Text>
            <NextLink href="/settings/delete-account" passHref>
              <Button
                colorPalette="red"
                variant="subtle"
                size="md"
                borderRadius="xl"
                fontWeight="700"
              >
                <Trash2 size={15} style={{ marginRight: "6px" }} />
                Go to Account Deletion
              </Button>
            </NextLink>
          </Box>

          {/* Contact Us */}
          <Box
            bg="white"
            border="1px solid"
            borderColor="purple.100"
            borderRadius="2xl"
            p={{ base: 6, md: 10 }}
            boxShadow="0 1px 3px rgba(0,0,0,0.04)"
          >
            <Flex align="center" gap={4} mb={7}>
              <Circle size="11" bg="purple.50">
                <Box color="purple.600">
                  <Mail size={20} />
                </Box>
              </Circle>
              <Box>
                <Text fontSize="11px" fontWeight="700" textTransform="uppercase"
                  letterSpacing="0.1em" color="gray.400" mb={0.5}>
                  Section 08
                </Text>
                <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} fontWeight="700" color="gray.900">
                  Contact Us
                </Heading>
              </Box>
            </Flex>
            <Text color="gray.600" fontSize="15px" lineHeight="1.9" mb={6}>
              If you have any questions about this Privacy Policy or how we handle your
              data, please don't hesitate to reach out. We aim to respond within 48 hours.
            </Text>
            <Box
              bg="gray.50"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="xl"
              p={6}
            >
              <Flex direction={{ base: "column", sm: "row" }} gap={8}>
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="gray.400"
                    textTransform="uppercase" letterSpacing="0.1em" mb={2}>
                    Privacy Inquiries
                  </Text>
                  <Link
                    href="mailto:contact@plugandplayagent.com"
                    color="purple.600"
                    fontWeight="700"
                    fontSize="15px"
                    _hover={{ color: "purple.800" }}
                  >
                    contact@plugandplayagent.com
                  </Link>
                </Box>
                <Separator orientation="vertical" display={{ base: "none", sm: "block" }} />
                <Box>
                  <Text fontSize="11px" fontWeight="700" color="gray.400"
                    textTransform="uppercase" letterSpacing="0.1em" mb={2}>
                    Response Time
                  </Text>
                  <Text color="gray.600" fontWeight="600" fontSize="15px">
                    Within 48 hours
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>

          {/* Footer Note */}
          <Box textAlign="center" py={4}>
            <Text fontSize="sm" color="gray.400">
              © 2026 Plug and Play Agent. Built for Instagram growth.{" "}
              <NextLink href="/terms" passHref>
                <Link color="purple.500" fontWeight="600" _hover={{ color: "purple.700" }}>
                  Terms of Service
                </Link>
              </NextLink>
              {" · "}
              <NextLink href="/cookies" passHref>
                <Link color="purple.500" fontWeight="600" _hover={{ color: "purple.700" }}>
                  Cookie Preferences
                </Link>
              </NextLink>
            </Text>
          </Box>
        </VStack>
      </Container>

      <Footer />
    </Box>
  );
}
