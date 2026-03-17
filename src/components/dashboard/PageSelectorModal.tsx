"use client";

import { useState } from "react";
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import { Dialog } from "@chakra-ui/react";

interface Page {
  id: string;
  name: string;
  access_token: string;
  instagram_id?: string;
  instagram_name?: string;
}

interface PageSelectorModalProps {
  open: boolean;
  onClose: () => void;
  pages: Page[];
  onSelectPage: (page: Page) => void;
}

export default function PageSelectorModal({
  open,
  onClose,
  pages,
  onSelectPage,
}: PageSelectorModalProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelect = async (page: Page) => {
    setIsSelecting(true);
    try {
      await onSelectPage(page);
    } finally {
      setIsSelecting(false);
    }
  };

  return (
    <Dialog.Root open={open} size="lg">
      <Dialog.Backdrop />
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Select Facebook Page</Dialog.Title>
          <Dialog.Description>
            Choose which Facebook Page you want to connect to PostGini
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          {pages.length === 0 ? (
            <Flex align="center" justify="center" py={8}>
              <Box color="blue.600">Loading pages...</Box>
            </Flex>
          ) : (
            <VStack gap={3} align="stretch">
              {pages.map((page) => (
                <Flex
                  key={page.id}
                  align="center"
                  gap={3}
                  p={4}
                  border="1px solid"
                  borderColor="#E5E7EB"
                  borderRadius="12px"
                  cursor="pointer"
                  _hover={{
                    borderColor: "#4F46E5",
                    bg: "#F5F5FF",
                  }}
                  onClick={() => handleSelect(page)}
                  opacity={isSelecting ? 0.6 : 1}
                >
                  {/* Page Avatar */}
                  <Flex
                    w="48px"
                    h="48px"
                    borderRadius="full"
                    bg="#1877F2"
                    color="white"
                    fontSize="18px"
                    fontWeight="700"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    {page.name.charAt(0).toUpperCase()}
                  </Flex>

                  {/* Page Info */}
                  <Box flex={1} minW={0}>
                    <Text fontSize="15px" fontWeight="600" color="#111111" truncate>
                      {page.name}
                    </Text>
                    {page.instagram_name && (
                      <Text fontSize="12px" color="#6B7280" mt={0.5}>
                        📷 Instagram: {page.instagram_name}
                      </Text>
                    )}
                  </Box>

                  {/* Select Button */}
                  <Button
                    size="sm"
                    bg="#4F46E5"
                    color="white"
                    _hover={{ bg: "#4338CA" }}
                    loading={isSelecting}
                  >
                    Connect
                  </Button>
                </Flex>
              ))}
            </VStack>
          )}

          {pages.length === 0 && (
            <Text textAlign="center" color="#6B7280" fontSize="14px">
              No Facebook Pages found. Make sure you admin at least one Page.
            </Text>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
