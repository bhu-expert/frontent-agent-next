"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Text,
  VStack,
  Heading,
  Button,
  Input,
  Alert,
  Link,
  Separator,
  Flex,
  Icon,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/store/AuthProvider";
import { toaster } from "@/components/ui/toaster";
import { SUPPORT_EMAIL } from "@/constants/contact";
import { AlertTriangle, ArrowLeft, Info, Trash2 } from "lucide-react";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteAccount = async () => {
    if (!password) {
      setError("Please enter your password to confirm deletion");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      // For Supabase, we need to call the auth API to verify credentials
      // and then delete the user account
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete account");
      }

      // Sign out after successful deletion
      await signOut();

      toaster.create({
        title: "Account Deleted",
        description:
          "Your account has been successfully deleted. We're sorry to see you go.",
        type: "success",
        duration: 5000,
      });

      // Redirect to home page
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to delete account. Please try again.");
      toaster.create({
        title: "Deletion Failed",
        description:
          err.message || "Failed to delete account. Please try again.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <Flex bg="gray.50" minH="100vh" align="center" justify="center" py={12}>
        <Container maxW="2xl" w="full">
          <VStack
            align="stretch"
            gap={6}
            bg="white"
            p={8}
            borderRadius="2xl"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.100"
          >
            <Alert.Root status="warning" borderRadius="xl">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Authentication Required</Alert.Title>
                <Alert.Description>You must be logged in to delete your account.</Alert.Description>
              </Alert.Content>
            </Alert.Root>
            <Link as={NextLink} href="/login" display="inline-block" _hover={{ textDecoration: 'none' }}>
              <Button
                bg="blue.600"
                color="white"
                size="lg"
                w="full"
                _hover={{ bg: "blue.700", transform: "translateY(-1px)", boxShadow: "md" }}
                transition="all 0.2s"
                borderRadius="xl"
              >
                Sign In to Continue
              </Button>
            </Link>
          </VStack>
        </Container>
      </Flex>
    );
  }

  return (
    <Flex bg="gray.50" minH="100vh" align="center" justify="center" py={{ base: 8, md: 12 }}>
      <Container maxW="2xl" w="full">
        <Link 
          as={NextLink} 
          href="/settings" 
          color="gray.500" 
          _hover={{ color: "gray.800", textDecoration: "none" }}
          display="inline-flex"
          alignItems="center"
          mb={6}
          fontSize="sm"
          fontWeight="500"
          transition="color 0.2s"
        >
          <ArrowLeft size={16} style={{ marginRight: "8px" }} />
          Back to Settings
        </Link>

        <VStack
          align="stretch"
          gap={8}
          bg="white"
          p={{ base: 6, md: 10 }}
          borderRadius="2xl"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.100"
        >
          {/* Header */}
          <Flex align="center" gap={4}>
            <Flex 
              p={3} 
              bg="red.50" 
              color="red.600" 
              borderRadius="xl"
              align="center"
              justify="center"
            >
              <Trash2 size={28} strokeWidth={2} />
            </Flex>
            <Box>
              <Heading
                as="h1"
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="700"
                color="gray.900"
                letterSpacing="tight"
              >
                Delete Account
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Permanently delete your account and all associated data
              </Text>
            </Box>
          </Flex>

          {/* Warning Message */}
          <Alert.Root status="error" borderRadius="xl" variant="subtle" bg="red.50" border="1px solid" borderColor="red.100">
            <Alert.Indicator color="red.600">
              <AlertTriangle size={20} />
            </Alert.Indicator>
            <Alert.Content color="red.900">
              <Alert.Title fontWeight="600" fontSize="md" mb={1} mt={2}>
                This action cannot be undone
              </Alert.Title>
              <Alert.Description fontSize="sm" lineHeight="tall">
                Deleting your account will permanently remove:
                <Box as="ul" ml={5} mt={2} display="flex" flexDirection="column" gap={1}>
                  <li>All your personal information and profile data</li>
                  <li>Connected social media accounts (e.g., Facebook, Instagram)</li>
                  <li>All scheduled and published content</li>
                  <li>Brand data and content variations</li>
                  <li>Analytics and historical data</li>
                  <li>API keys and active integrations</li>
                </Box>
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>

          {/* Information Section */}
          <Flex
            bg="blue.50/50"
            p={5}
            borderRadius="xl"
            border="1px solid"
            borderColor="blue.100"
            gap={2}
            align="flex-start"
          >
            <Box color="blue.500" mt={0.5}>
              <Info size={20} />
            </Box>
            <Box>
              <Text fontWeight="600" color="blue.900" mb={2} fontSize="sm">
                What happens after deletion?
              </Text>
              <Box
                as="ul"
                ml={4}
                fontSize="sm"
                color="blue.800"
                lineHeight="tall"
                display="flex"
                flexDirection="column"
                gap={1}
              >
                <li>Your account will be immediately deactivated</li>
                <li>All data will be permanently wiped from our servers within 30 days</li>
                <li>Connected platform authentications will be immediately revoked</li>
                <li>You can create a new account with the same email anytime in the future</li>
              </Box>
            </Box>
          </Flex>

          {/* <Separator borderColor="gray.100" /> */}

          {/* Password Confirmation */}
          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontWeight="600" fontSize="sm" color="gray.900" mb={1}>
                Confirm Identity
              </Text>
              <Text fontSize="sm" color="gray.500">
                Please enter your password to verify you have the right to delete this account.
              </Text>
            </Box>
            <Input 
            px={2}
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="lg"
              borderRadius="xl"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ borderColor: "gray.300" }}
              _focus={{
                bg: "white",
                borderColor: "red.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-red-500)",
              }}
              transition="all 0.2s"
            />
          </VStack>

          {/* Error Message */}
          {error && (
            <Alert.Root status="error" borderRadius="lg" size="sm">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description fontWeight="500">{error}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Actions */}
          <VStack gap={4} pt={2}>
            <Button
              bg="red.600"
              color="white"
              size="lg"
              onClick={handleDeleteAccount}
              loading={isDeleting}
              loadingText="Deleting Account..."
              fontWeight="600"
              w="full"
              borderRadius="xl"
              _hover={{ bg: "red.700", transform: "translateY(-1px)", boxShadow: "md" }}
              _active={{ bg: "red.800", transform: "translateY(0)" }}
              transition="all 0.2s"
            >
              {!isDeleting && <Trash2 size={18} style={{ marginRight: "8px" }} />}
              Permanently Delete Account
            </Button>

            <Link
              as={NextLink}
              href="/settings"
              color="gray.500"
              fontSize="sm"
              fontWeight="500"
              _hover={{ color: "gray.800" }}
              transition="color 0.2s"
            >
              Cancel and return to settings
            </Link>
          </VStack>

          {/* Support Section */}
          <Box textAlign="center" pt={1}>
            <Text fontSize="sm" color="gray.500" mb={1}>
              Need help or have questions?
            </Text>
            <Link
              href={`mailto:${SUPPORT_EMAIL}?subject=Account Deletion Assistance`}
              color="blue.600"
              fontSize="sm"
              fontWeight="500"
              _hover={{ color: "blue.700", textDecoration: "underline" }}
            >
              Contact our support team
            </Link>
          </Box>
        </VStack>
      </Container>
    </Flex>
  );
}
