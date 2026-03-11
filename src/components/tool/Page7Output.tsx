"use client";

import { Box, Flex, Text, Button, SimpleGrid, Badge, Icon, IconButton } from "@chakra-ui/react";
import { ArrowLeft, Download, RotateCcw, Copy, MessageSquare, Hash, Image as ImageIcon, Layers, CheckCircle2 } from "lucide-react";
import { GeneratedContent } from "@/types/tool";

interface Props {
  gen: GeneratedContent;
  onCopy: (text: string) => void;
  onBack: () => void;
  onNewAnalysis: () => void;
}

export default function Page7Output({ gen, onCopy, onBack, onNewAnalysis }: Props) {
  return (
    <Box w="full" px={4} py={12} minH="calc(100vh - 140px)">
      <Box maxW="1140px" mx="auto">
        <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} mb={8} flexWrap="wrap" gap={6} direction={{ base: "column", md: "row" }}>
          <Box>
            <Button 
              size="sm" 
              variant="outline" 
              colorScheme="gray" 
              mb={4} 
              onClick={onBack}
              rounded="full"
            >
              <Icon as={ArrowLeft} boxSize="14px" mr={2} /> Back to Options
            </Button>
            <Flex align="center" gap={3} mb={3}>
              <Box display="inline-flex" alignItems="center" px={3} py={1} rounded="full" bg="green.50" border="1px solid" borderColor="green.200" color="green.700" fontSize="10px" fontWeight="bold" textTransform="uppercase" letterSpacing="widest">
                <Icon as={CheckCircle2} boxSize="16px" />
                Step 7 of 7 — Complete!
              </Box>
            </Flex>
            <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="black" color="gray.900" letterSpacing="tight" mb={1} fontFamily="display">
              Your <Text as="span" color="blue.500">Content</Text>
            </Text>
            <Text fontSize="md" color="gray.500">
              Review your generated carousel, caption, hashtags, and image prompts.
            </Text>
          </Box>
          <Flex gap={3}>
            <Button 
              variant="outline" 
              colorScheme="gray" 
              onClick={() => onCopy(JSON.stringify(gen, null, 2))}
              rounded="xl"
              fontWeight="bold"
            >
              <Icon as={Download} boxSize="16px" /> Export JSON
            </Button>
            <Button 
              colorScheme="blue" 
              bg="blue.600" 
              onClick={onNewAnalysis}
              rounded="xl"
              fontWeight="bold"
            >
              <Icon as={RotateCcw} boxSize="14px" mr={2} /> New Analysis
            </Button>
          </Flex>
        </Flex>

        {/* Slides */}
        <Box mb={8} bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" overflow="hidden" shadow="sm">
          <Flex bg="gray.50" px={6} py={4} borderBottom="1px solid" borderColor="gray.200" align="center" gap={3}>
            <Flex w={8} h={8} rounded="lg" bg="blue.100" color="blue.600" align="center" justify="center">
              <Icon as={Layers} boxSize="16px" />
            </Flex>
            <Text fontSize="md" fontWeight="bold" color="gray.900">Carousel Slides ({gen.slides.length})</Text>
          </Flex>
          <Box p={6}>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
              {gen.slides.map((s) => (
                <Box 
                  key={s.num} 
                  bg="white" 
                  border="1px solid" 
                  borderColor={s.cov ? "blue.200" : "gray.200"} 
                  rounded="xl" 
                  p={5} 
                  position="relative"
                  boxShadow={s.cov ? "0 4px 12px rgba(59, 130, 246, 0.1)" : "none"}
                  display="flex"
                  flexDirection="column"
                >
                  {s.cov && (
                     <Box position="absolute" top={0} left={0} right={0} h="4px" bg="blue.500" borderTopRadius="md" />
                  )}
                  <Flex justify="space-between" align="center" mb={3}>
                    <Flex w={6} h={6} rounded="full" bg={s.cov ? "blue.100" : "gray.100"} color={s.cov ? "blue.600" : "gray.600"} align="center" justify="center" fontSize="xs" fontWeight="black">
                      {s.num}
                    </Flex>
                    <Badge colorScheme={s.cov ? "blue" : "gray"} variant="subtle" fontSize="9px">
                      {s.cov ? "COVER SLIDE" : `SLIDE ${s.num}`}
                    </Badge>
                  </Flex>
                  <Text fontSize="sm" fontWeight="black" color="gray.900" mb={2} lineHeight="1.3">{s.h}</Text>
                  <Text fontSize="xs" color="gray.600" lineHeight="1.6" flex="1">{s.b}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
          {/* Caption */}
          <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" overflow="hidden" shadow="sm">
            <Flex bg="gray.50" px={6} py={4} borderBottom="1px solid" borderColor="gray.200" align="center" justify="space-between">
              <Flex align="center" gap={3}>
                <Flex w={8} h={8} rounded="lg" bg="purple.100" color="purple.600" align="center" justify="center">
                  <Icon as={MessageSquare} boxSize="16px" />
                </Flex>
                <Text fontSize="md" fontWeight="bold" color="gray.900">Caption</Text>
              </Flex>
              <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => onCopy(gen.caption)}>
                <Icon as={Copy} boxSize="14px" /> Copy
              </Button>
            </Flex>
            <Box p={6}>
              <Box bg="gray.50" border="1px solid" borderColor="gray.100" rounded="xl" p={5} whiteSpace="pre-wrap" fontSize="sm" color="gray.800" lineHeight="1.7">
                {gen.caption}
              </Box>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap={8}>
            {/* Hashtags */}
            <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" overflow="hidden" shadow="sm">
              <Flex bg="gray.50" px={6} py={4} borderBottom="1px solid" borderColor="gray.200" align="center" justify="space-between">
                <Flex align="center" gap={3}>
                  <Flex w={8} h={8} rounded="lg" bg="teal.100" color="teal.600" align="center" justify="center">
                    <Icon as={Hash} boxSize="16px" />
                  </Flex>
                  <Text fontSize="md" fontWeight="bold" color="gray.900">Hashtags ({gen.hashtags.length})</Text>
                </Flex>
                <Button size="sm" variant="ghost" colorScheme="blue" onClick={() => onCopy(gen.hashtags.join(" "))}>
                  <Icon as={Copy} boxSize="14px" /> Copy all
                </Button>
              </Flex>
              <Box p={6}>
                <Flex flexWrap="wrap" gap={2}>
                  {gen.hashtags.map((h, i) => (
                    <Text key={i} color="blue.600" fontSize="sm" fontWeight="medium" bg="blue.50" px={2} py={1} rounded="md">
                      {h}
                    </Text>
                  ))}
                </Flex>
              </Box>
            </Box>

            {/* Image Prompts */}
            <Box bg="white" border="1px solid" borderColor="gray.200" rounded="2xl" overflow="hidden" shadow="sm" flex="1">
              <Flex bg="gray.50" px={6} py={4} borderBottom="1px solid" borderColor="gray.200" align="center" gap={3}>
                <Flex w={8} h={8} rounded="lg" bg="orange.100" color="orange.600" align="center" justify="center">
                  <Icon as={ImageIcon} boxSize="16px" />
                </Flex>
                <Text fontSize="md" fontWeight="bold" color="gray.900">Image Prompts ({gen.prompts.length})</Text>
              </Flex>
              <Box p={6}>
                <Box display="flex" flexDirection="column" gap={4}>
                  {gen.prompts.map((p, i) => (
                    <Box key={i} bg="gray.50" border="1px solid" borderColor="gray.100" rounded="xl" p={4}>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Badge colorScheme="orange" variant="subtle" fontSize="10px">{p.lbl}</Badge>
                        <IconButton aria-label="Copy prompt" size="xs" variant="ghost" onClick={() => onCopy(p.txt)}>
                          <Icon as={Copy} boxSize="14px" />
                        </IconButton>
                      </Flex>
                      <Text fontSize="xs" color="gray.700" lineHeight="1.6">{p.txt}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
}
