"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileTopBar } from "./MobileTopBar";
import { PageTransition } from "./PageTransition";

/**
 * Client-side shell. Owns the mobile drawer state so the sidebar and the
 * top-bar's hamburger can share it without needing context plumbing.
 *
 * Layout structure:
 *   - On lg+: Sidebar sits as a flex column on the left, main fills the rest.
 *   - On <lg: Sidebar is a drawer overlay (zero layout footprint). MobileTopBar
 *     pins to the top of main and provides the menu trigger.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative z-10 flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main className="flex-1 min-w-0 relative">
        <MobileTopBar onMenuClick={() => setMobileOpen(true)} />
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
