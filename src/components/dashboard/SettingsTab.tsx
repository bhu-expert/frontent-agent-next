"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  VStack,
  Link,
} from "@chakra-ui/react";
import { Check } from "lucide-react";
import NextLink from "next/link";
import { SUPPORT_EMAIL } from "@/constants/contact";

// ─── Shared styles ────────────────────────────────────────────────────────────

const CARD_STYLE = {
  bg: "white",
  border: "1px solid",
  borderColor: "#ECECEC",
  borderRadius: "24px",
  p: { base: 5, md: 8 } as Record<string, number>,
  boxShadow: "0 12px 48px rgba(0,0,0,0.04)",
} as const;

const INPUT_STYLE = {
  border: "1px solid",
  borderColor: "#E5E7EB",
  borderRadius: "12px",
  px: "14px",
  py: "10px",
  fontSize: "14px",
  color: "#374151",
  bg: "#FAFAFA",
  w: "full",
} as const;

const SECTION_LABEL_STYLE = {
  fontSize: "11px" as const,
  fontWeight: "700" as const,
  textTransform: "uppercase" as const,
  color: "#9CA3AF",
  letterSpacing: "0.06em",
  mb: 1,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReadOnlyInput({ label, value }: { label: string; value: string }) {
  return (
    <Box w="full">
      <Text {...SECTION_LABEL_STYLE}>{label}</Text>
      <Box {...INPUT_STYLE} cursor="default" userSelect="none">
        {value}
      </Box>
    </Box>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Flex align="center" justify="space-between" gap={4}>
      <Box flex={1} minW={0}>
        <Text fontSize="14px" fontWeight="600" color="#111111">
          {label}
        </Text>
        <Text fontSize="13px" color="#9CA3AF" mt={0.5}>
          {description}
        </Text>
      </Box>
      <Box
        as="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        w="44px"
        h="24px"
        borderRadius="999px"
        bg={checked ? "#4F46E5" : "#E5E7EB"}
        position="relative"
        flexShrink={0}
        transition="background 0.2s ease"
        border="none"
        cursor="pointer"
      >
        <Box
          position="absolute"
          top="3px"
          left={checked ? "23px" : "3px"}
          w="18px"
          h="18px"
          borderRadius="full"
          bg="white"
          boxShadow="0 1px 4px rgba(0,0,0,0.18)"
          transition="left 0.2s ease"
        />
      </Box>
    </Flex>
  );
}

function PlanFeatureRow({ label }: { label: string }) {
  return (
    <Flex align="center" gap={2.5}>
      <Flex
        w="18px"
        h="18px"
        borderRadius="full"
        bg="#ECFDF5"
        align="center"
        justify="center"
        flexShrink={0}
      >
        <Check size={11} strokeWidth={3} color="#16A34A" />
      </Flex>
      <Text fontSize="14px" color="#374151">
        {label}
      </Text>
    </Flex>
  );
}

function SectionDivider() {
  return <Box h="1px" bg="#F3F4F6" my={2} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SettingsTab() {
  const router = useRouter();

  // Notification toggles
  const [emailDigests, setEmailDigests] = useState(true);
  const [postAlerts, setPostAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  // Placeholder user
  const USER_DISPLAY_NAME = "Your Name";
  const USER_EMAIL = "you@example.com";
  const AVATAR_INITIALS = "U";

  return (
    <VStack align="stretch" gap={8}>
      {/* Page heading */}
      <Box>
        <Text
          fontSize={{ base: "3xl", md: "4xl" }}
          fontWeight="700"
          color="#111111"
          lineHeight="1.05"
          mb={2}
        >
          Settings
        </Text>
        <Text fontSize="15px" color="#6B7280">
          Manage your profile, notifications, billing, and account.
        </Text>
      </Box>

      {/* ── 1. Profile ── */}
      <Box {...CARD_STYLE}>
        <Text fontSize="18px" fontWeight="700" color="#111111" mb={6}>
          Profile
        </Text>

        <Flex align="center" gap={4} mb={6}>
          {/* Avatar */}
          <Flex
            w="56px"
            h="56px"
            borderRadius="18px"
            bg="#4F46E5"
            color="white"
            fontSize="20px"
            fontWeight="800"
            align="center"
            justify="center"
            flexShrink={0}
          >
            {AVATAR_INITIALS}
          </Flex>
          <Box>
            <Text fontSize="16px" fontWeight="700" color="#111111">
              {USER_DISPLAY_NAME}
            </Text>
            <Text fontSize="13px" color="#6B7280">
              {USER_EMAIL}
            </Text>
          </Box>
        </Flex>

        <VStack align="stretch" gap={4} mb={6}>
          <ReadOnlyInput label="Full Name" value={USER_DISPLAY_NAME} />
          <ReadOnlyInput label="Email Address" value={USER_EMAIL} />
        </VStack>

        <Button
          variant="outline"
          borderColor="#D1D5DB"
          color="#4F46E5"
          bg="white"
          borderRadius="12px"
          h="42px"
          px={5}
          fontSize="14px"
          fontWeight="600"
          _hover={{ bg: "#F5F5FF", borderColor: "#C7D2FE" }}
        >
          Edit Profile
        </Button>
      </Box>

      <SectionDivider />

      {/* ── 2. Notifications ── */}
      <Box {...CARD_STYLE}>
        <Text fontSize="18px" fontWeight="700" color="#111111" mb={6}>
          Notifications
        </Text>

        <VStack align="stretch" gap={5}>
          <ToggleRow
            label="Email digests"
            description="Receive a weekly summary of your content performance."
            checked={emailDigests}
            onToggle={() => setEmailDigests((v) => !v)}
          />
          <Box h="1px" bg="#F3F4F6" />
          <ToggleRow
            label="Post published alerts"
            description="Get notified when a scheduled post is successfully published."
            checked={postAlerts}
            onToggle={() => setPostAlerts((v) => !v)}
          />
          <Box h="1px" bg="#F3F4F6" />
          <ToggleRow
            label="Weekly performance report"
            description="A curated report on reach, engagement, and top-performing posts."
            checked={weeklyReport}
            onToggle={() => setWeeklyReport((v) => !v)}
          />
        </VStack>
      </Box>

      <SectionDivider />

      {/* ── 3. Plan & Billing ── */}
      <Box {...CARD_STYLE}>
        <Flex
          align={{ base: "flex-start", sm: "center" }}
          justify="space-between"
          direction={{ base: "column", sm: "row" }}
          gap={3}
          mb={6}
        >
          <Text fontSize="18px" fontWeight="700" color="#111111">
            Plan &amp; Billing
          </Text>
          {/* Free Plan badge */}
          <Box
            px={3}
            py={1}
            bg="#F3F4F6"
            border="1px solid"
            borderColor="#E5E7EB"
            borderRadius="999px"
          >
            <Text fontSize="12px" fontWeight="700" color="#374151">
              Free Plan
            </Text>
          </Box>
        </Flex>

        <VStack align="stretch" gap={2.5} mb={6}>
          <PlanFeatureRow label="Up to 3 brand profiles" />
          <PlanFeatureRow label="10 posts per month" />
          <PlanFeatureRow label="Basic analytics" />
        </VStack>

        <Button
          bg="#4F46E5"
          color="white"
          borderRadius="12px"
          h="44px"
          px={6}
          fontSize="14px"
          fontWeight="600"
          boxShadow="0 6px 16px rgba(79,70,229,0.22)"
          _hover={{
            bg: "#4338CA",
            boxShadow: "0 10px 24px rgba(79,70,229,0.28)",
          }}
        >
          Upgrade to Pro
        </Button>
      </Box>

      <SectionDivider />

      {/* ── 4. Danger Zone ── */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="#FECACA"
        borderRadius="24px"
        p={{ base: 5, md: 8 }}
        boxShadow="0 12px 48px rgba(0,0,0,0.04)"
      >
        <Text fontSize="18px" fontWeight="700" color="#991B1B" mb={2}>
          Danger Zone
        </Text>
        <Text fontSize="14px" color="#9CA3AF" mb={6} lineHeight="1.55">
          Deleting your account is permanent and irreversible. All your brands,
          generated content, and connected integrations will be removed
          immediately with no option to recover.
        </Text>

        <VStack align="stretch" gap={3}>
          <Button
            variant="outline"
            borderColor="#FECACA"
            color="#DC2626"
            bg="white"
            borderRadius="12px"
            h="42px"
            px={5}
            fontSize="14px"
            fontWeight="600"
            _hover={{ bg: "#FEF2F2", borderColor: "#FCA5A5" }}
            onClick={() => router.push("/settings/delete-account")}
          >
            Delete Account
          </Button>

          <Text fontSize="12px" color="#9CA3AF" textAlign="center">
            Or use our{" "}
            <Link
              as={NextLink}
              href="/settings/delete-account"
              color="#DC2626"
              textDecoration="underline"
            >
              direct account deletion link
            </Link>
          </Text>

          <Box h="1px" bg="#F3F4F6" my={2} />

          <Text fontSize="12px" color="#6B7280" textAlign="center">
            Need help? Contact{" "}
            <Link
              href={`mailto:${SUPPORT_EMAIL}`}
              color="#4F46E5"
              textDecoration="underline"
            >
              {SUPPORT_EMAIL}
            </Link>
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
}
