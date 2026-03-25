"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Check, Mail } from "lucide-react";
import { useAuth } from "@/store/AuthProvider";
import { ROUTES } from "@/constants";
import { LoginPageProps } from "@/props/LoginPage";
import Image from "next/image";
import NextLink from "next/link";
import { AUTH_MESSAGES } from "@/constants/auth";
import { PasswordInput } from "@/components/auth/PasswordInput";

export default function LoginPage({
  redirectTo = ROUTES.DASHBOARD,
}: LoginPageProps) {
  const router = useRouter();
  const {
    user,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithMagicLink,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const L_MSG = AUTH_MESSAGES.LOGIN;
  const S_MSG = AUTH_MESSAGES.SIGNUP;
  const MSG = mode === "login" ? L_MSG : S_MSG;

  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectTo);
    }
  }, [isLoading, router, redirectTo, user]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPass("");
    setErr("");
    setLoading(false);
    setMagicSent(false);
  };

  const handleSubmit = async () => {
    if (!email || !pass) {
      setErr("Please fill in all required fields.");
      return;
    }
    if (mode === "signup" && !name) {
      setErr("Please enter your name.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, pass);
      } else {
        await signUpWithEmail(email, pass, name);
      }
      resetForm();
      router.push(redirectTo);
    } catch (e: any) {
      setErr(e.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErr("");
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setErr(e.message || "Google sign-in failed.");
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setErr("Please enter your email address first.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      await signInWithMagicLink(email);
      setMagicSent(true);
    } catch (e: any) {
      setErr(e.message || "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Flex align="center" justify="center" p={10}>
        <Spinner size="lg" color="#4F46E5" />
      </Flex>
    );
  }

  return (
    <Box
      bg="white"
      borderRadius="24px"
      boxShadow="0 12px 48px rgba(0, 0, 0, 0.04)"
      border="1px solid"
      borderColor="#ECECEC"
      overflow="hidden"
    >
      <Box
        bg="#F9FAFB"
        px={8}
        pt={8}
        pb={6}
        borderBottom="1px solid"
        borderColor="#ECECEC"
      >
        <Flex align="center" gap="2.5" mb={4}>
          <Image
            src="/plug_andPlay_logo.jpeg"
            alt="Plug and Play Agent"
            width={28}
            height={28}
            style={{ objectFit: "contain", borderRadius: "6px" }}
          />
          <Text
            fontSize="15px"
            fontWeight="800"
            color="#111111"
            letterSpacing="-0.01em"
          >
            Plug and Play Agent
          </Text>
        </Flex>
        <Text fontSize="22px" fontWeight="700" color="#111111" mb={1}>
          {MSG.TITLE}
        </Text>
        <Text fontSize="13px" color="#6B7280" lineHeight="1.5">
          {MSG.DESCRIPTION}
        </Text>
        <Flex bg="#F0F0F0" p={1} borderRadius="12px" mt={6}>
          <Button
            flex={1}
            size="sm"
            bg={mode === "login" ? "white" : "transparent"}
            color={mode === "login" ? "#111111" : "#6B7280"}
            boxShadow={mode === "login" ? "sm" : "none"}
            onClick={() => setMode("login")}
            borderRadius="10px"
            _hover={{ bg: mode === "login" ? "white" : "rgba(0,0,0,0.02)" }}
            fontWeight="600"
            fontSize="13px"
            h="32px"
          >
            {L_MSG.SUBMIT_BUTTON}
          </Button>
          <Button
            flex={1}
            size="sm"
            bg={mode === "signup" ? "white" : "transparent"}
            color={mode === "signup" ? "#111111" : "#6B7280"}
            boxShadow={mode === "signup" ? "sm" : "none"}
            onClick={() => setMode("signup")}
            borderRadius="10px"
            _hover={{ bg: mode === "signup" ? "white" : "rgba(0,0,0,0.02)" }}
            fontWeight="600"
            fontSize="13px"
            h="32px"
          >
            {S_MSG.SUBMIT_BUTTON}
          </Button>
        </Flex>
      </Box>

      <Box px={8} py={8}>
        {err && (
          <Box
            bg="red.50"
            border="1px solid"
            borderColor="red.100"
            color="red.600"
            fontSize="12px"
            p={3}
            borderRadius="12px"
            mb={5}
            fontWeight="500"
          >
            {err}
          </Box>
        )}

        <VStack gap={4} align="stretch">
          {mode === "signup" && (
            <Box>
              <Text fontSize="11px" fontWeight="700" color="#9CA3AF" mb={2} textTransform="uppercase" letterSpacing="0.04em">
                {S_MSG.NAME_LABEL}
              </Text>
              <Input
                h="46px"
                pl="14px"
                placeholder={S_MSG.NAME_PLACEHOLDER}
                bg="white"
                border="1px solid"
                borderColor="#E5E7EB"
                borderRadius="12px"
                fontSize="14px"
                _focus={{
                  borderColor: "#4F46E5",
                  boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
                }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Box>
          )}
          <Box>
            <Text fontSize="11px" fontWeight="700" color="#9CA3AF" mb={2} textTransform="uppercase" letterSpacing="0.04em">
              {MSG.EMAIL_LABEL}
            </Text>
            <Input
              h="46px"
              pl="14px"
              type="email"
              placeholder={MSG.EMAIL_PLACEHOLDER}
              bg="white"
              border="1px solid"
              borderColor="#E5E7EB"
              borderRadius="12px"
              fontSize="14px"
              _focus={{
                borderColor: "#4F46E5",
                boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
              }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
          <Box>
            <PasswordInput
              label={MSG.PASSWORD_LABEL}
              placeholder={MSG.PASSWORD_PLACEHOLDER}
              value={pass}
              onChange={setPass}
            />
            {mode === "login" && (
              <Flex justify="flex-end" mt={2}>
                <NextLink
                  href="/forgot-password"
                  style={{
                    fontSize: "13px",
                    color: "#4F46E5",
                    fontWeight: 600,
                  }}
                >
                  {L_MSG.FORGOT_PASSWORD}
                </NextLink>
              </Flex>
            )}
          </Box>

          <Button
            h="48px"
            bg="#4F46E5"
            color="white"
            _hover={{ bg: "#4338CA" }}
            borderRadius="12px"
            fontWeight="700"
            fontSize="15px"
            onClick={handleSubmit}
            mt={2}
            loading={loading}
            boxShadow="0 4px 12px rgba(79, 70, 229, 0.2)"
          >
            {mode === "login" ? L_MSG.SUBMIT_BUTTON : S_MSG.SUBMIT_BUTTON}
          </Button>
        </VStack>

        {mode === "login" && (
          <>
            {!magicSent ? (
              <Button
                variant="ghost"
                size="sm"
                w="full"
                mt={3}
                color="#4F46E5"
                fontWeight="600"
                fontSize="13px"
                _hover={{ bg: "rgba(79, 70, 229, 0.04)" }}
                onClick={handleMagicLink}
                disabled={loading}
                gap={2}
              >
                <Mail size={14} />
                {L_MSG.MAGIC_LINK_BUTTON}
              </Button>
            ) : (
              <Flex
                align="center"
                justify="center"
                gap={2}
                mt={3}
                p={2.5}
                borderRadius="10px"
                bg="#F0FDF4"
                border="1px solid"
                borderColor="#DCFCE7"
              >
                <Check size={14} color="#16A34A" strokeWidth={3} />
                <Text fontSize="13px" fontWeight="700" color="#16A34A">
                  {L_MSG.MAGIC_LINK_SENT}
                </Text>
              </Flex>
            )}
          </>
        )}

        <Flex align="center" my={7}>
          <Box flex="1" h="1px" bg="#F3F4F6" />
          <Text px={4} fontSize="11px" color="#9CA3AF" fontWeight="700" textTransform="uppercase" letterSpacing="0.05em">
            {MSG.OR_CONTINUE}
          </Text>
          <Box flex="1" h="1px" bg="#F3F4F6" />
        </Flex>

        <Button
          h="48px"
          w="full"
          bg="white"
          border="1px solid"
          borderColor="#E5E7EB"
          color="#111111"
          _hover={{ bg: "#F9FAFB" }}
          borderRadius="12px"
          fontWeight="600"
          fontSize="14px"
          onClick={handleGoogle}
          gap={3}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {MSG.GOOGLE_BUTTON}
        </Button>
      </Box>
    </Box>
  );
}
