"use client";

import { Flex, Box, Text, HStack, VStack } from "@chakra-ui/react";

const STEPS = ["URL", "Analyse", "Results", "Context", "Template & Options", "Generate", "Output"];

interface Props {
  curStep: number;
  maxReached: number;
  onNav: (step: number) => void;
}

export default function StepBar({ curStep, maxReached, onNav }: Props) {
  return (
    <Box w="100%" bg="white" borderBottom="1px solid" borderColor="gray.200" position="sticky" top="0" zIndex="10" px={4} py={3}>
      <Flex maxW="1200px" mx="auto" align="center" justify="space-between" overflowX="auto" css={{ "&::-webkit-scrollbar": { display: "none" }, msOverflowStyle: "none", scrollbarWidth: "none" }}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < curStep;
          const active = n === curStep;
          const reachable = n <= maxReached && n !== curStep;
          
          let color = "gray.400";
          let bg = "transparent";
          let borderColor = "gray.300";
          
          if (active) {
            color = "white";
            bg = "blue.600";
            borderColor = "blue.600";
          } else if (done) {
            color = "white";
            bg = "green.500";
            borderColor = "green.500";
          } else if (reachable) {
            color = "blue.600";
            borderColor = "blue.600";
          }

          return (
            <HStack key={n} gap={0} flex="1" justify="center" position="relative" minW="120px">
              <VStack
                as="button"
                gap={1}
                onClick={() => (done || reachable) && onNav(n)}
                cursor={(done || reachable) ? "pointer" : "default"}
                opacity={(!done && !active && !reachable) ? 0.6 : 1}
                transition="all 0.2s"
                _hover={(done || reachable) ? { transform: "translateY(-1px)" } : {}}
              >
                <Flex
                  w="28px"
                  h="28px"
                  rounded="full"
                  border="2px solid"
                  borderColor={borderColor}
                  bg={bg}
                  color={color}
                  align="center"
                  justify="center"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  {done ? "✓" : n}
                </Flex>
                <Text fontSize="11px" fontWeight="medium" color={active ? "gray.900" : "gray.500"} textAlign="center" whiteSpace="nowrap">
                  {label}
                </Text>
              </VStack>
              {n < 7 && (
                <Box
                  position="absolute"
                  top="14px"
                  left="calc(50% + 14px)"
                  right="calc(-50% + 14px)"
                  h="2px"
                  bg={done ? "green.500" : "gray.200"}
                  zIndex="-1"
                />
              )}
            </HStack>
          );
        })}
      </Flex>
    </Box>
  );
}
