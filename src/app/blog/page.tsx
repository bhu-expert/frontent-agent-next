"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Flex,
  Dialog,
  Portal,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";



import { BlogPost, posts, categoryColors } from "@/constants/blog";

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenPost = (post: BlogPost) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };

  const featuredPost = posts.find((p) => p.isFeatured);
  const gridPosts = posts.filter((p) => !p.isFeatured);

  return (
    <Box minH="100vh" bg="white" color="gray.800" display="flex" flexDirection="column" overflowX="hidden">
      <Navbar />

      <Box flex="1" as="main">
        {/* Hero Section */}
        <Box 
          pt={{ base: "32", md: "44" }} 
          pb={{ base: "12", md: "20" }}
          bgGradient="linear(to-b, white, gray.50)"
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Container maxW="5xl" mx="auto" px={4}>
            <VStack gap={4} align="center" textAlign="center">
              <Heading as="h1" fontSize={{ base: "4xl", md: "6xl" }} fontWeight="800" letterSpacing="-0.02em" color="gray.900">
                Blog
              </Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} color="gray.600" maxW="2xl">
                Tips, updates, and insights for Instagram growth.
              </Text>
            </VStack>
          </Container>
        </Box>

        {/* Featured Post Banner */}
        {featuredPost && (
          <Box py={16}>
            <Container maxW="5xl" mx="auto" px={4}>
              <Box 
                as="button"
                onClick={() => handleOpenPost(featuredPost)}
                textAlign="left"
                w="full"
                p={{ base: 8, md: 12 }} 
                borderRadius="3xl" 
                bg="gray.50" 
                border="1px solid" 
                borderColor="gray.200"
                transition="all 0.3s"
                boxShadow="sm"
                _hover={{ borderColor: "blue.500", boxShadow: "xl", transform: "translateY(-4px)" }}
                cursor="pointer"
              >
                <VStack align="flex-start" gap={6}>
                  <Badge colorPalette={categoryColors[featuredPost.category]} size="lg" borderRadius="full" px={4} py={1}>
                    {featuredPost.category}
                  </Badge>
                  <VStack align="flex-start" gap={3}>
                    <Heading as="h2" fontSize={{ base: "2xl", md: "4xl" }} fontWeight="800" color="gray.900" lineHeight="1.2">
                      {featuredPost.title}
                    </Heading>
                    <Text color="gray.600" fontSize={{ base: "lg", md: "xl" }} maxW="3xl">
                      {featuredPost.excerpt}
                    </Text>
                  </VStack>
                  <HStack gap={4} w="full" justify="space-between" align="center">
                    <HStack gap={2}>
                      <Text fontWeight="700" color="gray.900">{featuredPost.author}</Text>
                      <Text color="gray.400">·</Text>
                      <Text color="gray.500">{featuredPost.date}</Text>
                    </HStack>
                    <Text fontWeight="700" color="blue.600" fontSize="lg">Read Preview →</Text>
                  </HStack>
                </VStack>
              </Box>
            </Container>
          </Box>
        )}

        {/* Blog Grid */}
        <Box pb={24}>
          <Container maxW="5xl" mx="auto" px={4}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={10}>
              {gridPosts.map((post) => (
                <Box 
                  key={post.id}
                  as="button"
                  onClick={() => handleOpenPost(post)}
                  textAlign="left"
                  h="full"
                  p={8} 
                  borderRadius="2xl" 
                  bg="white" 
                  border="1px solid" 
                  borderColor="gray.200"
                  transition="all 0.3s"
                  boxShadow="sm"
                  display="flex"
                  flexDirection="column"
                  _hover={{ borderColor: "blue.500", boxShadow: "lg", transform: "translateY(-4px)" }}
                  cursor="pointer"
                >
                  <VStack align="flex-start" gap={4} flex="1">
                    <Badge colorPalette={categoryColors[post.category]} borderRadius="full" px={3}>
                      {post.category}
                    </Badge>
                    <Heading as="h3" fontSize="xl" fontWeight="700" color="gray.900" lineHeight="1.3">
                      {post.title}
                    </Heading>
                    <Text color="gray.600" fontSize="sm" lineHeight="1.6" lineClamp={3}>
                      {post.excerpt}
                    </Text>
                  </VStack>
                  <Box mt={6} pt={6} borderTop="1px solid" borderColor="gray.100" w="full">
                    <HStack justify="space-between" align="center">
                      <Text fontSize="xs" color="gray.400" fontWeight="600">{post.date}</Text>
                      <Text fontWeight="700" color="blue.600" fontSize="sm">Read Preview →</Text>
                    </HStack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </Container>
        </Box>
      </Box>

      {/* Pop-up Dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)} size="lg">
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content borderRadius="2xl" p={8} bg="white">
              {selectedPost && (
                <VStack align="flex-start" gap={6}>
                  <Badge colorPalette={categoryColors[selectedPost.category]} borderRadius="full" px={3}>
                    {selectedPost.category}
                  </Badge>
                  <Dialog.Header p={0}>
                    <Dialog.Title fontSize="3xl" fontWeight="800" color="gray.900">
                      {selectedPost.title}
                    </Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body p={0}>
                    <VStack align="flex-start" gap={4}>
                      <HStack gap={2} fontSize="sm" color="gray.500">
                        <Text fontWeight="700" color="gray.700">{selectedPost.author || "Plug and Play Team"}</Text>
                        <Text>·</Text>
                        <Text>{selectedPost.date}</Text>
                      </HStack>
                      <Text color="gray.600" fontSize="lg" lineHeight="1.7">
                        {selectedPost.content}
                      </Text>
                    </VStack>
                  </Dialog.Body>
                  <Dialog.Footer p={0} w="full" pt={6} borderTop="1px solid" borderColor="gray.100">
                    <HStack w="full" justify="space-between">
                      <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Close</Button>
                      <Link href={`/blog/${selectedPost.id}`} passHref>
                        <Button colorPalette="blue" px={8} borderRadius="full">
                          Read Full Article →
                        </Button>
                      </Link>
                    </HStack>
                  </Dialog.Footer>
                </VStack>
              )}
              <Dialog.CloseTrigger />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <Footer />
    </Box>
  );
}
