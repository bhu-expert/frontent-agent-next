"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Text,
  VStack,
  Input,
  Flex,
  Button,
} from "@chakra-ui/react";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import NextLink from "next/link";
import { forgotPassword } from "@/api";
import { AUTH_MESSAGES } from "@/constants/auth";

type State = "idle" | "loading" | "sent" | "error";

const MSG = AUTH_MESSAGES.FORGOT_PASSWORD;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      setState("error");
      return;
    }

    setState("loading");
    setErrorMsg("");

    try {
      await forgotPassword(trimmed);
      setState("sent");
    } catch (err: any) {
      if (err.status === 429) {
        setErrorMsg(
          "Too many requests. Please wait a few minutes and try again.",
        );
        setState("error");
        return;
      }
      // Success-ish: always show sent state to prevent enumeration
      setState("sent");
    }
  };

  // ── Sent ──────────────────────────────────────────────────────────────────

  if (state === "sent") {
    return (
      <Container maxW="440px" py={20}>
        <Box
          bg="white"
          border="1px solid"
          borderColor="#ECECEC"
          borderRadius="24px"
          p={10}
          boxShadow="0 12px 48px rgba(0,0,0,0.04)"
          textAlign="center"
        >
          <Flex
            w="56px"
            h="56px"
            borderRadius="16px"
            bg="#ECFDF5"
            align="center"
            justify="center"
            mx="auto"
            mb={5}
          >
            <CheckCircle2 size={26} color="#16A34A" />
          </Flex>

          <Text fontSize="22px" fontWeight="700" color="#111111" mb={2}>
            {MSG.SENT_TITLE}
          </Text>
          <Text fontSize="14px" color="#6B7280" lineHeight="1.65" mb={6}>
            {MSG.SENT_DESCRIPTION(email)}
          </Text>

          <Box
            bg="#F8F9FF"
            border="1px solid"
            borderColor="#E0E7FF"
            borderRadius="12px"
            p={4}
            mb={6}
            textAlign="left"
          >
            <Text fontSize="13px" color="#4B5563" lineHeight="1.6">
              <Text as="span" fontWeight="600">
                {MSG.SENT_NOT_RECEIVED}
              </Text>{" "}
              {MSG.SENT_SPAM_NOTICE}{" "}
              <Text
                as="button"
                color="#4F46E5"
                fontWeight="600"
                textDecoration="underline"
                cursor="pointer"
                border="none"
                bg="transparent"
                onClick={() => {
                  setState("idle");
                  setEmail("");
                }}
              >
                {MSG.SENT_TRY_AGAIN}
              </Text>{" "}
              with a different email.
            </Text>
          </Box>

          <Text fontSize="13px" color="#9CA3AF">
            {MSG.SENT_GOOGLE_PROMPT} ({" "}
            <NextLink
              href="/login"
              style={{ color: "#4F46E5", fontWeight: 600 }}
            >
              {MSG.SENT_GOOGLE_LINK}
            </NextLink>
          </Text>
        </Box>
      </Container>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <Container maxW="440px" py={20}>
      <Box
        bg="white"
        border="1px solid"
        borderColor="#ECECEC"
        borderRadius="24px"
        p={10}
        boxShadow="0 12px 48px rgba(0,0,0,0.04)"
      >
        <NextLink href="/login">
          <Flex
            align="center"
            gap={1.5}
            color="#6B7280"
            fontSize="13px"
            fontWeight="600"
            mb={8}
            w="fit-content"
            _hover={{ color: "#4F46E5" }}
            transition="color 0.15s"
          >
            <ArrowLeft size={14} />
            {MSG.BACK_TO_SIGNIN}
          </Flex>
        </NextLink>

        <Flex
          w="52px"
          h="52px"
          borderRadius="14px"
          bg="rgba(79,70,229,0.08)"
          align="center"
          justify="center"
          mb={5}
        >
          <Mail size={22} color="#4F46E5" />
        </Flex>

        <Text fontSize="22px" fontWeight="700" color="#111111" mb={1}>
          {MSG.TITLE}
        </Text>
        <Text fontSize="14px" color="#6B7280" lineHeight="1.6" mb={7}>
          {MSG.DESCRIPTION}
        </Text>

        {/* Google user warning */}
        <Box
          bg="#FFF9F0"
          border="1px solid"
          borderColor="#FDE68A"
          borderRadius="12px"
          px={4}
          py={3}
          mb={6}
        >
          <Flex align="flex-start" gap={2.5}>
            <AlertCircle
              size={15}
              color="#D97706"
              style={{ marginTop: "2px", flexShrink: 0 }}
            />
            <Text fontSize="13px" color="#92400E" lineHeight="1.55">
              {MSG.GOOGLE_WARNING}{" "}
              <NextLink
                href="/login"
                style={{
                  color: "#D97706",
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                {MSG.GOOGLE_SIGNIN_LINK}
              </NextLink>
            </Text>
          </Flex>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack align="stretch" gap={4}>
            <Box>
              <Text
                fontSize="11px"
                fontWeight="700"
                color="#9CA3AF"
                textTransform="uppercase"
                letterSpacing="0.06em"
                mb={2}
              >
                {MSG.EMAIL_LABEL}
              </Text>
              <Box position="relative">
                <Flex
                  position="absolute"
                  left="14px"
                  top="50%"
                  transform="translateY(-50%)"
                  color="#9CA3AF"
                  pointerEvents="none"
                  zIndex={1}
                >
                  <Mail size={15} />
                </Flex>
                <Input
                  type="email"
                  placeholder={MSG.EMAIL_PLACEHOLDER}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (state === "error") {
                      setState("idle");
                      setErrorMsg("");
                    }
                  }}
                  pl="40px"
                  h="48px"
                  border="1px solid"
                  borderColor={state === "error" ? "#FCA5A5" : "#E5E7EB"}
                  borderRadius="12px"
                  fontSize="14px"
                  color="#111111"
                  bg="white"
                  _focus={{
                    borderColor: state === "error" ? "#EF4444" : "#4F46E5",
                    boxShadow:
                      state === "error"
                        ? "0 0 0 3px rgba(239,68,68,0.1)"
                        : "0 0 0 3px rgba(79,70,229,0.1)",
                    outline: "none",
                  }}
                  _placeholder={{ color: "#9CA3AF" }}
                  autoComplete="email"
                  autoFocus
                />
              </Box>
              {errorMsg && (
                <Text fontSize="12px" color="#EF4444" mt={1.5}>
                  {errorMsg}
                </Text>
              )}
            </Box>

            <Button
              type="submit"
              bg="#4F46E5"
              color="white"
              h="48px"
              w="full"
              borderRadius="12px"
              fontSize="15px"
              fontWeight="700"
              disabled={!email.trim() || state === "loading"}
              boxShadow="0 4px 12px rgba(79,70,229,0.22)"
              _hover={{
                bg: "#4338CA",
                boxShadow: "0 6px 16px rgba(79,70,229,0.3)",
              }}
              transition="all 0.2s"
            >
              {state === "loading" ? MSG.SUBMITTING_BUTTON : MSG.SUBMIT_BUTTON}
            </Button>
          </VStack>
        </Box>

        <Text fontSize="13px" color="#9CA3AF" textAlign="center" mt={6}>
          {MSG.REMEMBER_PASSWORD}{" "}
          <NextLink href="/login" style={{ color: "#4F46E5", fontWeight: 600 }}>
            {MSG.SIGNIN_LINK}
          </NextLink>
        </Text>
      </Box>
    </Container>
  );
}
