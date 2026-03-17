"use client";

import { AuthProvider } from "@/store/AuthProvider";

export default function DeleteAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider redirectToDashboard={false}>{children}</AuthProvider>;
}
