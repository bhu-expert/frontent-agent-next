"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Text,
  VStack,
  Flex,
  Button,
} from "@chakra-ui/react";
import { Lock, CheckCircle2, XCircle } from "lucide-react";
import NextLink from "next/link";
import { resetPassword } from "@/api";
import { AUTH_MESSAGES } from "@/constants/auth";
import { PasswordInput } from "@/components/auth/PasswordInput";

type State = "idle" | "loading" | "success" | "error" | "invalid_link";

const MSG = AUTH_MESSAGES.RESET_PASSWORD;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState]                 = useState<State>("idle");
  const [errorMsg, setErrorMsg]           = useState("");

  useEffect(() => {
    if (!token) setState("invalid_link");
  }, [token]);

  const passwordStrength = (p: string) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strength = passwordStrength(password);
  const strengthText  = [MSG.STRENGTH_WEAK, MSG.STRENGTH_WEAK, MSG.STRENGTH_FAIR, MSG.STRENGTH_GOOD, MSG.STRENGTH_STRONG][strength];
  const strengthColor = ["#E5E7EB", "#EF4444", "#F59E0B", "#10B981", "#059669"][strength];

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) { setErrorMsg("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setErrorMsg("Passwords do not match."); return; }

    setState("loading");
    setErrorMsg("");

    try {
      await resetPassword(token, password);
      setState("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setState("error");
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────

  if (state === "success") {
    return (
      <Box textAlign="center">
        <Flex w="64px" h="64px" borderRadius="20px" bg="#ECFDF5"
          align="center" justify="center" mx="auto" mb={5}>
          <CheckCircle2 size={30} color="#16A34A" />
        </Flex>

        <Text fontSize="22px" fontWeight="700" color="#111111" mb={2}>
          {MSG.SUCCESS_TITLE}
        </Text>
        <Text fontSize="14px" color="#6B7280" lineHeight="1.65" mb={8}>
          Your new password is set. Sign in below to get back into your account.
        </Text>

        {/* Explicit CTA — no auto-redirect, user is in control */}
        <NextLink href="/login">
          <Button
            bg="#4F46E5" color="white" h="50px" w="full"
            borderRadius="14px" fontSize="15px" fontWeight="700"
            boxShadow="0 6px 16px rgba(79,70,229,0.25)"
            _hover={{
              bg: "#4338CA",
              boxShadow: "0 10px 24px rgba(79,70,229,0.3)",
              transform: "translateY(-1px)",
            }}
            _active={{ transform: "translateY(0)" }}
            transition="all 0.2s"
          >
            Sign in with new password →
          </Button>
        </NextLink>

        <Flex align="center" gap={3} my={5}>
          <Box flex={1} h="1px" bg="#F3F4F6" />
          <Text fontSize="12px" color="#D1D5DB">or</Text>
          <Box flex={1} h="1px" bg="#F3F4F6" />
        </Flex>

        <Text fontSize="13px" color="#9CA3AF">
          Also signed up with Google?{" "}
          <NextLink href="/login" style={{ color: "#4F46E5", fontWeight: 600 }}>
            Use Google sign in instead
          </NextLink>
        </Text>
      </Box>
    );
  }

  // ── Invalid / expired link ─────────────────────────────────────────────────

  if (state === "invalid_link") {
    return (
      <Box textAlign="center">
        <Flex w="56px" h="56px" borderRadius="16px" bg="#FEF2F2"
          align="center" justify="center" mx="auto" mb={5}>
          <XCircle size={26} color="#EF4444" />
        </Flex>
        <Text fontSize="22px" fontWeight="700" color="#111111" mb={2}>
          {MSG.INVALID_TITLE}
        </Text>
        <Text fontSize="14px" color="#6B7280" lineHeight="1.6" mb={8}>
          {MSG.INVALID_DESCRIPTION}
        </Text>
        <NextLink href="/forgot-password">
          <Button bg="#4F46E5" color="white" h="48px" w="full"
            borderRadius="12px" fontWeight="700">
            {MSG.INVALID_BUTTON}
          </Button>
        </NextLink>
      </Box>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <Box>
      <Flex w="52px" h="52px" borderRadius="14px" bg="rgba(79,70,229,0.08)"
        align="center" justify="center" mb={5}>
        <Lock size={22} color="#4F46E5" />
      </Flex>

      <Text fontSize="22px" fontWeight="700" color="#111111" mb={1}>
        {MSG.TITLE}
      </Text>
      <Text fontSize="14px" color="#6B7280" lineHeight="1.6" mb={7}>
        {MSG.DESCRIPTION}
      </Text>

      <Box as="form" onSubmit={handleReset}>
        <VStack gap={5} align="stretch">
          <PasswordInput
            label={MSG.PASSWORD_LABEL}
            placeholder={MSG.PASSWORD_PLACEHOLDER}
            value={password}
            onChange={setPassword}
            error={errorMsg && password !== confirmPassword ? "" : errorMsg}
          />

          {password && (
            <Box>
              <Flex justify="space-between" mb={1.5}>
                <Text fontSize="11px" fontWeight="700" color="#9CA3AF" textTransform="uppercase">
                  Security strength
                </Text>
                <Text fontSize="11px" fontWeight="700" color={strengthColor}>
                  {strengthText}
                </Text>
              </Flex>
              <Flex gap={1}>
                {[1, 2, 3, 4].map((step) => (
                  <Box key={step} h="4px" flex={1} borderRadius="full"
                    bg={strength >= step ? strengthColor : "#F3F4F6"}
                    transition="all 0.3s" />
                ))}
              </Flex>
            </Box>
          )}

          <PasswordInput
            label={MSG.CONFIRM_LABEL}
            placeholder={MSG.CONFIRM_PLACEHOLDER}
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={password !== confirmPassword && confirmPassword ? "Passwords do not match" : ""}
          />

          {errorMsg && state === "error" && (
            <Box bg="#FEF2F2" border="1px solid" borderColor="#FECACA"
              borderRadius="10px" px={4} py={3}>
              <Text fontSize="13px" color="#DC2626">{errorMsg}</Text>
            </Box>
          )}

          <Button
            type="submit"
            bg="#4F46E5" color="white" h="48px" w="full"
            borderRadius="12px" fontSize="15px" fontWeight="700"
            loading={state === "loading"}
            disabled={!password || !confirmPassword || password !== confirmPassword}
            mt={2}
            boxShadow="0 4px 12px rgba(79,70,229,0.22)"
            _hover={{ bg: "#4338CA" }}
          >
            {MSG.SUBMIT_BUTTON}
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Container maxW="440px" py={20}>
      <Box bg="white" border="1px solid" borderColor="#ECECEC"
        borderRadius="24px" p={10} boxShadow="0 12px 48px rgba(0,0,0,0.04)">
        <Suspense fallback={<Text>Loading...</Text>}>
          <ResetPasswordContent />
        </Suspense>
      </Box>
    </Container>
  );
}
