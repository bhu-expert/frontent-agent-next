"use client";

import { AuthProvider } from "@/store/AuthProvider";
import LoginPage from "@/components/auth/LoginPage";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Skip static generation - this page requires runtime auth
export const dynamic = "force-dynamic";

/**
 * Login Route
 * Renders the full-page authentication experience.
 */
export default function LoginRoute() {
  return (
    <AuthProvider redirectToDashboard={false}>
      <Navbar />
      <LoginPage />
      <Footer />
    </AuthProvider>
  );
}
