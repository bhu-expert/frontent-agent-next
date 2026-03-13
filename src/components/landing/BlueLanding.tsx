"use client";

import { Box } from "@chakra-ui/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "./HeroSection";
import UseCases from "./UseCases";
import HowItWorks from "./HowItWorks";
import FeatureGrid from "./FeatureGrid";
import FinalCTA from "./FinalCTA";

/**
 * Main landing page component that assembles all sections.
 * Features a cohesive blue and white theme.
 */
export default function BlueLanding() {
  return (
    <Box minH="100vh" bg="white">
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
