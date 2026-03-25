"use client";

import { useState } from "react";
import { Box, Flex, Text, VStack } from "@chakra-ui/react";
import { BookOpen, ChevronDown, Mail } from "lucide-react";
import { SUPPORT_EMAIL } from "@/constants/contact";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

// ─── Nav link helper ──────────────────────────────────────────────────────────

function TabLink({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <Text
      as="span"
      color="#4F46E5"
      fontWeight="600"
      cursor={onClick ? "pointer" : "default"}
      textDecoration="underline"
      onClick={onClick}
    >
      {label}
    </Text>
  );
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────

function getFaqItems(nav: {
  onNavigateToAssets?: () => void;
  onNavigateToContent?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToIntegrations?: () => void;
  onNavigateToBrands?: () => void;
}): FaqItem[] {
  return [
    {
      question: "How do I create my first brand?",
      answer: (
        <>
          Go to the <TabLink label="Brands tab" onClick={nav.onNavigateToBrands} /> and click <strong>Create Brand</strong>. Enter your website URL and brand name. Our AI agent crawls your site, extracts key brand signals (voice, positioning, audience), and generates five narrative context blocks. Review and rate each context — you need at least one rated context before generating content.
        </>
      ),
    },
    {
      question: "How does the AI brand analysis work?",
      answer:
        "When you add a brand, our discovery agent crawls your website, extracts signals such as tone of voice, positioning, and target audience, then runs them through a LangGraph pipeline that produces five distinct narrative context blocks. You can approve or regenerate any context individually. These contexts become the foundation for all your AI-generated content.",
    },
    {
      question: "How do I generate content?",
      answer: (
        <>
          Head to the <TabLink label="Content tab" onClick={nav.onNavigateToContent} />. Select one or more approved context blocks, pick your content templates (Awareness, Sales / Offer, Launch, Story / Narrative, or Engagement), and optionally add a brief for extra direction. Each context + template combination produces 5 post variations, up to 30 posts per batch. Generated posts land in your <TabLink label="Assets tab" onClick={nav.onNavigateToAssets} /> once processing is complete.
        </>
      ),
    },
    {
      question: "What content templates are available?",
      answer: (
        <>
          There are five templates:
          <br /><br />
          <strong>Awareness</strong> — top-of-funnel concepts focused on reach and brand recall.<br />
          <strong>Sales / Offer</strong> — direct-response angles with clear conversion intent.<br />
          <strong>Launch</strong> — momentum creatives for new products or campaigns.<br />
          <strong>Story / Narrative</strong> — brand story and origin-driven content.<br />
          <strong>Engagement</strong> — interactive hooks designed to drive responses and comments.
        </>
      ),
    },
    {
      question: "How do I review and publish my generated assets?",
      answer: (
        <>
          Open the <TabLink label="Assets tab" onClick={nav.onNavigateToAssets} />. Each generated post shows its copy and image. Rate posts using the star rating — this helps the system learn your preferences and unlocks publishing. You can post immediately or schedule for later. Supported image formats are Stories (9:16), Feed Square (1:1), and Feed 4:5.
        </>
      ),
    },
    {
      question: "How do I connect my Instagram account?",
      answer: (
        <>
          Go to the <TabLink label="Integrations tab" onClick={nav.onNavigateToIntegrations} /> and click <strong>Connect</strong> under the Instagram card. You will be redirected through Meta&apos;s Business OAuth flow. You must use an Instagram Business or Creator account — personal accounts are not supported.
        </>
      ),
    },
    {
      question: "What platforms are supported?",
      answer:
        "We currently support Instagram Business via Meta OAuth. TikTok, LinkedIn, and X / Twitter are on our roadmap and will be available in a future update.",
    },
    {
      question: "Can I schedule posts in advance?",
      answer: (
        <>
          Yes. After rating your assets in the <TabLink label="Assets tab" onClick={nav.onNavigateToAssets} />, choose to post immediately or pick a scheduled time. Use the <TabLink label="Calendar tab" onClick={nav.onNavigateToCalendar} /> to visualise and manage your full publishing schedule.
        </>
      ),
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "You can cancel at any time from Settings → Plan & Billing. Your access continues until the end of the current billing period and you will not be charged again after that.",
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <Box
      border="1px solid"
      borderColor={open ? "#C7D2FE" : "#ECECEC"}
      borderRadius="16px"
      overflow="hidden"
      transition="border-color 0.2s ease"
      bg="white"
    >
      <Flex
        as="button"
        w="full"
        align="center"
        justify="space-between"
        px={5}
        py={4}
        cursor="pointer"
        onClick={() => setOpen((v) => !v)}
        _hover={{ bg: "#F8F8F6" }}
        transition="background 0.15s ease"
        textAlign="left"
        gap={4}
      >
        <Text fontSize="15px" fontWeight="600" color="#111111">
          {item.question}
        </Text>
        <Box
          flexShrink={0}
          color="#6B7280"
          transition="transform 0.2s ease"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ChevronDown size={18} strokeWidth={2.5} />
        </Box>
      </Flex>

      {open && (
        <Box px={5} pb={5} pt={1}>
          <Text fontSize="14px" color="#6B7280" lineHeight="1.65">
            {item.answer}
          </Text>
        </Box>
      )}
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SupportTabProps {
  onNavigateToAssets?: () => void;
  onNavigateToContent?: () => void;
  onNavigateToCalendar?: () => void;
  onNavigateToIntegrations?: () => void;
  onNavigateToBrands?: () => void;
}

export default function SupportTab({
  onNavigateToAssets,
  onNavigateToContent,
  onNavigateToCalendar,
  onNavigateToIntegrations,
  onNavigateToBrands,
}: SupportTabProps) {
  const faqItems = getFaqItems({
    onNavigateToAssets,
    onNavigateToContent,
    onNavigateToCalendar,
    onNavigateToIntegrations,
    onNavigateToBrands,
  });

  return (
    <VStack align="stretch" gap={10}>
      {/* Page heading */}
      <Box>
        <Text
          fontSize={{ base: "3xl", md: "4xl" }}
          fontWeight="700"
          color="#111111"
          lineHeight="1.05"
          mb={2}
        >
          Support &amp; Help
        </Text>
        <Text fontSize="15px" color="#6B7280">
          Find answers to common questions or reach out to our team directly.
        </Text>
      </Box>

      {/* Documentation card */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="#ECECEC"
        borderRadius="24px"
        p={6}
        boxShadow="0 12px 48px rgba(0,0,0,0.04)"
        transition="all 0.2s ease"
        _hover={{
          borderColor: "#C7D2FE",
          boxShadow: "0 16px 56px rgba(79,70,229,0.08)",
        }}
        maxW="360px"
      >
        <Flex
          w="44px"
          h="44px"
          borderRadius="12px"
          bg="#EEF2FF"
          color="#4F46E5"
          align="center"
          justify="center"
          mb={4}
        >
          <BookOpen size={22} strokeWidth={2} />
        </Flex>
        <Text fontSize="16px" fontWeight="700" color="#111111" mb={1.5}>
          Documentation
        </Text>
        <Text fontSize="13px" color="#6B7280" lineHeight="1.55" mb={4}>
          Step-by-step guides covering every feature in Plug and Play Agents.
        </Text>
        <a
          href="/doc"
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#4F46E5",
            textDecoration: "none",
          }}
        >
          View docs →
        </a>
      </Box>

      {/* FAQ section */}
      <Box>
        <Text fontSize="xl" fontWeight="700" color="#111111" mb={5}>
          Frequently Asked Questions
        </Text>
        <VStack align="stretch" gap={3}>
          {faqItems.map((item) => (
            <FaqRow key={item.question} item={item} />
          ))}
        </VStack>
      </Box>

      {/* Contact section */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="#ECECEC"
        borderRadius="24px"
        p={{ base: 6, md: 8 }}
        boxShadow="0 12px 48px rgba(0,0,0,0.04)"
      >
        <Text fontSize="xl" fontWeight="700" color="#111111" mb={2}>
          Still need help?
        </Text>
        <Text fontSize="14px" color="#6B7280" mb={6}>
          Our support team typically replies within one business day.
        </Text>
        <Flex
          align={{ base: "stretch", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap={3}
        >
          <Flex
            align="center"
            gap={2}
            px={4}
            py={2.5}
            bg="#F8F8F6"
            border="1px solid"
            borderColor="#ECECEC"
            borderRadius="12px"
          >
            <Mail size={16} strokeWidth={2} color="#6B7280" />
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#4F46E5",
                textDecoration: "none",
              }}
            >
              {SUPPORT_EMAIL}
            </a>
          </Flex>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "44px",
              padding: "0 24px",
              background: "#4F46E5",
              color: "white",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Send us a message
          </a>
        </Flex>
      </Box>
    </VStack>
  );
}
