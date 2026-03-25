"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Flex,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import {
  LayoutGrid,
  FileText,
  ImageIcon,
  Calendar,
  Grid2X2,
  Settings,
  Rocket,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SUPPORT_EMAIL } from "@/constants/contact";

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTIONS = [
  { id: "getting-started", label: "Getting Started", icon: Rocket },
  { id: "brands", label: "Brands", icon: LayoutGrid },
  { id: "content", label: "Content Generation", icon: FileText },
  { id: "assets", label: "Assets & Publishing", icon: ImageIcon },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "integrations", label: "Integrations", icon: Grid2X2 },
  { id: "settings", label: "Settings", icon: Settings },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <Text
      id={id}
      fontSize={{ base: "22px", md: "26px" }}
      fontWeight="800"
      color="#111111"
      mb={4}
      mt={2}
      scrollMarginTop="100px"
    >
      {children}
    </Text>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text fontSize="17px" fontWeight="700" color="#1a1a2e" mb={2} mt={6}>
      {children}
    </Text>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <Text fontSize="15px" color="#4B5563" lineHeight="1.75" mb={3}>
      {children}
    </Text>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <VStack align="stretch" gap={2} mb={4}>
      {steps.map((step, i) => (
        <Flex key={i} gap={3} align="flex-start">
          <Flex
            flexShrink={0}
            w="22px"
            h="22px"
            borderRadius="full"
            bg="#4F46E5"
            color="white"
            fontSize="11px"
            fontWeight="700"
            align="center"
            justify="center"
            mt="2px"
          >
            {i + 1}
          </Flex>
          <Text fontSize="15px" color="#4B5563" lineHeight="1.7">
            {step}
          </Text>
        </Flex>
      ))}
    </VStack>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <VStack align="stretch" gap={1.5} mb={4} pl={2}>
      {items.map((item, i) => (
        <Flex key={i} gap={2.5} align="flex-start">
          <Text color="#4F46E5" mt="6px" fontSize="8px">●</Text>
          <Text fontSize="15px" color="#4B5563" lineHeight="1.7">{item}</Text>
        </Flex>
      ))}
    </VStack>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      bg="#EEF2FF"
      border="1px solid"
      borderColor="#C7D2FE"
      borderRadius="12px"
      px={5}
      py={4}
      mb={5}
    >
      <Text fontSize="14px" color="#3730A3" lineHeight="1.7">
        {children}
      </Text>
    </Box>
  );
}

