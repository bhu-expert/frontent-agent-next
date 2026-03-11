"use client";

import { AuthState } from "@/types/tool";
import { Box, Flex, Text, Button, Container, Icon } from "@chakra-ui/react";
import { ChevronDown, User } from "lucide-react";

interface Props {
  auth: AuthState;
  onLogin: () => void;
  onSignup: () => void;
  onLogout: () => void;
  onHome: () => void;
}

export default function ToolNavbar({ auth, onLogin, onSignup, onLogout, onHome }: Props) {
  return (
    <Box 
      as="nav" 
      position="sticky" 
      top={0} 
      zIndex={100} 
      bg="rgba(255, 255, 255, 0.9)" 
      backdropFilter="blur(16px)" 
      borderBottom="1px solid" 
      borderColor="gray.200"
    >
      <Container maxW="1140px" px={4} mx="auto">
        <Flex h="72px" align="center" justify="space-between">
          <Text 
            fontSize="2xl" 
            fontWeight="black" 
            cursor="pointer" 
            onClick={onHome} 
            fontFamily="display" 
            letterSpacing="tight"
            color="gray.900"
          >
            Ad<Text as="span" color="blue.600" fontStyle="italic">Forge</Text>
          </Text>

          <Flex align="center">
            {!auth.loggedIn ? (
              <Flex gap={3}>
                <Button 
                  variant="ghost" 
                  colorScheme="gray" 
                  onClick={onLogin} 
                  rounded="full"
                  fontWeight="bold"
                >
                  Sign In
                </Button>
                <Button 
                  colorScheme="blue" 
                  bg="blue.600" 
                  onClick={onSignup} 
                  rounded="full"
                  fontWeight="bold"
                  px={6}
                >
                  Start Free
                </Button>
              </Flex>
            ) : (
              <Button 
                variant="ghost" 
                colorScheme="gray" 
                onClick={onLogout} 
                rounded="full" 
                h="10" 
                px={4} 
                gap={3}
              >
                <Flex 
                  w="8" 
                  h="8" 
                  bg="purple.100" 
                  color="purple.700" 
                  rounded="full" 
                  align="center" 
                  justify="center" 
                  fontSize="sm" 
                  fontWeight="black"
                >
                  {auth.name.charAt(0).toUpperCase()}
                </Flex>
                <Text fontSize="sm" fontWeight="bold" color="gray.700">
                  {auth.name}
                </Text>
                <Icon as={ChevronDown} boxSize="16px" color="gray.400" />
              </Button>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
