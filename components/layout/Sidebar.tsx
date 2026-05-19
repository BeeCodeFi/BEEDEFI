"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsLeft, ChevronsRight, Hexagon } from "lucide-react";
import { NAV_ITEMS, NAV_FOOTER_ITEMS, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/cn";

const SIDEBAR_WIDTH_EXPANDED = 248;
const SIDEBAR_WIDTH_COLLAPSED = 76;

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <motion.aside
      // Animate width itself rather than mounting/unmounting children — see notes in the
      // Phase 1 walkthrough about why this matters for perceived quality.
      animate={{
        width: expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="sticky top-0 h-screen shrink-0 z-40"
    >
      <div className="glass glass-edge h-full flex flex-col px-3 py-5 rounded-r-2xl">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 mb-8 h-10">
          <div className="relative shrink-0">
            <Hexagon className="w-7 h-7 text-signal-cyan" strokeWidth={1.5} />
            <Hexagon
              className="absolute inset-0 w-7 h-7 text-signal-cyan animate-breathe"
              strokeWidth={1.5}
              style={{ filter: "blur(8px)", opacity: 0.6 }}
            />
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-display font-semibold tracking-[0.2em] text-sm whitespace-nowrap"
              >
                BEEDEFI
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              expanded={expanded}
            />
          ))}
        </nav>

        {/* Footer nav */}
        <div className="mt-6 pt-6 border-t border-edge flex flex-col gap-1">
          {NAV_FOOTER_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              expanded={expanded}
            />
          ))}

          {/* Collapse toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 flex items-center gap-3 px-3 h-10 rounded-lg text-ink-3 hover:text-ink-1 hover:bg-white/[0.03] transition-colors"
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? (
              <ChevronsLeft className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronsRight className="w-4 h-4 shrink-0" />
            )}
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-mono uppercase tracking-wider whitespace-nowrap"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

function NavLink({
  item,
  active,
  expanded,
}: {
  item: NavItem;
  active: boolean;
  expanded: boolean;
}) {
  const Icon = item.icon;

  // Map accent colors to the glow shadow utility. Doing this as a lookup rather
  // than template-stringing `shadow-glow-${item.accent}` is critical — Tailwind
  // can't see dynamic class names during build, so they'd be purged.
  const glowClass = {
    cyan: "shadow-glow-cyan-sm",
    magenta: "shadow-glow-magenta",
    amber: "shadow-glow-amber",
  }[item.accent];

  const iconColor = {
    cyan: "text-signal-cyan",
    magenta: "text-signal-magenta",
    amber: "text-signal-amber",
  }[item.accent];

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 px-3 h-11 rounded-lg",
        "transition-colors duration-200",
        active
          ? cn("bg-white/[0.04]", glowClass)
          : "text-ink-3 hover:text-ink-1 hover:bg-white/[0.02]"
      )}
    >
      {/* Active state: an inset vertical bar on the left edge */}
      {active && (
        <motion.span
          layoutId="nav-active-bar"
          className={cn("absolute left-0 top-2 bottom-2 w-px", iconColor)}
          style={{
            background: `currentColor`,
            boxShadow: `0 0 8px currentColor`,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      <Icon
        className={cn(
          "w-[18px] h-[18px] shrink-0 transition-colors",
          active ? iconColor : "text-ink-3 group-hover:text-ink-1"
        )}
        strokeWidth={1.75}
      />

      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "text-[13px] font-medium whitespace-nowrap",
              active ? "text-ink-1" : ""
            )}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badge — pushed to the right end when expanded */}
      {expanded && item.badge && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-auto text-[9px] font-mono uppercase tracking-wider text-ink-3 px-1.5 py-0.5 rounded-sm border border-edge"
        >
          {item.badge}
        </motion.span>
      )}
    </Link>
  );
}
