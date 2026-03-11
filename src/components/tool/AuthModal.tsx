"use client";

import { useState } from "react";
import { Box, Flex, Text, Button, Input, VStack, HStack, Icon, IconButton } from "@chakra-ui/react";
import { X, Check } from "lucide-react";

interface Props {
  open: boolean;
  mode: "login" | "signup";
  onClose: () => void;
  onSwitch: (mode: "login" | "signup") => void;
  onAuth: (name: string, email: string) => void;
}

export default function AuthModal({ open, mode, onClose, onSwitch, onAuth }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = () => {
    if (!email || !pass) { setErr("Please fill in all required fields."); return; }
    if (mode === "signup" && !name) { setErr("Please enter your name."); return; }
    setErr("");
    onAuth(mode === "signup" ? name : email.split("@")[0], email);
  };

  const handleGoogle = () => {
    onAuth("User", "user@gmail.com");
  };

  if (!open) return null;

  return (
    <Flex
      position="fixed"
      top="0" left="0" right="0" bottom="0"
      bg="blackAlpha.600"
      zIndex="1000"
      align="center"
      justify="center"
      p={4}
      backdropFilter="blur(4px)"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Box 
        bg="white" 
        rounded="2xl" 
        w="90%" 
        maxW="420px" 
        position="relative" 
        overflow="hidden"
        boxShadow="xl"
      >
        <IconButton
          position="absolute"
          top={4}
          right={4}
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close"
          color="gray.500"
          _hover={{ bg: "gray.100", color: "gray.900" }}
          zIndex="2"
        >
          <X size={18} />
        </IconButton>

        <Box bg="gray.50" px={8} pt={8} pb={6} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
          <Box display="inline-flex" px={3} py={1} rounded="full" bg="white" border="1px solid" borderColor="gray.200" fontSize="11px" fontWeight="bold" color="gray.700" mb={4}>
            🔐 Secure Access
          </Box>
          <Text fontSize="2xl" fontWeight="black" color="gray.900" mb={2} fontFamily="display">
            {mode === "login" ? "Welcome back" : "Join AdForge"}
          </Text>
          <Text fontSize="sm" color="gray.500" mb={6}>
            {mode === "login" ? "Sign in to generate and save your content." : "Create your account to unlock all features."}
          </Text>

          <Flex bg="gray.200" p={1} rounded="xl">
            <Button
              flex={1}
              size="sm"
              variant={mode === "login" ? "solid" : "ghost"}
              bg={mode === "login" ? "white" : "transparent"}
              color={mode === "login" ? "gray.900" : "gray.600"}
              boxShadow={mode === "login" ? "sm" : "none"}
              onClick={() => onSwitch("login")}
              rounded="lg"
            >
              Sign In
            </Button>
            <Button
              flex={1}
              size="sm"
              variant={mode === "signup" ? "solid" : "ghost"}
              bg={mode === "signup" ? "white" : "transparent"}
              color={mode === "signup" ? "gray.900" : "gray.600"}
              boxShadow={mode === "signup" ? "sm" : "none"}
              onClick={() => onSwitch("signup")}
              rounded="lg"
            >
              Create Account
            </Button>
          </Flex>
        </Box>

        <Box p={8}>
          {mode === "signup" && (
            <VStack align="stretch" gap={3} mb={6} bg="blue.50" p={4} rounded="xl" border="1px solid" borderColor="blue.100">
              <Text fontSize="11px" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="blue.600" mb={1}>
                What you get
              </Text>
              {[
                "5 brand positioning contexts per analysis",
                "Instagram + LinkedIn + Twitter post generation",
                "Save, export and regenerate any content"
              ].map((item, idx) => (
                <HStack key={idx} align="start" gap={2.5}>
                  <Flex w="16px" h="16px" rounded="full" bg="white" border="1px solid" borderColor="blue.200" align="center" justify="center" flexShrink={0} mt={0.5}>
                    <Icon as={Check} w="10px" h="10px" color="blue.500" strokeWidth={3} />
                  </Flex>
                  <Text fontSize="13px" fontWeight="medium" color="gray.700" lineHeight="1.4">{item}</Text>
                </HStack>
              ))}
            </VStack>
          )}

          {err && (
            <Box bg="red.50" border="1px solid" borderColor="red.100" color="red.600" fontSize="sm" p={3} rounded="xl" mb={5}>
              {err}
            </Box>
          )}

          <VStack gap={4} align="stretch">
            {mode === "signup" && (
              <Box>
                <Text fontSize="13px" fontWeight="bold" color="gray.900" mb={1.5}>Full Name</Text>
                <Input h="44px" placeholder="Jane Doe" bg="gray.50" border="1px solid" borderColor="gray.200" rounded="xl" fontSize="14px" _focus={{ borderColor: "blue.500", bg: "white", boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" }} value={name} onChange={(e) => setName(e.target.value)} />
              </Box>
            )}
            <Box>
              <Text fontSize="13px" fontWeight="bold" color="gray.900" mb={1.5}>Email Address</Text>
              <Input h="44px" type="email" placeholder="you@company.com" bg="gray.50" border="1px solid" borderColor="gray.200" rounded="xl" fontSize="14px" _focus={{ borderColor: "blue.500", bg: "white", boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" }} value={email} onChange={(e) => setEmail(e.target.value)} />
            </Box>
            <Box>
              <Text fontSize="13px" fontWeight="bold" color="gray.900" mb={1.5}>Password</Text>
              <Input h="44px" type="password" placeholder="••••••••" bg="gray.50" border="1px solid" borderColor="gray.200" rounded="xl" fontSize="14px" _focus={{ borderColor: "blue.500", bg: "white", boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" }} value={pass} onChange={(e) => setPass(e.target.value)} />
            </Box>

            {mode === "login" && (
              <Text textAlign="right" fontSize="12px" fontWeight="semibold" color="blue.600" cursor="pointer" mt="-2">
                Forgot password?
              </Text>
            )}

            <Button h="48px" bg="blue.600" color="white" _hover={{ bg: "blue.700" }} rounded="xl" fontWeight="bold" onClick={handleSubmit} mt={2}>
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </VStack>

          <Flex align="center" my={6}>
            <Box flex="1" h="1px" bg="gray.200" />
            <Text px={3} fontSize="12px" color="gray.400" fontWeight="medium">or continue with</Text>
            <Box flex="1" h="1px" bg="gray.200" />
          </Flex>

          <Button h="48px" w="full" bg="white" border="1px solid" borderColor="gray.200" color="gray.700" _hover={{ bg: "gray.50" }} rounded="xl" fontWeight="bold" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 8 }} fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </Button>

          <Text textAlign="center" fontSize="13px" color="gray.500" mt={6}>
            {mode === "login" ? (
              <>Don&apos;t have an account? <Text as="span" color="blue.600" fontWeight="semibold" cursor="pointer" onClick={() => onSwitch("signup")}>Create one free →</Text></>
            ) : (
              <>Already have an account? <Text as="span" color="blue.600" fontWeight="semibold" cursor="pointer" onClick={() => onSwitch("login")}>Sign in →</Text></>
            )}
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
