import { Metadata } from "next";
import PrivacyPolicyPage from "@/components/privacy/page";

export const metadata: Metadata = {
  title: "Privacy Policy | Plug and Play Agent",
  description: "Read our privacy policy.",
};

export default function Page() {
  return <PrivacyPolicyPage />;
}