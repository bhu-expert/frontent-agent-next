"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text, VStack, Spinner, HStack } from "@chakra-ui/react";
import { Check } from "lucide-react";
import { createBrandStream } from "@/api/brand";

const STEPS = [
  "Scraping website content",
  "Extracting brand signals",
  "Analysing tone & positioning",
  "Generating 5 brand contexts",
  "Finalising output",
];

interface Props {
  url: string;
  brandName?: string;
  onDone: () => void;
}

export default function Page2Analysing({ url, brandName, onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function processStream() {
      try {
        const stream = createBrandStream(url, brandName || "");

        for await (const data of stream) {
          if (!active) break;

          if (data.progress !== undefined) {
            setProgress(data.progress);
          }

          if (data.step === "brand_created" && data.brand_id) {
            localStorage.setItem("adforge_brand_id", data.brand_id);
          } else if (data.step === "completed" || data.progress! >= 100) {
            setProgress(100);
            setActiveStep(4);
            setTimeout(() => {
              if (active) onDone();
            }, 600);
            break;
          } else if (
            data.step === "error" ||
            data.step === "orchestration_error"
          ) {
            setErrorMsg(data.message || "An error occurred during analysis.");
            break;
          }

          // Move step forward randomly or via backend index if provided in data.step updates
          if (data.step === "scraping_started") setActiveStep(0);
          if (data.step === "extracting_signals") setActiveStep(1);
          if (data.step === "analysing_tone") setActiveStep(2);
          if (data.step === "generating_contexts") setActiveStep(3);
        }
      } catch (err: any) {
        if (active)
          setErrorMsg(
            err.message || "Failed to connect to the analysis stream.",
          );
      }
    }

    processStream();

    return () => {
      active = false;
    };
  }, [url, brandName, onDone]);

  return (
    <Flex
      minH="calc(100vh - 140px)"
      align="center"
      justify="center"
      position="relative"
      w="full"
      px={4}
      py={12}
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="480px"
        h="480px"
        bg="radial-gradient(circle, rgba(79,63,237,0.09), transparent 70%)"
        zIndex="0"
        pointerEvents="none"
      />

      <Box
        position="relative"
        zIndex="1"
        w="full"
        maxW="480px"
        mx="auto"
        textAlign="center"
      >
        <Flex justify="center" mb={6}>
          <Spinner
            size="lg"
            color="blue.500"
            borderWidth="3px"
            animationDuration="0.65s"
          />
        </Flex>

        <Text
          fontSize="2xl"
          fontWeight="black"
          color="gray.900"
          letterSpacing="tight"
          mb={1}
          fontFamily="display"
        >
          Analysing Your Brand
        </Text>

        <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={6}>
          {url}
        </Text>

        {errorMsg && (
          <Text color="red.500" fontSize="sm" fontWeight="bold" mb={4}>
            {errorMsg}
          </Text>
        )}

        <Box
          w="full"
          h="4px"
          bg="gray.100"
          rounded="full"
          overflow="hidden"
          mb={8}
        >
          <Box
            h="full"
            bg="blue.500"
            w={`${progress}%`}
            transition="width 0.1s linear"
          />
        </Box>

        <Box
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          rounded="2xl"
          p={6}
          boxShadow="xl"
          textAlign="left"
        >
          <VStack align="stretch" gap={4}>
            {STEPS.map((label, i) => {
              const isActive = i === activeStep;
              const isDone = i < activeStep;

              let color = "gray.300";
              let weight = "medium";
              let iconBg = "gray.100";
              let iconColor = "gray.400";
              let iconBorder = "transparent";

              if (isActive) {
                color = "gray.900";
                weight = "bold";
                iconBg = "blue.50";
                iconColor = "blue.600";
                iconBorder = "blue.200";
              } else if (isDone) {
                color = "gray.600";
                iconBg = "green.500";
                iconColor = "white";
                iconBorder = "green.500";
              }

              return (
                <HStack
                  key={i}
                  gap={3}
                  opacity={!isActive && !isDone ? 0.5 : 1}
                  transition="all 0.3s"
                >
                  <Flex
                    w="22px"
                    h="22px"
                    rounded="full"
                    bg={iconBg}
                    color={iconColor}
                    border="1px solid"
                    borderColor={iconBorder}
                    align="center"
                    justify="center"
                    shrink={0}
                    fontSize="11px"
                    fontWeight="bold"
                  >
                    {isDone ? <Check size={12} strokeWidth={3} /> : i + 1}
                  </Flex>
                  <Text fontSize="14px" fontWeight={weight} color={color}>
                    {label}
                  </Text>
                </HStack>
              );
            })}
          </VStack>
        </Box>
      </Box>
    </Flex>
  );
}
