"use client";

import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Icon,
  Badge,
  Container,
  VStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  LayoutDashboard,
  BarChart2,
  Settings,
  Zap,
  Layout,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionBox = motion.create(Box as any);

const steps = [
  {
    number: "01",
    title: "Paste your website URL",
    description:
      "plugandplayagents reads your website, extracts your brand voice, products, and key messages automatically.",
  },
  {
    number: "02",
    title: "Get 30 posts generated",
    description:
      "Reels, carousels, and single posts — each with a hook, caption, CTA, and hashtag set. Ready in seconds.",
  },
  {
    number: "03",
    title: "Review, approve & schedule",
    description:
      "Edit anything inline, approve what you love, and schedule directly to Instagram from one clean workspace.",
  },
];

export default function UseCases() {
  return (
    <Box
      as="section"
      py={{ base: 24, md: 36 }}
      bg="#F8F8F6"
      id="product"
      style={{ textAlign: "center" }}
    >
      <Container maxW="container.xl">
        {/* Section label + heading */}
        <VStack gap={5} mb={20} align="center">
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
            How it works
          </Badge>
          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "5xl" }}
            fontWeight="800"
            letterSpacing="-0.04em"
            lineHeight="1.08"
            color="gray.900"
            textAlign="center"
            maxW="640px"
            mx="auto"
          >
            From URL to 30 posts in three steps
          </Heading>
          <Text
            fontSize="xl"
            color="gray.500"
            maxW="560px"
            mx="auto"
            lineHeight="1.65"
            textAlign="center"
          >
            No brief. No back-and-forth. Just paste your URL and let
            plugandplayagents build your content calendar.
          </Text>
        </VStack>

        {/* Steps */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={20}>
          {steps.map((step, i) => (
            <MotionBox
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              bg="white"
              p={8}
              borderRadius="28px"
              border="1px solid"
              borderColor="gray.200"
              textAlign="center"
              position="relative"
              _hover={{
                borderColor: "blue.200",
                boxShadow: "0 8px 32px rgba(37,99,235,0.08)",
              }}
              transition2="border-color 0.2s, box-shadow 0.2s"
            >
              <Flex
                w={12}
                h={12}
                bg="blue.50"
                borderRadius="full"
                align="center"
                justify="center"
                mx="auto"
                mb={5}
              >
                <Text fontSize="sm" fontWeight="800" color="blue.600">
                  {step.number}
                </Text>
              </Flex>
              <Heading
                as="h3"
                fontSize="lg"
                fontWeight="700"
                color="gray.900"
                mb={3}
                letterSpacing="-0.02em"
                textAlign="center"
              >
                {step.title}
              </Heading>
              <Text
                fontSize="sm"
                color="gray.500"
                lineHeight="1.7"
                textAlign="center"
              >
                {step.description}
              </Text>
            </MotionBox>
          ))}
        </SimpleGrid>

        {/* Dashboard Showcase */}
        <MotionBox
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          bg="white"
          borderRadius="32px"
          p={{ base: 5, md: 8 }}
          border="1px solid"
          borderColor="gray.200"
          boxShadow="0 12px 48px rgba(0,0,0,0.04)"
        >
          {/* Window controls */}
          <Flex gap={2} mb={8}>
            <Box w={3.5} h={3.5} borderRadius="full" bg="#FF5F57" />
            <Box w={3.5} h={3.5} borderRadius="full" bg="#FEBC2E" />
            <Box w={3.5} h={3.5} borderRadius="full" bg="#28C840" />
          </Flex>

          <SimpleGrid columns={{ base: 1, lg: 12 }} gap={8}>
            {/* Sidebar */}
            <Box gridColumn={{ lg: "span 3" }}>
              <Box
                bg="#F8F8F6"
                borderRadius="20px"
                p={5}
                border="1px solid"
                borderColor="gray.200"
                h="full"
              >
                <Text
                  fontSize="10px"
                  fontWeight="800"
                  color="gray.400"
                  textTransform="uppercase"
                  letterSpacing="0.08em"
                  mb={5}
                  px={3}
                  textAlign="left"
                >
                  Workspace
                </Text>
                <VStack gap={1} align="stretch">
                  <SidebarItem
                    icon={LayoutDashboard}
                    label="Dashboard"
                    isActive
                  />
                  <SidebarItem icon={Zap} label="Generate" />
                  <SidebarItem icon={CheckCircle2} label="Review" />
                  <SidebarItem icon={Calendar} label="Calendar" />
                  <SidebarItem icon={Layout} label="Templates" />
                  <SidebarItem icon={BarChart2} label="Analytics" />
                  <SidebarItem icon={Settings} label="Settings" />
                </VStack>
              </Box>
            </Box>

            {/* Main content */}
            <Box gridColumn={{ lg: "span 9" }}>
              <Box
                bg="#FAFAF8"
                borderRadius="20px"
                p={{ base: 5, md: 7 }}
                border="1px solid"
                borderColor="gray.200"
              >
                <Flex
                  justify="space-between"
                  align="center"
                  mb={8}
                  wrap="wrap"
                  gap={3}
                >
                  <Box textAlign="left">
                    <Heading
                      size="md"
                      fontWeight="800"
                      letterSpacing="-0.03em"
                      color="gray.900"
                    >
                      GrowUpMyTree
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mt={0.5}>
                      Instagram content dashboard
                    </Text>
                  </Box>
                  <Box
                    bg="#ECFDF5"
                    color="#059669"
                    px={4}
                    py={2}
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="800"
                  >
                    30 posts generated
                  </Box>
                </Flex>

                <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4} mb={8}>
                  <StatCard label="Captions Ready" value="30" />
                  <StatCard label="Approved" value="18" />
                  <StatCard label="Scheduled" value="12" />
                </SimpleGrid>

                <VStack gap={3} align="stretch">
                  <ContentRow
                    type="Reel"
                    title="Why owning a tree changes how you value fruit"
                    status="Review"
                    typeBg="#EFF6FF"
                    typeFg="#3B82F6"
                  />
                  <ContentRow
                    type="Carousel"
                    title="5 things most buyers never ask before buying fruit"
                    status="Approve"
                    typeBg="#F0FDF4"
                    typeFg="#16A34A"
                  />
                  <ContentRow
                    type="Post"
                    title="Consistency beats random posting every time"
                    status="Schedule"
                    typeBg="#FFF7ED"
                    typeFg="#EA580C"
                  />
                </VStack>
              </Box>
            </Box>
          </SimpleGrid>
        </MotionBox>
      </Container>
    </Box>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SidebarItem({
  icon,
  label,
  isActive = false,
}: {
  icon: any;
  label: string;
  isActive?: boolean;
}) {
  return (
    <Flex
      align="center"
      gap={3}
      px={4}
      py={3}
      borderRadius="xl"
      cursor="pointer"
      bg={isActive ? "white" : "transparent"}
      color={isActive ? "blue.600" : "gray.500"}
      border={isActive ? "1px solid" : "1px solid transparent"}
      borderColor={isActive ? "gray.200" : "transparent"}
      boxShadow={isActive ? "sm" : "none"}
      fontWeight={isActive ? "700" : "500"}
      _hover={{ color: "blue.500", bg: isActive ? "white" : "gray.50" }}
      transition="all 0.15s"
    >
      <Icon as={icon} boxSize={4} />
      <Text fontSize="13px" textAlign="left">
        {label}
      </Text>
    </Flex>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Box
      bg="white"
      p={5}
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.100"
      textAlign="left"
    >
      <Text
        fontSize="xs"
        fontWeight="700"
        color="gray.500"
        mb={1.5}
        textTransform="uppercase"
        letterSpacing="0.04em"
      >
        {label}
      </Text>
      <Text
        fontSize="3xl"
        fontWeight="800"
        color="gray.900"
        letterSpacing="-0.04em"
        lineHeight={1}
      >
        {value}
      </Text>
    </Box>
  );
}

function ContentRow({
  type,
  title,
  status,
  typeBg,
  typeFg,
}: {
  type: string;
  title: string;
  status: string;
  typeBg: string;
  typeFg: string;
}) {
  return (
    <Flex
      bg="white"
      p={4}
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.100"
      align="center"
      gap={4}
      justify="space-between"
    >
      <Flex align="center" gap={4}>
        <Box
          bg={typeBg}
          color={typeFg}
          px={4}
          py={1.5}
          borderRadius="full"
          fontSize="xs"
          fontWeight="800"
          w="90px"
          textAlign="center"
          flexShrink={0}
        >
          {type}
        </Box>
        <Box textAlign="left">
          <Text fontWeight="700" fontSize="sm" color="gray.900" lineClamp={1}>
            {title}
          </Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>
            Hook + caption + CTA ready
          </Text>
        </Box>
      </Flex>
      <Text
        color="blue.600"
        fontWeight="700"
        fontSize="xs"
        cursor="pointer"
        flexShrink={0}
      >
        {status} →
      </Text>
    </Flex>
  );
}
