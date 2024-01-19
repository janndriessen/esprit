"use client";
import Navigationbar from "@/components/Navigationbar";
import { Web3AuthProvider } from "@/provider/Web3AuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Web3AuthProvider>{children}</Web3AuthProvider>
    </main>
  );
}
