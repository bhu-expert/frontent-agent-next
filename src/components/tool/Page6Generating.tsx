"use client";

import { useEffect, useState } from "react";
import { Box, Flex, Text, VStack, Spinner, Icon } from "@chakra-ui/react";
import { Check } from "lucide-react";

const STEPS = ["Loading selected context", "Applying template structure", "Composing slides", "Writing caption & hashtags", "Generating image prompts", "Finalising output"];

interface Props {
  onDone: () => void;
}

export default function Page6Generating({ onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const dur = 5000;
    const start = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / dur) * 100, 100);
      setProgress(pct);
      setActiveStep(Math.min(Math.floor((elapsed / dur) * 6), 5));
      if (elapsed >= dur) {
        clearInterval(iv);
        setTimeout(onDone, 400);
      }
    }, 60);
    return () => clearInterval(iv);
  }, [onDone]);

  return (
    <Box w="full" px={4} minH="calc(100vh - 140px)" display="flex" alignItems="center" justifyContent="center" position="relative" overflow="hidden">
      <Box 
        position="absolute" 
        top="50%" left="50%" transform="translate(-50%, -50%)" 
        w="480px" h="480px" 
        bg="radial-gradient(circle, rgba(79,63,237,.09), transparent 70%)" 
        zIndex={0} 
        pointerEvents="none"
      />
      
      <Box position="relative" zIndex={1} w="full" maxW="400px" textAlign="center">
        <Flex justify="center" mb={6}>
          <Spinner boxSize="xl" color="blue.500" borderWidth="3px" animationDuration="0.8s" />
        </Flex>
        
        <Text fontSize="2xl" fontWeight="black" letterSpacing="tight" mb={2} color="gray.900" fontFamily="display">
          Generating Your Content
        </Text>
        <Text color="gray.500" fontSize="sm" fontWeight="medium" mb={6}>
          Hang tight — crafting something great
        </Text>
        
        <Box w="full" bg="gray.100" h={2} rounded="full" overflow="hidden" mb={8}>
          <Box h="full" bg="blue.500" w={`${progress}%`} transition="width 0.1s linear" />
        </Box>
        
        <Box bg="white" p={{ base: 4, md: 6 }} rounded="2xl" shadow="sm" border="1px solid" borderColor="gray.100" textAlign="left">
          <VStack align="stretch" gap={0}>
            {STEPS.map((label, i) => {
              const isPast = i < activeStep;
              const isCurrent = i === activeStep;
              const isFuture = i > activeStep;
              
              let color = "gray.400";
              let bg = "gray.50";
              if (isPast) { color = "green.500"; bg = "green.50"; }
              else if (isCurrent) { color = "blue.600"; bg = "blue.50"; }
              
              return (
                <Flex 
                  key={i} 
                  align="center" 
                  gap={3} 
                  p={2.5} 
                  rounded="lg" 
                  transition="all 0.3s"
                  opacity={isFuture ? 0.4 : 1}
                  bg={isCurrent ? "blue.50" : "transparent"}
                >
                  <Flex 
                    w={6} h={6} shrink={0} rounded="full" 
                    bg={bg} color={color} 
                    border="1px solid" borderColor={isCurrent ? "blue.200" : isPast ? "green.200" : "gray.200"}
                    align="center" justify="center" fontSize="xs" fontWeight="bold"
                  >
                    {isPast ? <Icon as={Check} boxSize="12px" /> : i + 1}
                  </Flex>
                  <Text fontSize="sm" fontWeight={isCurrent ? "bold" : "medium"} color={isCurrent ? "gray.900" : isPast ? "gray.700" : "gray.500"}>
                    {label}
                  </Text>
                </Flex>
              );
            })}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
