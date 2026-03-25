"use client";

import { useState } from "react";
import { Box, Flex, Input, Text } from "@chakra-ui/react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

export function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  error,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  
  return (
    <Box w="full">
      <Text
        fontSize="11px"
        fontWeight="700"
        color="#9CA3AF"
        textTransform="uppercase"
        letterSpacing="0.06em"
        mb={2}
      >
        {label}
      </Text>
      <Box position="relative">
        <Flex
          position="absolute"
          left="14px"
          top="50%"
          transform="translateY(-50%)"
          color="#9CA3AF"
          pointerEvents="none"
          zIndex={1}
        >
          <Lock size={15} />
        </Flex>
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          pl="40px"
          pr="40px"
          h="48px"
          border="1px solid"
          borderColor={error ? "#FCA5A5" : "#E5E7EB"}
          borderRadius="12px"
          fontSize="14px"
          color="#111111"
          bg="white"
          _focus={{
            borderColor: error ? "#EF4444" : "#4F46E5",
            boxShadow: error
              ? "0 0 0 3px rgba(239,68,68,0.1)"
              : "0 0 0 3px rgba(79,70,229,0.1)",
            outline: "none",
          }}
        />
        <Box
          position="absolute"
          right="12px"
          top="50%"
          transform="translateY(-50%)"
          as="button"
          onClick={() => setShow(!show)}
          color="#9CA3AF"
          _hover={{ color: "#4F46E5" }}
          transition="color 0.15s"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </Box>
      </Box>
      {error && (
        <Text fontSize="12px" color="#EF4444" mt={1.5}>
          {error}
        </Text>
      )}
    </Box>
  );
}
