import { Metadata } from "next";
import { notFound } from "next/navigation";
import { posts } from "@/constants/blog";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Box, Container, Heading, Text, Badge, VStack, HStack
} from "@chakra-ui/react";
import NextLink from "next/link";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = posts.find((p) => p.id === Number(resolvedParams.id));
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} | Plug and Play Agents`,
    description: post.excerpt,
  };
}

export async function generateStaticParams() {
  return posts.map((p) => ({ id: String(p.id) }));
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = posts.find((p) => p.id === Number(resolvedParams.id));
  if (!post) notFound();

  return (
    <Box minH="100vh" bg="white" display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1" pt={{ base: "32", md: "44" }} pb={24}>
        <Container maxW="2xl" mx="auto" px={6}>
          <VStack align="stretch" gap={8}>
            <NextLink href="/blog">
              <Text color="blue.600" fontWeight="600" fontSize="sm">
                ← Back to Blog
              </Text>
            </NextLink>
            <VStack align="flex-start" gap={4}>
              <Badge colorPalette="purple" borderRadius="full" px={3}>
                {post.category}
              </Badge>
              <Heading
                as="h1"
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="800"
                color="gray.900"
                lineHeight="1.2"
              >
                {post.title}
              </Heading>
              <HStack gap={2} fontSize="sm" color="gray.500">
                <Text fontWeight="700" color="gray.700">
                  {post.author || "Plug and Play Team"}
                </Text>
                <Text>·</Text>
                <Text>{post.date}</Text>
              </HStack>
            </VStack>
            <Text
              color="gray.600"
              fontSize={{ base: "md", md: "lg" }}
              lineHeight="1.8"
            >
              {post.content}
            </Text>
          </VStack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
