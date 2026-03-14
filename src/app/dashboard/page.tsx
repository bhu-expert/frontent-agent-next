"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flex, Spinner } from "@chakra-ui/react";
import { AuthProvider, useAuth } from "@/store/AuthProvider";
import { ROUTES } from "@/constants";
import { getClaimedBrandId } from "@/lib/delayedAuth";
import DashboardShell from "@/components/dashboard/DashboardShell";

// Skip static generation - this page requires authentication
export const dynamic = "force-dynamic";

/**
 * DashboardGate Component
 * Enforces authentication before rendering the dashboard shell.
 */
function DashboardGate() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [isLoading, router, user]);

  const brandId = user ? getClaimedBrandId() : null;

  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#F8F8F6">
        <Spinner size="lg" color="#4F46E5" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="#F8F8F6">
        <Spinner size="lg" color="#4F46E5" />
      </Flex>
    );
  }

  return <DashboardShell brandId={brandId} />;
}

/**
 * DashboardPage Route
 * Wraps the dashboard with the AuthProvider context.
 */
export default function DashboardPage() {
  return (
    <AuthProvider redirectToDashboard={false}>
      <DashboardGate />
    </AuthProvider>
  );
}
