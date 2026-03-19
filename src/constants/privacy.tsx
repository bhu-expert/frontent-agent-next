import { VStack, Text } from "@chakra-ui/react";
import { Shield, Lock, Trash2, Mail, Globe, Cpu, Eye, Database } from "lucide-react";

export const LAST_UPDATED = "March 17, 2026";
export const CONTACT_EMAIL = "contact@plugandplayagents.com";

export const sections = [
  {
    number: "01",
    title: "Introduction",
    icon: Shield,
    iconBg: "purple.50",
    iconColor: "purple.600",
    content: (
      <VStack align="stretch" gap={4} color="gray.600" fontSize="15px" lineHeight="1.9">
        <Text>
          Plug and Play Agent ("we", "our", or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your
          information when you use our AI-powered Instagram growth platform and related
          services (collectively, the "Service").
        </Text>
        <Text>
          By using Plug and Play Agent, you agree to the collection and use of information
          in accordance with this policy. If you do not agree with our policies and
          practices, please do not use our Service.
        </Text>
      </VStack>
    ),
  },
  {
    number: "02",
    title: "Information We Collect",
    icon: Database,
    iconBg: "blue.50",
    iconColor: "blue.600",
    content: (
      <VStack align="stretch" gap={8} color="gray.600" fontSize="15px" lineHeight="1.9">
        {[
          {
            sub: "Personal Information",
            desc: "When you create an account, we collect:",
            items: ["Email address", "Name", "Password (encrypted)", "Profile information"],
          },
          {
            sub: "Social Media Account Information",
            desc: "When you connect Instagram accounts, we collect:",
            items: [
              "Public profile information from connected platforms",
              "Page information and permissions you grant",
              "Content you publish through our Service",
              "Engagement metrics and analytics data",
            ],
          },
          {
            sub: "Usage Data",
            desc: "We automatically collect information about how you use our Service:",
            items: [
              "Device information (browser type, operating system)",
              "IP address and access times",
              "Pages visited and features used",
              "Click patterns and interactions",
            ],
          },
        ].map((block) => (
          <VStack align="stretch" key={block.sub} gap={1}>
            <Text fontWeight="700" color="gray.800" mb={1} fontSize="14px"
              textTransform="uppercase" letterSpacing="0.06em">
              {block.sub}
            </Text>
            <Text mb={2}>{block.desc}</Text>
            <VStack align="stretch" gap={1.5} pl={4} borderLeft="2px solid" borderColor="blue.100">
              {block.items.map((item) => (
                <Text key={item} fontSize="14px" color="gray.500">→ {item}</Text>
              ))}
            </VStack>
          </VStack>
        ))}
      </VStack>
    ),
  },
  {
    number: "03",
    title: "How We Use Your Information",
    icon: Cpu,
    iconBg: "orange.50",
    iconColor: "orange.500",
    content: (
      <VStack align="stretch" gap={2} color="gray.600" fontSize="15px" lineHeight="1.9">
        <Text mb={2}>We use the collected information for the following purposes:</Text>
        <VStack align="stretch" gap={1.5} pl={4} borderLeft="2px solid" borderColor="orange.100">
          {[
            "To provide, maintain, and improve our Service",
            "To publish content to your connected Instagram account",
            "To send you technical notices and support messages",
            "To respond to your comments and questions",
            "To develop new features and services",
            "To monitor and analyze trends, usage, and activities",
            "To detect, investigate, and prevent fraudulent transactions",
            "To personalize your experience",
          ].map((item) => (
            <Text key={item} fontSize="14px" color="gray.500">→ {item}</Text>
          ))}
        </VStack>
      </VStack>
    ),
  },
  {
    number: "04",
    title: "Data Sharing & Third Parties",
    icon: Globe,
    iconBg: "teal.50",
    iconColor: "teal.600",
    content: (
      <VStack align="stretch" gap={4} color="gray.600" fontSize="15px" lineHeight="1.9">
        <Text>
          We do not sell, trade, or rent your personal information to third parties.
          We may share your data only in the following limited circumstances:
        </Text>
        <VStack align="stretch" gap={1.5} pl={4} borderLeft="2px solid" borderColor="teal.100">
          {[
            "With service providers who assist in operating our platform (e.g. Supabase, Stripe)",
            "When required by law or to respond to legal processes",
            "To protect the rights and safety of Plug and Play Agent and its users",
            "In connection with a business merger or acquisition (users notified in advance)",
          ].map((item) => (
            <Text key={item} fontSize="14px" color="gray.500">→ {item}</Text>
          ))}
        </VStack>
      </VStack>
    ),
  },
  {
    number: "05",
    title: "Your Rights",
    icon: Eye,
    iconBg: "green.50",
    iconColor: "green.600",
    content: (
      <VStack align="stretch" gap={4} color="gray.600" fontSize="15px" lineHeight="1.9">
        <Text>
          Depending on your location, you may have the following rights regarding your
          personal data under GDPR, CCPA, or applicable local laws:
        </Text>
        <VStack align="stretch" gap={1.5} pl={4} borderLeft="2px solid" borderColor="green.100">
          {[
            "Right to access — request a copy of your personal data",
            "Right to rectification — correct inaccurate or incomplete data",
            "Right to erasure — request deletion of your data",
            "Right to portability — receive your data in a structured format",
            "Right to object — opt out of certain processing activities",
            "Right to restrict processing — limit how we use your data",
          ].map((item) => (
            <Text key={item} fontSize="14px" color="gray.500">→ {item}</Text>
          ))}
        </VStack>
        <Text>
          To exercise any of these rights, please contact us at{" "}
          <Text as="span" color="purple.600" fontWeight="600">
            {CONTACT_EMAIL}
          </Text>
          . We will respond within 30 days.
        </Text>
      </VStack>
    ),
  },
  {
    number: "06",
    title: "Data Retention & Security",
    icon: Lock,
    iconBg: "red.50",
    iconColor: "red.500",
    content: (
      <VStack align="stretch" gap={4} color="gray.600" fontSize="15px" lineHeight="1.9">
        <Text>
          We retain your personal data for as long as your account is active or as needed
          to provide our Service. Upon account deletion, your data is permanently removed
          within 30 days, except where required by law.
        </Text>
        <Text>
          We implement industry-standard security measures including AES-256 encryption
          at rest, TLS 1.3 in transit, regular security audits, and strict access controls
          to protect your data from unauthorized access, alteration, or disclosure.
        </Text>
      </VStack>
    ),
  },
];
