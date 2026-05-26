"use client";

import { Hexagon, Menu } from "lucide-react";

/**
 * Sticky top bar shown only below the lg breakpoint. Carries the brand mark
 * plus a hamburger that opens the sidebar drawer. The hamburger receives its
 * state from AppShell so it stays in sync with the drawer.
 *
 * The bar is part of normal flow (not fixed) so the page below it keeps its
 * sticky/scroll behavior intact. Translucent glass keeps the cinematic feel
 * while letting the ambient backdrop show through.
 */
type Props = {
  onMenuClick: () => void;
};

export function MobileTopBar({ onMenuClick }: Props) {
  return (
    <header
      className="lg:hidden sticky top-0 z-30 glass glass-edge border-b border-edge px-4 h-14 flex items-center justify-between"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <Hexagon className="w-5 h-5 text-signal-cyan" strokeWidth={1.5} />
          <Hexagon
            className="absolute inset-0 w-5 h-5 text-signal-cyan animate-breathe"
            strokeWidth={1.5}
            style={{ filter: "blur(6px)", opacity: 0.6 }}
          />
        </div>
        <span className="font-display font-semibold tracking-[0.18em] text-xs">
          BEEDEFI
        </span>
      </div>

      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-2 hover:text-ink-1 hover:bg-white/[0.05] transition-colors -mr-1"
      >
        <Menu className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </header>
  );
}
