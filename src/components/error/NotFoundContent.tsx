"use client"

import { Box, Button, Text, Heading } from "@chakra-ui/react"
import { keyframes } from "@emotion/react"
import Link from "next/link"
import { ArrowLeft, Compass } from "lucide-react"
import {
  NOT_FOUND_HEADING,
  NOT_FOUND_BODY,
  NOT_FOUND_BTN_LABEL,
} from "@/constants/error-page"
import { ROUTES } from "@/constants/routes"  // use existing routes constant for /dashboard

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

export default function NotFoundContent() {
  return (
    <Box
      position="relative"
      zIndex={1}
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      maxW="480px"
      animation={`${slideUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1)`}
    >
      {/* Icon */}
      <Box
        w="80px"
        h="80px"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="2xl"
        color="#4F46E5"
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="0 12px 48px rgba(0,0,0,0.04)"
        mb={8}
      >
        <Compass size={36} strokeWidth={1.5} />
      </Box>

      {/* Heading */}
      <Heading
        as="h1"
        fontSize="32px"
        fontWeight={700}
        letterSpacing="-0.02em"
        color="gray.900"
        mb={4}
      >
        {NOT_FOUND_HEADING}
      </Heading>

      {/* Body */}
      <Text
        fontSize="16px"
        color="gray.500"
        lineHeight={1.6}
        mb={10}
      >
        {NOT_FOUND_BODY}
      </Text>

      {/* CTA Button */}
      <Button
        asChild
        px="28px"
        py="14px"
        h="auto"
        borderRadius="xl"
        fontSize="15px"
        fontWeight={600}
        bg="#4F46E5"
        color="white"
        boxShadow="0 4px 12px rgba(79,70,229,0.2)"
        _hover={{
          bg: "#4338CA",
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(79,70,229,0.3)",
          textDecoration: "none",
        }}
        transition="all 0.2s ease"
      >
        <Link href={ROUTES.HOME}>
          <ArrowLeft size={18} />
          {NOT_FOUND_BTN_LABEL}
        </Link>
      </Button>
    </Box>
  )
}