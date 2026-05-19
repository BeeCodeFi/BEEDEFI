import type { Metadata } from "next";
import { Sora, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { CursorGlow } from "@/components/layout/CursorGlow";
import { PageTransition } from "@/components/layout/PageTransition";
import { AmbientBackdrop } from "@/components/fx/AmbientBackdrop";

// next/font generates self-hosted font files at build time and exposes them as CSS variables.
// We reference these var names in tailwind.config.ts under fontFamily.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BEEDEFI — Workspace for the Augmented Mind",
  description:
    "An AI-native personal workspace for content, learning, career, and growth.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen overflow-x-hidden">
        {/*
          Layered background system — each is fixed and pointer-events-none so they never
          intercept interaction. Z-index goes from 0 (deepest) up to 10 (cursor).
        */}
        <AmbientBackdrop />

        <div className="relative z-10 flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 relative">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>

        {/* Cursor glow sits on top of everything, ignores pointer events */}
        <CursorGlow />
      </body>
    </html>
  );
}
