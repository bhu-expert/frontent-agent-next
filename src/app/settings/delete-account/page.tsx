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
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/store/AuthProvider";
import { toaster } from "@/components/ui/toaster";

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
      // Verify password by attempting to sign in
      // Note: This is a simplified approach. In production, you should call a backend API
      // to handle account deletion with proper authentication

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
      <Box bg="gray.50" minH="100vh" py={12}>
        <Container maxW="2xl">
          <VStack
            align="stretch"
            gap={6}
            bg="white"
            p={8}
            borderRadius="2xl"
            boxShadow="sm"
          >
            <Alert.Root status="warning" borderRadius="lg">
              <Alert.Indicator />
              <Alert.Content>
                You must be logged in to delete your account.
              </Alert.Content>
            </Alert.Root>
            <Link as={NextLink} href="/login" display="inline-block">
              <Button
                bg="blue.600"
                color="white"
                size="lg"
                w="full"
                _hover={{ bg: "blue.700" }}
              >
                Sign In
              </Button>
            </Link>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="gray.50" minH="100vh" py={12}>
      <Container maxW="2xl">
        <VStack
          align="stretch"
          gap={6}
          bg="white"
          p={8}
          borderRadius="2xl"
          boxShadow="sm"
        >
          {/* Header */}
          <Box>
            <Heading
              as="h1"
              fontSize="2xl"
              fontWeight="700"
              color="red.600"
              mb={2}
            >
              Delete Account
            </Heading>
            <Text fontSize="14px" color="gray.600">
              Permanently delete your plugandplayagents account and all
              associated data
            </Text>
          </Box>

          {/* Warning */}
          <Alert.Root status="error" borderRadius="lg" variant="solid">
            <Alert.Indicator />
            <Box>
              <Text fontWeight="600" mb={1}>
                This action cannot be undone
              </Text>
              <Text fontSize="13px">
                Deleting your account will permanently remove:
              </Text>
              <Box as="ul" ml={4} mt={2} fontSize="13px">
                <li>All your personal information</li>
                <li>Connected social media accounts (Facebook, Instagram)</li>
                <li>All scheduled and published content</li>
                <li>Brand data and content variations</li>
                <li>Analytics and historical data</li>
                <li>API keys and integrations</li>
              </Box>
            </Box>
          </Alert.Root>

          {/* What will happen */}
          <Box
            bg="blue.50"
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor="blue.100"
          >
            <Text fontWeight="600" color="blue.900" mb={2} fontSize="14px">
              What happens after deletion:
            </Text>
            <Box
              as="ul"
              ml={4}
              fontSize="13px"
              color="blue.800"
              lineHeight="1.8"
            >
              <li>Your account will be immediately deactivated</li>
              <li>All data will be permanently deleted within 30 days</li>
              <li>
                Connected Facebook/Instagram accounts will be disconnected
              </li>
              <li>You can create a new account with the same email anytime</li>
            </Box>
          </Box>

          {/* Password Confirmation */}
          <VStack align="stretch" gap={3}>
            <Text fontWeight="600" fontSize="14px" color="gray.700">
              Confirm Deletion
            </Text>
            <Text fontSize="13px" color="gray.600">
              Enter your password to permanently delete your account
            </Text>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="lg"
              borderColor="gray.300"
              _focus={{
                borderColor: "red.500",
                boxShadow: "0 0 0 1px red.500",
              }}
            />
          </VStack>

          {/* Error Message */}
          {error && (
            <Alert.Root status="error" borderRadius="lg">
              <Alert.Indicator />
              <Alert.Content>{error}</Alert.Content>
            </Alert.Root>
          )}

          {/* Delete Button */}
          <Button
            bg="red.600"
            color="white"
            size="lg"
            onClick={handleDeleteAccount}
            loading={isDeleting}
            fontWeight="600"
            w="full"
          >
            {isDeleting ? "Deleting..." : "Permanently Delete Account"}
          </Button>

          {/* Cancel Link */}
          <Box textAlign="center">
            <Link
              as={NextLink}
              href="/dashboard"
              color="gray.600"
              fontSize="14px"
            >
              Cancel and return to dashboard
            </Link>
          </Box>

          {/* Alternative Contact */}
          <Separator my={4} />

          <Box textAlign="center">
            <Text fontSize="13px" color="gray.500" mb={2}>
              Having trouble? Contact our support team
            </Text>
            <Link
              href="mailto:support@plugandplayagents.com?subject=Account Deletion Assistance"
              color="blue.600"
              fontSize="13px"
            >
              support@plugandplayagents.com
            </Link>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
