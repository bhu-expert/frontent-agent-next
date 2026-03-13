"use client";

import { Box, Flex, Heading, Text, Image } from "@chakra-ui/react";
import { motion } from "framer-motion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionBox = motion.create(Box as React.ComponentType<any>);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionFlex = motion.create(Flex as React.ComponentType<any>);

import { USE_CASES, CONTAINER_VARIANTS, CARD_VARIANTS } from "@/constants";

/**
 * Use-cases section with alternating image/text cards showing
 * real-world applications of AdForge across platforms.
 */
export default function UseCases() {
  return (
    <Box as="section" py={{ base: "14", md: "24" }} px={{ base: "4", md: "6" }} id="use-cases">
      <Box maxW="6xl" mx="auto">
        {/* Section Header */}
        <MotionBox
          textAlign="center"
          mb={{ base: "10", md: "16" }}
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <Heading
            as="h2"
            fontSize={{ base: "2xl", sm: "3xl", md: "5xl" }}
            fontWeight="800"
            mb="3"
            lineHeight="1.1"
            color="gray.900"
          >
            Real-life use cases
          </Heading>
          <Text color="gray.500" fontSize={{ base: "sm", md: "lg" }} maxW="2xl" mx="auto">
            See how AdForge turns a website URL into a fully-scheduled, multi-platform ad campaign.
          </Text>
        </MotionBox>

        {/* Cards */}
        <MotionFlex
          direction="column"
          gap={{ base: "5", md: "8" }}
          variants={CONTAINER_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {USE_CASES.map((uc) => (
            <MotionFlex
              key={uc.title}
              direction={{ base: "column", md: uc.direction }}
              align="stretch"
              rounded={{ base: "2xl", md: "3xl" }}
              overflow="hidden"
              bg={uc.bgColor}
              variants={CARD_VARIANTS}
              minH={{ md: "360px" }}
            >
              {/* Text */}
              <Box
                w={{ base: "100%", md: "45%" }}
                p={{ base: "6", md: "12" }}
                display="flex"
                flexDir="column"
                justifyContent="center"
              >
                <Heading
                  as="h3"
                  fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
                  fontWeight="800"
                  mb="4"
                  lineHeight="1.2"
                  color="gray.900"
                >
                  {uc.title}
                </Heading>
                <Flex gap="2" flexWrap="wrap" mb="4">
                  {uc.tags.map((tag) => (
                    <Box
                      key={tag.label}
                      px="3"
                      py="1"
                      bg={tag.bg}
                      color={tag.color}
                      rounded="full"
                      fontSize={{ base: "xs", md: "sm" }}
                      fontWeight="600"
                    >
                      {tag.label}
                    </Box>
                  ))}
                </Flex>
                <Text color="gray.600" fontSize={{ base: "sm", md: "md" }} lineHeight="1.8">
                  {uc.description}
                </Text>
              </Box>

              {/* Image */}
              <Box
                w={{ base: "100%", md: "55%" }}
                overflow="hidden"
                display="flex"
                alignItems="center"
                justifyContent="center"
                p={{ base: "4", md: "6" }}
              >
                <Image
                  src={uc.image}
                  alt={uc.title}
                  rounded="xl"
                  w="100%"
                  h="auto"
                  maxH={{ base: "220px", md: "340px" }}
                  objectFit="contain"
                  boxShadow="0 8px 32px rgba(0,0,0,0.08)"
                />
              </Box>
            </MotionFlex>
          ))}
        </MotionFlex>
      </Box>
    </Box>
  );
}
