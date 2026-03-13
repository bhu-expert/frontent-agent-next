"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
  Badge,
} from "@chakra-ui/react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionBox = motion.create(Box as any);

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
  badgeText?: string;
  buttonText: string;
}

const PricingCard = ({
  name,
  price,
  description,
  features,
  isFeatured = false,
  badgeText,
  buttonText,
}: PricingCardProps) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4 }}
      flex="1"
      display="flex"
      flexDirection="column"
      position="relative"
      bg={isFeatured ? "blue.600" : "white"}
      border="1px solid"
      borderColor={isFeatured ? "blue.500" : "gray.200"}
      borderRadius="28px"
      p={8}
      boxShadow={
        isFeatured
          ? "0 24px 64px rgba(37,99,235,0.25)"
          : "0 4px 24px rgba(0,0,0,0.04)"
      }
    >
      {isFeatured && badgeText && (
        <Badge
          bg="white"
          color="blue.600"
          borderRadius="full"
          px={3}
          py={1}
          position="absolute"
          top="-14px"
          left="50%"
          transform="translateX(-50%)"
          fontSize="xs"
          fontWeight="800"
          textTransform="uppercase"
          letterSpacing="0.05em"
          boxShadow="0 4px 12px rgba(0,0,0,0.1)"
          whiteSpace="nowrap"
        >
          {badgeText}
        </Badge>
      )}

      {/* Plan name & price */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "20px" }}>
        <Text
          fontSize="sm"
          fontWeight="700"
          color={isFeatured ? "blue.100" : "gray.500"}
          textTransform="uppercase"
          letterSpacing="0.06em"
        >
          {name}
        </Text>
        <Flex align="baseline" gap={1}>
          <Text
            fontSize="5xl"
            fontWeight="800"
            color={isFeatured ? "white" : "gray.900"}
            letterSpacing="-0.04em"
            lineHeight={1}
          >
            ${price}
          </Text>
          <Text fontSize="sm" color={isFeatured ? "blue.200" : "gray.400"} fontWeight="500">
            / mo
          </Text>
        </Flex>
      </div>

      <Text
        fontSize="sm"
        color={isFeatured ? "blue.100" : "gray.500"}
        mb={7}
        lineHeight="1.65"
        minH="40px"
      >
        {description}
      </Text>

      {/* Feature list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, marginBottom: "32px" }}>
        {features.map((feature, i) => (
          <Flex key={i} align="center" gap={3}>
            <Flex
              w={5}
              h={5}
              borderRadius="full"
              bg={isFeatured ? "whiteAlpha.300" : "blue.50"}
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon
                as={Check}
                boxSize={3}
                color={isFeatured ? "white" : "blue.500"}
                strokeWidth={3}
              />
            </Flex>
            <Text
              fontSize="sm"
              fontWeight="500"
              color={isFeatured ? "white" : "gray.700"}
            >
              {feature}
            </Text>
          </Flex>
        ))}
      </div>

      <Button
        w="full"
        h="48px"
        borderRadius="14px"
        fontSize="sm"
        fontWeight="700"
        bg={isFeatured ? "white" : "gray.900"}
        color={isFeatured ? "blue.600" : "white"}
        _hover={{
          bg: isFeatured ? "blue.50" : "gray.700",
          transform: "translateY(-1px)",
        }}
        _active={{ transform: "translateY(0)" }}
        transition="all 0.2s"
      >
        {buttonText}
      </Button>
    </MotionBox>
  );
};

export default function Pricing() {
  return (
    <Box
      as="section"
      py={{ base: 24, md: 40 }}
      bg="white"
      id="pricing"
    >
      {/* Outer container — plain div, guaranteed centered */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        {/* Heading block */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px", marginBottom: "64px" }}>
          <Badge
            bg="blue.50"
            color="blue.600"
            borderRadius="full"
            px={4}
            py={1.5}
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.06em"
            textTransform="uppercase"
          >
            Pricing
          </Badge>

          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="800"
            color="gray.900"
            letterSpacing="-0.04em"
            lineHeight="1.05"
            style={{ textAlign: "center", maxWidth: "560px" }}
          >
            Simple, transparent pricing
          </Heading>

          <Text
            color="gray.500"
            fontSize="xl"
            lineHeight="1.65"
            style={{ textAlign: "center", maxWidth: "440px" }}
          >
            Pick the plan that fits your brand. Upgrade or cancel anytime.
          </Text>

          {/* Monthly / Annually toggle */}
          <div style={{ marginTop: "16px" }}>
            <Flex
              bg="gray.100"
              p={1}
              borderRadius="full"
              display="inline-flex"
            >
              <Button
                size="sm"
                borderRadius="full"
                px={6}
                h="36px"
                bg="white"
                color="gray.900"
                fontWeight="700"
                fontSize="sm"
                boxShadow="sm"
                _hover={{ bg: "white" }}
              >
                Monthly
              </Button>
              <Button
                size="sm"
                borderRadius="full"
                px={6}
                h="36px"
                variant="ghost"
                color="gray.500"
                fontWeight="600"
                fontSize="sm"
                position="relative"
                _hover={{ bg: "transparent", color: "gray.700" }}
              >
                Annually
                <Badge
                  bg="#ECFDF5"
                  color="#059669"
                  position="absolute"
                  top="-22px"
                  right="-8px"
                  borderRadius="full"
                  fontSize="10px"
                  fontWeight="800"
                  px={2}
                  py={0.5}
                  boxShadow="sm"
                >
                  −20%
                </Badge>
              </Button>
            </Flex>
          </div>
        </div>

        {/* Pricing cards */}
        <div style={{
          display: "flex",
          flexDirection: "row",
          gap: "24px",
          maxWidth: "980px",
          margin: "0 auto",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          <PricingCard
            name="Starter"
            price="19"
            description="Perfect for founders building their first personal brand."
            buttonText="Get started"
            features={[
              "50 AI post generations / mo",
              "1 Workspace",
              "Connect 2 social accounts",
              "Basic content templates",
            ]}
          />
          <PricingCard
            name="Pro"
            price="49"
            isFeatured
            badgeText="Most Popular"
            description="For growing brands that need a consistent content engine."
            buttonText="Upgrade to Pro"
            features={[
              "500 AI post generations / mo",
              "3 Workspaces",
              "Unlimited social accounts",
              "Advanced storytelling templates",
              "Invite up to 3 team members",
            ]}
          />
          <PricingCard
            name="Agency"
            price="149"
            description="For agencies managing content across multiple client brands."
            buttonText="Upgrade to Agency"
            features={[
              "Unlimited AI post generations",
              "Unlimited Workspaces",
              "Custom global guardrails",
              "Unlimited team members",
              "Priority email support",
            ]}
          />
        </div>

        {/* Stripe trust */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "64px", color: "#9CA3AF" }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <Text
            fontSize="xs"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.08em"
            color="gray.400"
          >
            Secure payments by Stripe
          </Text>
        </div>

      </div>
    </Box>
  );
}
