"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Box } from "@chakra-ui/react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="#F9FAFB">
      <Navbar />
      <Box
        as="main"
        flex="1"
        pt="80px" // Space for fixed Navbar
        pb={10}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <Box w="full" maxW="440px">
          {children}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}
