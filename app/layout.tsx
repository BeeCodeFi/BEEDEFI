import type { Metadata, Viewport } from "next";
import { Sora, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { CursorGlow } from "@/components/layout/CursorGlow";
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

// Mobile viewport defaults. `viewportFit: cover` is what makes
// `env(safe-area-inset-*)` actually have non-zero values on notched devices.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05060a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // Horizontal overflow clipping lives on <html>, not <body>. Putting it on
      // <body> makes <body> a scroll container, which breaks `position: sticky`
      // for descendants (notably the Sidebar) — they'd scroll with the page
      // instead of pinning to the viewport.
      className={`${sora.variable} ${geistMono.variable} dark overflow-x-hidden`}
    >
      <body className="min-h-screen">
        <AmbientBackdrop />
        <AppShell>{children}</AppShell>
        <CursorGlow />
      </body>
    </html>
  );
}
