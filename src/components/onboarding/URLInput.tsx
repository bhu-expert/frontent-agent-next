"use client";

import { useState } from "react";
import { Box, Flex, Text, Button, Input, Textarea, VStack } from "@chakra-ui/react";
import { Globe } from "lucide-react";
import { URLInputProps } from "@/props/URLInput";

/**
 * URL and brand name input form for starting a brand analysis.
 * Validates input and triggers the analysis flow.
 */
export default function URLInput({ onAnalyse }: URLInputProps) {
  const [url, setUrl] = useState("");
  const [brandName, setBrandName] = useState("");
  const [guardrails, setGuardrails] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState(false);

  const go = () => {
    if (!url || (!url.startsWith("https://") && !url.startsWith("http://"))) {
      setErr(true);
      return;
    }
    setErr(false);
    onAnalyse(url, brandName, guardrails, description);
  };

  return (
    <Flex minH="calc(100vh - 64px)" align="center" justify="center" position="relative" w="full" px={4} py={12}>
      {/* Background blobs */}
      <Box
        position="absolute"
        top="-10%"
        left="-5%"
        w="400px"
        h="400px"
        bg="#e0e7ff"
        rounded="full"
        filter="blur(80px)"
        opacity={0.5}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-5%"
        w="400px"
        h="400px"
        bg="#fae8ff"
        rounded="full"
        filter="blur(80px)"
        opacity={0.5}
        pointerEvents="none"
      />

      <Box position="relative" zIndex="1" w="full" maxW="600px" mx="auto" textAlign="center">

        {/* Heading */}
        <Text
          as="h1"
          fontSize={{ base: "4xl", md: "5xl" }}
          fontWeight="black"
          color="#111827"
          lineHeight="1.1"
          letterSpacing="tight"
          mb={4}
        >
          Decode Your{" "}
          <Text as="span" color="#4F46E5">
            Brand DNA
          </Text>
        </Text>

        {/* Subtitle */}
        <Text
          fontSize={{ base: "md", md: "lg" }}
          color="#6b7280"
          lineHeight="relaxed"
          mb={10}
          maxW="500px"
          mx="auto"
        >
          Enter your URL. We&apos;ll generate 5 sharp positioning contexts — then turn the best one into ready-to-post content in your chosen format.
        </Text>

        {/* Card */}
        <Box
          bg="white"
          p={{ base: 6, md: 8 }}
          rounded="2xl"
          boxShadow="0 4px 20px rgba(0,0,0,0.06)"
          border="1px solid"
          borderColor="gray.100"
          textAlign="left"
        >
          <VStack gap={5} align="stretch" mb={6}>
            {/* URL Input */}
            <Box>
              <Text fontSize="13px" fontWeight="bold" color="#111827" mb={1.5} display="flex" alignItems="center" gap={1}>
                Website URL <Text as="span" color="red.500" fontSize="12px">*</Text>
              </Text>
              <Box position="relative">
                <Flex position="absolute" left={3} top={0} bottom={0} align="center" pointerEvents="none" color="gray.400">
                  <Box as={Globe} boxSize="18px" />
                </Flex>
                <Input
                  data-testid="url-input"
                  h="48px"
                  pl="20px"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  bg="white"
                  color="gray.900"
                  border="1px solid"
                  borderColor={err ? "red.300" : "gray.200"}
                  rounded="xl"
                  fontSize="15px"
                  _focus={{ borderColor: "#4F46E5", boxShadow: "0 0 0 3px rgba(79,70,229,0.12)" }}
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setErr(false); }}
                />
              </Box>
              {err && (
                <Text data-testid="url-error" color="red.500" fontSize="12px" mt={1} fontWeight="medium">
                  Please enter a valid URL starting with http:// or https://
                </Text>
              )}
            </Box>

            {/* Brand Name Input */}
            <Box>
              <Flex justify="space-between" align="center" mb={1.5}>
                <Text fontSize="13px" fontWeight="bold" color="#111827">Brand Name</Text>
              </Flex>
              <Input
                data-testid="brand-name-input"
                h="48px"
                placeholder="Your brand name"
                pl="20px"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                rounded="xl"
                fontSize="15px"
                _focus={{ borderColor: "#4F46E5", boxShadow: "0 0 0 3px rgba(79,70,229,0.12)" }}
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </Box>

            {/* Business Description */}
            <Box>
              <Flex justify="space-between" align="center" mb={1.5}>
                <Text fontSize="13px" fontWeight="bold" color="#111827">Tell us about your business</Text>
                <Text fontSize="11px" color="#9CA3AF">Optional</Text>
              </Flex>
              <Textarea
                placeholder="e.g. We are a fintech startup helping SMBs manage invoices. Our customers are small business owners aged 30–50 who struggle with late payments."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minH="90px"
                px="16px"
                py="12px"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                rounded="xl"
                fontSize="14px"
                resize="vertical"
                lineHeight="1.5"
                _focus={{ borderColor: "#4F46E5", boxShadow: "0 0 0 3px rgba(79,70,229,0.12)" }}
                _placeholder={{ color: "gray.400" }}
              />
              <Text fontSize="12px" color="#9CA3AF" mt={1}>
                Helps the AI generate more relevant brand identities.
              </Text>
            </Box>

            {/* Guardrails Input */}
            <Box>
              <Flex justify="space-between" align="center" mb={1.5}>
                <Text fontSize="13px" fontWeight="bold" color="#111827">Guardrails</Text>
                <Text fontSize="11px" color="#9CA3AF">Optional</Text>
              </Flex>
              <Textarea
                placeholder="e.g. [not investment advice, not a replacement for a doctor, avoid aggressive sales language]"
                value={guardrails}
                onChange={(e) => setGuardrails(e.target.value)}
                minH="90px"
                px="16px"
                py="12px"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                rounded="xl"
                fontSize="14px"
                resize="vertical"
                lineHeight="1.5"
                _focus={{ borderColor: "#4F46E5", boxShadow: "0 0 0 3px rgba(79,70,229,0.12)" }}
                _placeholder={{ color: "gray.400" }}
              />
              <Text fontSize="12px" color="#9CA3AF" mt={1}>
                Constraints applied during brand identity generation.
              </Text>
            </Box>
          </VStack>

          {/* CTA Button */}
          <Button
            data-testid="submit-btn"
            w="full"
            h="52px"
            bg="#4F46E5"
            color="white"
            _hover={{ bg: "#4338CA", transform: "translateY(-1px)", boxShadow: "0 8px 25px rgba(79,70,229,0.35)" }}
            _active={{ transform: "translateY(0)" }}
            rounded="full"
            fontSize="16px"
            fontWeight="bold"
            onClick={go}
            transition="all 0.2s"
            boxShadow="0 4px 14px rgba(79,70,229,0.3)"
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
