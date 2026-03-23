"use client";

import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Send, CheckCircle, AlertTriangle } from "lucide-react";
import { Button, Input, Textarea, VStack, Field } from "@chakra-ui/react";
import {
  API_ENDPOINTS,
  DEFAULT_CONTACT_SUBJECT,
  CONTACT_FORM_MESSAGES,
} from "@/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionBox = motion.create(Box as any);

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: DEFAULT_CONTACT_SUBJECT,
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError(CONTACT_FORM_MESSAGES.REQUIRED_FIELDS);
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.CONTACT_PROXY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : CONTACT_FORM_MESSAGES.ERROR,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      as="section"
      py={{ base: "14", md: "24" }}
      px={{ base: "4", md: "6" }}
      bg="#F8FAFF"
      id="contact"
    >
      <Box maxW="2xl" mx="auto">
        <MotionBox
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <Flex justify="center" mb="4">
            <Box
              px="4"
              py="1.5"
              bg="blue.50"
              color="blue.600"
              rounded="full"
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="600"
            >
              Get in touch
            </Box>
          </Flex>
          <Heading
            as="h2"
            fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
            fontWeight="800"
            textAlign="center"
            mb="3"
            lineHeight="1.1"
            color="gray.900"
          >
            We&apos;d love to hear from you
          </Heading>
          <Text
            color="gray.500"
            fontSize={{ base: "sm", md: "md" }}
            textAlign="center"
            mb="10"
            maxW="lg"
            mx="auto"
          >
            Have a question or want to know more? Drop us a message and
            we&apos;ll get back to you.
          </Text>

          {submitted ? (
            <Flex
              direction="column"
              align="center"
              gap="4"
              bg="white"
              p="10"
              rounded="2xl"
              border="1px solid"
              borderColor="blue.100"
              boxShadow="0 4px 20px rgba(79,70,229,0.06)"
            >
              <CheckCircle size={40} color="#4F46E5" />
              <Text fontWeight="700" fontSize="lg" color="gray.900">
                {CONTACT_FORM_MESSAGES.SUCCESS}
              </Text>
              <Text color="gray.500" fontSize="sm" textAlign="center">
                Thanks for reaching out. We&apos;ll get back to you shortly.
              </Text>
            </Flex>
          ) : (
            <Box
              bg="white"
              p={{ base: "6", md: "10" }}
              rounded="2xl"
              border="1px solid"
              borderColor="blue.100"
              boxShadow="0 4px 20px rgba(79,70,229,0.06)"
            >
              <form onSubmit={handleSubmit}>
                <VStack gap="7" align="stretch">
                  {/* Name */}
                  <Field.Root invalid={!form.name && !!error}>
                    <Field.Label
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                      mb="3"
                    >
                      Your name
                    </Field.Label>
                    <Input
                      required
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      size="lg"
                      borderRadius="xl-custom"
                      px="5"
                      bg="white"
                    />
                  </Field.Root>

                  {/* Email */}
                  <Field.Root invalid={!form.email && !!error}>
                    <Field.Label
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                      mb="3"
                    >
                      Email address
                    </Field.Label>
                    <Input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      size="lg"
                      borderRadius="xl-custom"
                      px="5"
                      bg="white"
                    />
                  </Field.Root>

                  {/* Subject */}
                  <Field.Root invalid={!form.subject && !!error}>
                    <Field.Label
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                      mb="3"
                    >
                      Subject
                    </Field.Label>
                    <Input
                      required
                      placeholder="Inquiry"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      size="lg"
                      borderRadius="xl-custom"
                      px="5"
                      bg="white"
                    />
                  </Field.Root>

                  {/* Message */}
                  <Field.Root invalid={!form.message && !!error}>
                    <Field.Label
                      fontSize="sm"
                      fontWeight="600"
                      color="gray.700"
                      mb="3"
                    >
                      Message
                    </Field.Label>
                    <Textarea
                      required
                      placeholder="Tell us what's on your mind..."
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      rows={5}
                      size="lg"
                      borderRadius="xl-custom"
                      p="4"
                      px="5"
                      bg="white"
                      resize="vertical"
                    />
                  </Field.Root>

                  {error && (
                    <Flex align="center" gap={2} color="red.500">
                      <AlertTriangle size={14} />
                      <Text fontSize="xs" fontWeight="600">
                        {error}
                      </Text>
                    </Flex>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    loading={loading}
                    loadingText="Sending..."
                    size="lg"
                    h="52px"
                    bg="#4F46E5"
                    color="white"
                    rounded="14px"
                    _hover={{ bg: "#4338CA", transform: "translateY(-1px)" }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                  >
                    Send message
                    <Send size={15} style={{ marginLeft: "8px" }} />
                  </Button>
                </VStack>
              </form>
            </Box>
          )}
        </MotionBox>
      </Box>
    </Box>
  );
}
