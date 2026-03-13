"use client";

import { useState } from "react";
import { Box, Button, Flex, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { BookOpen, ChevronDown, Mail, MessageCircle, PlayCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickLinkCard {
  key: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  linkLabel: string;
  href: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUICK_LINKS: QuickLinkCard[] = [
  {
    key: "docs",
    icon: <BookOpen size={22} strokeWidth={2} />,
    title: "Documentation",
    description: "Step-by-step guides covering every feature in PostGini.",
    linkLabel: "View",
    href: "#",
  },
  {
    key: "videos",
    icon: <PlayCircle size={22} strokeWidth={2} />,
    title: "Video Tutorials",
    description: "Watch walkthroughs for brand creation, content generation, and integrations.",
    linkLabel: "View",
    href: "#",
  },
  {
    key: "discord",
    icon: <MessageCircle size={22} strokeWidth={2} />,
    title: "Community Discord",
    description: "Join our Discord to ask questions and share your campaigns.",
    linkLabel: "View",
    href: "#",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How do I connect my Instagram account?",
    answer:
      "Head to the Integrations tab, then click 'Connect' under the Instagram card. You'll be redirected to the Instagram Business OAuth flow. Make sure you're using a Business or Creator account — personal accounts are not supported.",
  },
  {
    question: "Can I schedule posts in advance?",
    answer:
      "Yes. Once you generate post variations in the Content tab, you can schedule them to publish directly to a connected platform. Use the Calendar tab to visualise and manage your publishing schedule.",
  },
  {
    question: "How does the AI brand analysis work?",
    answer:
      "When you add a brand, our discovery agent crawls your website using Playwright, extracts key brand signals (voice, positioning, audience), and passes them through a LangGraph pipeline that generates five narrative contexts you can approve or regenerate.",
  },
  {
    question: "What platforms do you support?",
    answer:
      "We currently support Meta (Facebook Pages) and Instagram Business. TikTok, LinkedIn, and X/Twitter are on our roadmap and will be available soon.",
  },
  {
    question: "How do I cancel my subscription?",
    answer:
      "You can cancel at any time from Settings → Plan & Billing. Your access continues until the end of the current billing period and you won't be charged again after that.",
  },
];

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

export default function SupportTab() {
  return (
    <VStack align="stretch" gap={10}>
      {/* Page heading */}
      <Box>
        <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="700" color="#111111" lineHeight="1.05" mb={2}>
          Support &amp; Help
        </Text>
        <Text fontSize="15px" color="#6B7280">
          Find answers, watch tutorials, or reach out to the team.
        </Text>
      </Box>

      {/* Quick link cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
        {QUICK_LINKS.map((card) => (
          <Box
            key={card.key}
            bg="white"
            border="1px solid"
            borderColor="#ECECEC"
            borderRadius="24px"
            p={6}
            boxShadow="0 12px 48px rgba(0,0,0,0.04)"
            transition="all 0.2s ease"
            _hover={{ borderColor: "#C7D2FE", boxShadow: "0 16px 56px rgba(79,70,229,0.08)" }}
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
              {card.icon}
            </Flex>
            <Text fontSize="16px" fontWeight="700" color="#111111" mb={1.5}>
              {card.title}
            </Text>
            <Text fontSize="13px" color="#6B7280" lineHeight="1.55" mb={4}>
              {card.description}
            </Text>
            <a
              href={card.href}
              style={{ fontSize: "14px", fontWeight: 600, color: "#4F46E5", textDecoration: "none" }}
            >
              {card.linkLabel} →
            </a>
          </Box>
        ))}
      </SimpleGrid>

      {/* FAQ section */}
      <Box>
        <Text fontSize="xl" fontWeight="700" color="#111111" mb={5}>
          Frequently Asked Questions
        </Text>
        <VStack align="stretch" gap={3}>
          {FAQ_ITEMS.map((item) => (
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
        <Flex align={{ base: "stretch", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={3}>
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
              href="mailto:hi@instaagent.ai"
              style={{ fontSize: "14px", fontWeight: 600, color: "#4F46E5", textDecoration: "none" }}
            >
              hi@instaagent.ai
            </a>
          </Flex>
          <Button
            bg="#4F46E5"
            color="white"
            borderRadius="12px"
            h="44px"
            px={6}
            fontSize="14px"
            fontWeight="600"
            _hover={{ bg: "#4338CA" }}
          >
            Send us a message
          </Button>
        </Flex>
      </Box>
    </VStack>
  );
}
