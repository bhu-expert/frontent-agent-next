"use client";

import { useState } from "react";
import { Box, Flex, Text, Button, Input, VStack, HStack, Icon } from "@chakra-ui/react";
import { Globe, Linkedin, Check } from "lucide-react";
import { toaster } from "@/components/ui/toaster";
interface Props {
  onAnalyse: (url: string, brandName: string) => void;
}

export default function Page1URL({ onAnalyse }: Props) {
  const [url, setUrl] = useState("");
  const [brandName, setBrandName] = useState("");
  const [err, setErr] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const go = () => {
    if (!url || (!url.startsWith("https://") && !url.startsWith("http://"))) {
      setErr(true);
      return;
    }
    setErr(false);
    onAnalyse(url, brandName);
  };

  return (
    <Flex minH="calc(100vh - 140px)" align="center" justify="center" position="relative" w="full" px={4} py={12}>
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="520px"
        h="520px"
        bg="radial-gradient(circle, #fff, transparent 70%)"
        zIndex="0"
        pointerEvents="none"
      />
      
      <Box position="relative" zIndex="1" w="full" maxW="600px" mx="auto" textAlign="center">
        <Box display="inline-flex" alignItems="center" px={3} py={1} rounded="full" bg="blue.50" border="1px solid" borderColor="blue.100" color="blue.600" fontSize="11px" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" mb={6}>
          <Box w="6px" h="6px" rounded="full" bg="blue.500" mr={2} animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" />
          AI-Powered Brand Analysis
        </Box>
        
        <Text fontSize={{ base: "4xl", md: "5xl" }} fontWeight="black" color="gray.900" lineHeight="1.1" letterSpacing="tight" mb={4} fontFamily="display">
          Decode Your <Text as="span" color="blue.500">Brand DNA</Text>
        </Text>
        
        <Text fontSize={{ base: "md", md: "lg" }} color="gray.500" lineHeight="relaxed" mb={10} maxW="500px" mx="auto">
          Enter your URL. We&apos;ll generate 5 sharp positioning contexts — then turn the best one into ready-to-post content in your chosen format.
        </Text>
        
        <Box bg="white" p={{ base: 6, md: 8 }} rounded="2xl" boxShadow="xl" border="1px solid" borderColor="gray.100" textAlign="left">
          <VStack gap={5} align="stretch" mb={6}>
            <Box>
              <Text fontSize="13px" fontWeight="bold" color="gray.900" mb={1.5} display="flex" alignItems="center" gap={1}>
                Website URL <Text as="span" color="red.500" fontSize="12px">*</Text>
              </Text>
              <Box position="relative">
                <Flex position="absolute" left={3} top={0} bottom={0} align="center" pointerEvents="none" color="gray.400">
                  <Icon as={Globe} boxSize="18px" />
                </Flex>
                <Input 
                  h="48px" 
                  pl="40px"
                  type="url" 
                  placeholder="https://yourwebsite.com" 
                  bg="white"
                  border="1px solid" 
                  borderColor={err ? "red.300" : "gray.200"} 
                  rounded="xl" 
                  fontSize="15px"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" }} 
                  value={url} 
                  onChange={(e) => { setUrl(e.target.value); setErr(false); }} 
                />
              </Box>
              {err && <Text color="red.500" fontSize="12px" mt={1} fontWeight="medium">Please enter a valid URL starting with http:// or https://</Text>}
            </Box>
            
            <Box>
              <Flex justify="space-between" align="center" mb={1.5}>
                <Text fontSize="13px" fontWeight="bold" color="gray.900">YOUR BRAND NAME</Text>
                <Text fontSize="11px" fontWeight="medium" color="gray.400">(Optional)</Text>
              </Flex>
              <Box position="relative">
                <Flex position="absolute" left={3} top={0} bottom={0} align="center" pointerEvents="none" color="gray.400">
                  
                </Flex>
                <Input 
                  h="48px" 
                  pl="40px"
                  type="url" 
                  placeholder="YOUR BRAND NAME" 
                  bg="white"
                  border="1px solid" 
                  borderColor="gray.200" 
                  rounded="xl" 
                  fontSize="15px"
                  _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" }} 
                  value={brandName} 
                  onChange={(e) => setBrandName(e.target.value)} 
                />
              </Box>
            </Box>
          </VStack>

          {/* <Box bg="gray.50" border="1px solid" borderColor="gray.100" rounded="xl" p={4} mb={6}>
            <Text fontSize="10px" fontWeight="bold" letterSpacing="wider" color="gray.500" textTransform="uppercase" mb={3}>
              What you&apos;ll receive
            </Text>
            <VStack align="stretch" gap={2.5}>
              {[
                "5 unique brand positioning contexts",
                "Each with a title + ~300-word copy block",
                "Instagram & LinkedIn templates → caption, hashtags & image prompts"
              ].map((text, i) => (
                <HStack key={i} align="start" gap={3}>
                  <Flex w="18px" h="18px" rounded="full" bg="white" border="1px solid" borderColor="blue.100" align="center" justify="center" shrink={0} mt={0.5}>
                    <Icon as={Check} w="10px" h="10px" color="blue.500" strokeWidth={3} />
                  </Flex>
                  <Text fontSize="13px" color="gray.700" fontWeight="medium" lineHeight="1.4">{text}</Text>
                </HStack>
              ))}
            </VStack>
          </Box>
           */}
          <Button 
            w="full" 
            h="52px" 
            bg="blue.600" 
            color="white" 
            _hover={{ bg: "blue.700", transform: "translateY(-1px)", boxShadow: "lg" }} 
            _active={{ transform: "translateY(0)" }}
            rounded="xl" 
            fontSize="16px"
            fontWeight="bold" 
            onClick={go}
            transition="all 0.2s"
          >
            Analyse My Brand →
          </Button>
          <Text textAlign="center" color="gray.400" fontSize="12px" mt={4} fontWeight="medium">
            No account needed to analyse · Login required to generate
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
