import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tesla Inspired Landing",
  description: "A premium Tesla-inspired landing page built with Next.js and Tailwind CSS.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
