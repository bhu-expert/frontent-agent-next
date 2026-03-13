"use client";

import { useEffect, useState } from "react";
import { Box, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import UseCases from "@/components/landing/UseCases";
import HowItWorks from "@/components/landing/HowItWorks";
import FeatureGrid from "@/components/landing/FeatureGrid";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      }
      setIsLoading(false);
    });
  }, [router]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Spinner size="xl" color="#8a2ce2" />
      </Box>
    );
  }

  // If logged in, show minimal UI while redirecting
  if (isLoggedIn) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <Box textAlign="center">
          <Spinner size="xl" color="#8a2ce2" mb={4} />
          <Box fontSize="lg" fontWeight="medium" color="gray.600">
            Redirecting to dashboard...
          </Box>
        </Box>
      </Box>
    );
  }

  // Show landing page for non-logged-in users
  return (
    <Box bg="brandSoft" color="brandDark" minH="100vh" className="antialiased">
      <Navbar />
      <HeroSection />
      <UseCases />
      <HowItWorks />
      <FeatureGrid />
      <FinalCTA />
      <Footer />
    </Box>
  );
}

