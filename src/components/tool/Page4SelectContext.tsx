"use client";

import { Box, Flex, Text, Button, SimpleGrid, Badge, Icon, VStack, HStack } from "@chakra-ui/react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { BrandContext } from "@/types/tool";
import { CTX_META } from "@/config/toolData";

interface Props {
  ctx: BrandContext[];
  selCtx: number | null;
  onSelect: (id: number) => void;
  onBack: () => void;
  onNext: () => void;
}

const COLORS = [
  { bg: "blue.50", text: "blue.600", border: "blue.200", accent: "blue.500" },
  { bg: "purple.50", text: "purple.600", border: "purple.200", accent: "purple.500" },
  { bg: "pink.50", text: "pink.600", border: "pink.200", accent: "pink.500" },
  { bg: "orange.50", text: "orange.600", border: "orange.200", accent: "orange.500" },
  { bg: "teal.50", text: "teal.600", border: "teal.200", accent: "teal.500" },
];

export default function Page4SelectContext({ ctx, selCtx, onSelect, onBack, onNext }: Props) {
  return (
    <Box w="full" px={4} py={12} minH="calc(100vh - 140px)">
      <Box maxW="840px" mx="auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack} 
          mb={8} 
          rounded="full"
          colorScheme="gray"
        >
          <Icon as={ArrowLeft} boxSize="14px" mr={2} /> Back
        </Button>
        
        <Box textAlign="center" mb={10}>
          <Box display="inline-flex" alignItems="center" px={3} py={1} rounded="full" bg="blue.50" border="1px solid" borderColor="blue.100" color="blue.600" fontSize="11px" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" mb={4}>
            <Box w="6px" h="6px" rounded="full" bg="blue.500" mr={2} animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" />
            Step 4 of 7
          </Box>
          <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="gray.900" letterSpacing="tight" mb={3} fontFamily="display">
            Choose Your <Text as="span" color="blue.500">Context</Text>
          </Text>
          <Text fontSize="md" color="gray.500" maxW="500px" mx="auto">
            Select the positioning angle you want to turn into content.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={5} mb={10}>
          {ctx.map((c) => {
            const idx = c.id - 1;
            const meta = CTX_META[idx];
            const isSel = selCtx === c.id;
            const col = COLORS[idx % 5];
            
            return (
              <Box 
                key={c.id} 
                bg="white" 
                border="2px solid" 
                borderColor={isSel ? col.accent : "gray.200"} 
                rounded="2xl" 
                p={5} 
                cursor="pointer" 
                position="relative" 
                boxShadow={isSel ? `0 4px 20px -5px ${col.accent}40` : "sm"} 
                transition="all 0.2s"
                _hover={!isSel ? { borderColor: "gray.300", transform: "translateY(-2px)", boxShadow: "md" } : { transform: "translateY(-2px)" }}
                onClick={() => onSelect(c.id)}
                display="flex"
                flexDirection="column"
              >
                {isSel && (
                  <Flex position="absolute" top={3} right={3} w={6} h={6} bg={col.accent} rounded="full" align="center" justify="center" color="white" boxShadow="sm">
                    <Icon as={CheckCircle2} boxSize="14px" />
                  </Flex>
                )}
                
                <Badge 
                  bg={col.bg} 
                  color={col.text} 
                  border="1px solid" 
                  borderColor={col.border} 
                  fontSize="9px" 
                  fontWeight="bold" 
                  letterSpacing="wider" 
                  px={2} 
                  py={0.5} 
                  rounded="md" 
                  mb={3} 
                  alignSelf="flex-start"
                >
                  CONTEXT {String(idx + 1).padStart(2, "0")}
                </Badge>
                
                <Text fontSize="15px" fontWeight="bold" color="gray.900" mb={2} lineHeight="1.3">
                  {c.title}
                </Text>
                
                <HStack gap={2} mb={3} flexWrap="wrap">
                  <Badge bg={col.bg} color={col.text} border="1px solid" borderColor={col.border} rounded="md" px={1.5} py={0} textTransform="none" fontSize="10px" fontWeight="bold">
                    {meta?.funnel}
                  </Badge>
                  <Badge bg="gray.100" color="gray.600" border="1px solid" borderColor="gray.200" rounded="md" px={1.5} py={0} textTransform="none" fontSize="10px" fontWeight="bold">
                    {meta?.angle}
                  </Badge>
                </HStack>
                
                <Text fontSize="13px" color="gray.600" lineHeight="1.6" flex="1">
                  {c.body.slice(0, 120)}…
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>
        
        <Flex justify="flex-end" px={{ base: 4, md: 0 }}>
          <Button 
            size="lg"
            disabled={selCtx === null} 
            onClick={onNext}
            colorScheme="blue"
            bg="blue.600"
            color="white"
            _hover={{ bg: "blue.700", transform: "translateY(-1px)", boxShadow: "lg" }}
            rounded="xl"
            fontWeight="bold"
            w={{ base: "full", sm: "auto" }}
          >
            Pick Template & Options →
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