function Divider() {
  return <Box borderTop="1px solid" borderColor="#ECECEC" my={10} />;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DocPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = SECTIONS.map(({ id }) => document.getElementById(id)).filter(Boolean);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    headings.forEach((el) => observerRef.current!.observe(el!));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box minH="100vh" bg="white" display="flex" flexDirection="column">
      <Navbar />

      {/* Hero */}
      <Box
        pt={{ base: "28", md: "36" }}
        pb={{ base: "10", md: "14" }}
        borderBottom="1px solid"
        borderColor="#ECECEC"
        bg="linear-gradient(180deg, #F8F8FF 0%, #FFFFFF 100%)"
      >
        <Container maxW="5xl" px={{ base: 5, md: 8 }}>
          <Flex align="center" gap={3} mb={3}>
            <Box
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="#EEF2FF"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <BookOpen size={18} color="#4F46E5" />
            </Box>
            <Text fontSize="13px" fontWeight="600" color="#4F46E5" letterSpacing="0.04em" textTransform="uppercase">
              Documentation
            </Text>
          </Flex>
          <Text
            fontSize={{ base: "32px", md: "44px" }}
            fontWeight="800"
            color="#111111"
            lineHeight="1.1"
            letterSpacing="-0.02em"
            mb={3}
          >
            Plug and Play Agents
          </Text>
          <Text fontSize={{ base: "15px", md: "17px" }} color="#6B7280" maxW="560px" lineHeight="1.65">
            Everything you need to know — from creating your first brand to publishing AI-generated content on Instagram.
          </Text>
        </Container>
      </Box>

      {/* Body */}
      <Container maxW="5xl" px={{ base: 5, md: 8 }} flex={1}>
        <Flex gap={12} pt={10} pb={20} align="flex-start">

          {/* ── Left sidebar ── */}
          <Box
            as="aside"
            display={{ base: "none", lg: "block" }}
            w="220px"
            flexShrink={0}
            position="sticky"
            top="90px"
          >
            <VStack align="stretch" gap={1}>
              {SECTIONS.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;
                return (
                  <Flex
                    key={id}
                    align="center"
                    gap={2.5}
                    px={3}
                    py={2}
                    borderRadius="10px"
                    cursor="pointer"
                    bg={isActive ? "#EEF2FF" : "transparent"}
                    color={isActive ? "#4F46E5" : "#6B7280"}
                    fontWeight={isActive ? "600" : "500"}
                    fontSize="13.5px"
                    transition="all 0.15s ease"
                    _hover={{ bg: isActive ? "#EEF2FF" : "#F8F8F6", color: isActive ? "#4F46E5" : "#111111" }}
                    onClick={() => scrollTo(id)}
                  >
                    <Icon size={15} />
                    <Text>{label}</Text>
                    {isActive && <ChevronRight size={13} style={{ marginLeft: "auto" }} />}
                  </Flex>
                );
              })}
            </VStack>
          </Box>

          {/* ── Main content ── */}
          <Box flex={1} minW={0}>

            {/* ── Getting Started ── */}
            <SectionHeading id="getting-started">Getting Started</SectionHeading>
            <Para>
              Plug and Play Agents is an AI-powered content platform that generates a full month of Instagram posts
              from your brand identity — automatically. The workflow is: create a brand → approve AI-generated brand
              contexts → generate post variations → review, rate, and publish.
            </Para>

            <SubHeading>Create an account</SubHeading>
            <StepList
              steps={[
                "Visit the homepage and click Sign Up.",
                "Enter your email and create a password.",
                "You will be redirected to the dashboard automatically after login.",
              ]}
            />

            <SubHeading>Dashboard overview</SubHeading>
            <Para>
              The left sidebar gives you access to every part of the platform. All tabs except Support and Settings
              are locked until you create your first brand — this is by design, since all content generation flows
              from your brand context.
            </Para>

            <Callout>
              Create a brand first. Every other feature — content generation, assets, calendar, and integrations —
              depends on having at least one brand with a rated context block.
            </Callout>

            <Divider />

            {/* ── Brands ── */}
            <SectionHeading id="brands">Brands</SectionHeading>
            <Para>
              A Brand is the core unit of the platform. It holds your website, AI-generated brand context, guardrails,
              and industry — and it powers every piece of content you generate.
            </Para>

            <SubHeading>Creating a brand</SubHeading>
            <StepList
              steps={[
                "Click Create Brand in the Brands tab.",
                "Enter your brand name and website URL.",
                "Our AI agent crawls your website using Playwright and extracts brand signals: tone of voice, positioning, target audience, and visual language.",
                "A LangGraph pipeline processes these signals and generates five distinct narrative context blocks.",
                "Each context block represents a different content angle for your brand.",
              ]}
            />

            <SubHeading>Context blocks</SubHeading>
            <Para>
              After analysis you will see five context cards. Each represents a unique narrative angle the AI discovered
              from your website. Read through each one and rate it using the star rating. You need at least one
              approved (rated) context before you can generate content.
            </Para>
            <Para>
              You can regenerate any individual context if it doesn&apos;t feel right for your brand. Regeneration
              keeps all other contexts intact.
            </Para>

            <SubHeading>Guardrails</SubHeading>
            <Para>
              Guardrails let you define hard rules the AI must follow — things it should never say, specific
              disclaimers to always include, or tone boundaries to maintain. Set these once per brand and they
              will be applied to every batch of generated content.
            </Para>

            <SubHeading>Multiple brands</SubHeading>
            <Para>
              You can create and manage multiple brands from the same account. Switch between them using the brand
              tabs at the top of the Brands view. Each brand has its own context blocks, guardrails, and content history.
            </Para>

            <Divider />

            {/* ── Content Generation ── */}
            <SectionHeading id="content">Content Generation</SectionHeading>
            <Para>
              The Content tab is where you configure and trigger AI post generation. Each run produces a batch
              of post variations based on the context blocks and templates you select.
            </Para>

            <SubHeading>How to generate content</SubHeading>
            <StepList
              steps={[
                "Go to the Content tab and select one or more approved context blocks.",
                "Choose one or more content templates (see below).",
                "Optionally add a brief — extra direction such as a promotion, deadline, or theme.",
                "Click Generate. The system creates up to 30 posts (6 combinations × 5 variations each).",
                "Posts appear in your Assets tab once processing is complete.",
              ]}
            />

            <SubHeading>Content templates</SubHeading>
            <Para>Templates define the strategic intent of the generated posts:</Para>
            <BulletList
              items={[
                "Awareness — top-of-funnel concepts focused on reach and brand recall.",
                "Sales / Offer — direct-response angles with clear conversion intent.",
                "Launch — momentum creatives for new products or campaign announcements.",
                "Story / Narrative — brand story and origin-driven content.",
                "Engagement — interactive hooks designed to drive replies and comments.",
              ]}
            />

            <SubHeading>Batch limits</SubHeading>
            <Para>
              Each context + template pairing counts as one combination. The system caps at 6 combinations per
              batch, producing 5 post variations each — a maximum of 30 posts per run. If you select more than
              6 combinations, the system uses the first 6 and trims the rest.
            </Para>

            <SubHeading>Carousel generation</SubHeading>
            <Para>
              The Content tab also supports carousel post generation. Carousels follow the same context and brief
              setup but produce multi-slide formats suited for educational or storytelling content.
            </Para>

            <Callout>
              You must rate at least one context block in the Brands tab before the Generate button becomes active.
              If the button is disabled, return to your brand and rate your contexts.
            </Callout>

            <Divider />

            {/* ── Assets & Publishing ── */}
            <SectionHeading id="assets">Assets &amp; Publishing</SectionHeading>
            <Para>
              The Assets tab is your content library. All generated posts appear here for review, rating, and publishing.
            </Para>

            <SubHeading>Reviewing assets</SubHeading>
            <Para>
              Each asset card shows the generated post copy alongside its image. Read through the copy and look
              at the visual before rating. You can also edit post copy inline before publishing.
            </Para>

            <SubHeading>Rating posts</SubHeading>
            <Para>
              Use the star rating on each asset to mark it as approved. Ratings serve two purposes: they unlock
              publishing for that post, and they help the system learn your preferences over time to improve future
              generations.
            </Para>

            <SubHeading>Image formats</SubHeading>
            <Para>Three image formats are supported when publishing to Instagram:</Para>
            <BulletList
              items={[
                "Stories (9:16) — vertical full-screen format for Instagram Stories.",
                "Feed Square (1:1) — classic square format for the main feed.",
                "Feed 4:5 — portrait format that occupies more vertical space in the feed.",
              ]}
            />

            <SubHeading>Publishing</SubHeading>
            <StepList
              steps={[
                "Select the image format you want to use.",
                "Choose Post Now to publish immediately, or pick a scheduled date and time.",
                "Confirm. The post is sent to your connected Instagram account via the Meta API.",
              ]}
            />

            <SubHeading>Downloading assets</SubHeading>
            <Para>
              You can download any generated image directly from the Assets tab using the download button on each
              card — useful if you want to post manually or repurpose the image elsewhere.
            </Para>

            <Divider />

            {/* ── Calendar ── */}
            <SectionHeading id="calendar">Calendar</SectionHeading>
            <Para>
              The Calendar tab gives you a visual overview of your publishing schedule. Every post you schedule
              from the Assets tab appears here so you can see your content cadence at a glance.
            </Para>
            <BulletList
              items={[
                "View all scheduled posts by day, week, or month.",
                "Click a scheduled post to view its details or make changes.",
                "Identify gaps in your publishing schedule and fill them from Assets.",
              ]}
            />

            <Divider />

            {/* ── Integrations ── */}
            <SectionHeading id="integrations">Integrations</SectionHeading>
            <Para>
              Connect your social accounts in the Integrations tab to enable publishing directly from the platform.
            </Para>

            <SubHeading>Instagram</SubHeading>
            <StepList
              steps={[
                "Go to the Integrations tab and click Connect under the Instagram card.",
                "You will be redirected to Meta's Business OAuth authorisation flow.",
                "Grant the requested permissions and return to the dashboard.",
                "Your account is now connected and you can publish from the Assets tab.",
              ]}
            />
            <Callout>
              You must use an Instagram Business or Creator account. Personal accounts are not supported by
              the Meta API and cannot be connected.
            </Callout>

            <SubHeading>Coming soon</SubHeading>
            <Para>
              TikTok, LinkedIn, and X / Twitter integrations are on the roadmap and will be available in future
              updates.
            </Para>

            <Divider />

            {/* ── Settings ── */}
            <SectionHeading id="settings">Settings</SectionHeading>

            <SubHeading>Profile</SubHeading>
            <Para>
              Update your display name, profile avatar, and email. You can also change your password from the
              Profile section — enter your current password, then your new one, and confirm.
            </Para>

            <SubHeading>Notifications</SubHeading>
            <Para>
              Control which email notifications you receive — such as alerts when a content batch finishes
              processing, or reminders for upcoming scheduled posts.
            </Para>

            <SubHeading>Plan &amp; Billing</SubHeading>
            <Para>
              View your current plan and manage your subscription. You can cancel at any time from this section.
              Your access continues until the end of the current billing period and you will not be charged again
              after cancellation.
            </Para>

            <SubHeading>Connected accounts</SubHeading>
            <Para>
              See all social accounts linked to your profile and disconnect them from here if needed. Disconnecting
              an account prevents future posts from being published to it but does not delete previously scheduled posts.
            </Para>

            <Divider />

            {/* ── Contact ── */}
            <Box
              bg="#F8F8FF"
              border="1px solid"
              borderColor="#E0E7FF"
              borderRadius="20px"
              p={{ base: 6, md: 8 }}
            >
              <Text fontSize="18px" fontWeight="700" color="#111111" mb={2}>
                Still have questions?
              </Text>
              <Text fontSize="14px" color="#6B7280" mb={5}>
                Our support team replies within one business day.
              </Text>
              <Link
                href={`mailto:${SUPPORT_EMAIL}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#4F46E5",
                  color: "white",
                  padding: "10px 22px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Contact support →
              </Link>
            </Box>

          </Box>
        </Flex>
      </Container>

      <Footer />
    </Box>
  );
}
