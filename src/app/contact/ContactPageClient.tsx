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
  Input,
  Textarea,
  Button,
  Field,
  IconButton,
  Link,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { Mail, Instagram, Twitter, MessageSquare, Send, CheckCircle, ArrowRight, Home } from "lucide-react";
import { CONTACT_EMAIL } from "@/constants/contact";
import { motion, AnimatePresence } from "framer-motion";
import NextLink from "next/link";

export default function ContactPageClient() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.subject.trim()) newErrors.subject = "Subject is required";

    if (!form.message.trim()) {
      newErrors.message = "Message is required";
    } else if (form.message.trim().length < 20) {
      newErrors.message = "Message must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSuccessMessage(data.message || "Thanks for reaching out! We've received your inquiry and our team will get back to you within 24 hours.");
      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toaster.create({
        title: "Failed to send",
        description: message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box flex="1" as="main" py={{ base: 20, md: 32 }} bg="white">
      <Container maxW="6xl" mx="auto" px={4}>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 16, lg: 24 }}>

          {/* Left Side: Info + Socials */}
          <VStack align="flex-start" gap={10}>
            <VStack align="flex-start" gap={4}>
              <Heading
                as="h1"
                fontSize={{ base: "4xl", md: "5xl" }}
                fontWeight="800"
                color="gray.900"
                letterSpacing="-0.02em"
              >
                Get in touch
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="md">
                Have a question, feedback, or just want to say hi? We&apos;d
                love to hear from you.
              </Text>
            </VStack>

            <VStack align="flex-start" gap={6}>
              <HStack gap={4}>
                <Box p={3} bg="blue.50" color="blue.600" borderRadius="lg">
                  <Mail size={24} />
                </Box>
                <Box>
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="widest"
                    color="gray.400"
                    mb={1}
                  >
                    Email Us
                  </Text>
                  <Link
                    href={`mailto:${CONTACT_EMAIL}`}
                    fontSize="lg"
                    fontWeight="600"
                    color="gray.900"
                    _hover={{ color: "blue.600" }}
                    variant="plain"
                  >
                    {CONTACT_EMAIL}
                  </Link>
                </Box>
              </HStack>

              <VStack align="flex-start" gap={4}>
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="widest"
                  color="gray.400"
                >
                  Follow us
                </Text>
                <HStack gap={4}>
                  {[
                    { icon: <MessageSquare size={20} />, label: "Discord" },
                    { icon: <Instagram size={20} />, label: "Instagram" },
                    { icon: <Twitter size={20} />, label: "X" },
                  ].map((social) => (
                    <IconButton
                      key={social.label}
                      aria-label={social.label}
                      variant="ghost"
                      color="gray.500"
                      _hover={{
                        color: "blue.600",
                        bg: "blue.50",
                        transform: "translateY(-2px)",
                      }}
                      borderRadius="xl"
                      size="lg"
                      transition="all 0.2s"
                      asChild
                    >
                      <a href="#">{social.icon}</a>
                    </IconButton>
                  ))}
                </HStack>
              </VStack>
            </VStack>

            <Box
              p={4}
              bg="blue.50"
              borderRadius="xl"
              borderLeft="4px solid"
              borderColor="blue.500"
            >
              <Text fontSize="sm" color="blue.800" fontWeight="600">
                ⚡ We typically reply within 24 hours.
              </Text>
            </Box>
          </VStack>

          {/* Right Side: Form */}
          <Box w="full" maxW="500px" mx={{ base: "auto", md: "0" }}>
            <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: "100%" }}
              >
                <VStack
                  bg="white"
                  p={{ base: 8, md: 12 }}
                  borderRadius="3xl"
                  border="1px solid"
                  borderColor="blue.100"
                  boxShadow="2xl"
                  gap={8}
                  align="center"
                  textAlign="center"
                  position="relative"
                  overflow="hidden"
                >
                  {/* Background Accents */}
                  <Box
                    position="absolute"
                    top="-20px"
                    right="-20px"
                    w="150px"
                    h="150px"
                    bg="blue.50"
                    borderRadius="full"
                    opacity={0.5}
                    zIndex={0}
                  />
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", damping: 12 }}
                  >
                    <Box
                      p={5}
                      bg="blue.600"
                      color="white"
                      borderRadius="2xl"
                      boxShadow="0 10px 25px -5px rgba(37, 99, 235, 0.4)"
                      position="relative"
                      zIndex={1}
                    >
                      <CheckCircle size={40} strokeWidth={2.5} />
                    </Box>
                  </motion.div>

                  <VStack gap={3} position="relative" zIndex={1}>
                    <Heading size="2xl" color="gray.900" letterSpacing="tight">
                      Message Sent!
                    </Heading>
                    <Text color="gray.600" fontSize="lg" lineHeight="1.6" maxW="320px">
                      {successMessage}
                    </Text>
                  </VStack>

                  <VStack w="full" gap={3} pt={4} position="relative" zIndex={1}>
                    <Button
                      colorPalette="blue"
                      size="lg"
                      w="full"
                      h="56px"
                      borderRadius="xl"
                      fontSize="md"
                      fontWeight="bold"
                      asChild
                    >
                      <NextLink href="/">
                        <Home size={18} style={{ marginRight: "8px" }} />
                        Back to Home
                      </NextLink>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      color="gray.500"
                      onClick={() => setIsSuccess(false)}
                      fontSize="sm"
                      _hover={{ color: "blue.600", bg: "blue.50" }}
                    >
                      Send another message
                      <ArrowRight size={14} style={{ marginLeft: "4px" }} />
                    </Button>
                  </VStack>
                </VStack>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box 
                  bg="white" 
                  p={{ base: 6, md: 10 }}
                  borderRadius="3xl" 
                  border="1px solid" 
                  borderColor="gray.100" 
                  boxShadow="2xl"
                >
                <form onSubmit={handleSubmit}>
                  <VStack gap={6}>
                    <Field.Root invalid={!!errors.name} width="full">
                      <Field.Label
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="widest"
                        color="gray.500"
                        mb={1}
                      >
                        Name
                      </Field.Label>
                      <Input 
                        placeholder="Jane Doe" 
                        size="lg"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        borderRadius="xl"
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.100"
                        h="52px"
                        px={4}
                        _focus={{ 
                          borderColor: "blue.500", 
                          bg: "white", 
                          boxShadow: "0 0 0 1px #2563eb",
                        }}
                      />
                      <Field.ErrorText>{errors.name}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.email} width="full">
                      <Field.Label
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="widest"
                        color="gray.500"
                        mb={1}
                      >
                        Email
                      </Field.Label>
                      <Input 
                        type="email"
                        placeholder="jane@example.com" 
                        size="lg"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        borderRadius="xl"
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.100"
                        h="52px"
                        px={4}
                        _focus={{ 
                          borderColor: "blue.500", 
                          bg: "white", 
                          boxShadow: "0 0 0 1px #2563eb",
                        }}
                      />
                      <Field.ErrorText>{errors.email}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.subject} width="full">
                      <Field.Label
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="widest"
                        color="gray.500"
                        mb={1}
                      >
                        Subject
                      </Field.Label>
                      <Input 
                        placeholder="Inquiry about growth" 
                        size="lg"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        borderRadius="xl"
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.100"
                        h="52px"
                        px={4}
                        _focus={{ 
                          borderColor: "blue.500", 
                          bg: "white", 
                          boxShadow: "0 0 0 1px #2563eb",
                        }}
                      />
                      <Field.ErrorText>{errors.subject}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.message} width="full">
                      <Field.Label
                        fontSize="xs"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="widest"
                        color="gray.500"
                        mb={1}
                      >
                        Message
                      </Field.Label>
                      <Textarea 
                        placeholder="Tell us about your project..." 
                        size="lg"
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        borderRadius="xl"
                        bg="gray.50"
                        border="1px solid"
                        borderColor="gray.100"
                        p={4}
                        _focus={{ 
                          borderColor: "blue.500", 
                          bg: "white", 
                          boxShadow: "0 0 0 1px #2563eb",
                        }}
                        resize="none"
                      />
                      <Field.ErrorText>{errors.message}</Field.ErrorText>
                    </Field.Root>

                    <Button 
                      type="submit" 
                      colorPalette="blue" 
                      size="lg" 
                      w="full" 
                      h="56px" 
                      borderRadius="xl" 
                      fontSize="md" 
                      fontWeight="bold"
                      loading={isSubmitting}
                      loadingText="Sending..."
                      _hover={{ transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}
                    >
                      Send Message
                      <Send size={18} style={{ marginLeft: "8px" }} />
                    </Button>
                  </VStack>
                </form>
              </Box>
            </motion.div>
            )}
          </AnimatePresence>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
