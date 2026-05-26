"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsLeft, ChevronsRight, Hexagon, X } from "lucide-react";
import { NAV_ITEMS, NAV_FOOTER_ITEMS, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/cn";

const SIDEBAR_WIDTH_EXPANDED = 248;
const SIDEBAR_WIDTH_COLLAPSED = 76;

/**
 * Responsive sidebar.
 *
 *   - ≥lg (1024px): pinned to the viewport, takes layout space, can be
 *     collapsed/expanded by the user (current desktop behavior).
 *   - <lg          : behaves as an overlay drawer. Hidden by default and
 *     slid off-screen via translate. The hamburger in MobileTopBar opens it,
 *     a backdrop or route-change closes it. No layout space is reserved on
 *     mobile — main content fills the full viewport width.
 *
 * The drawer state (open/close) is owned by AppShell so MobileTopBar can
 * trigger it.
 */
type Props = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function Sidebar({ mobileOpen, onMobileClose }: Props) {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  // Close the drawer whenever the route changes — otherwise tapping a nav link
  // leaves the overlay covering the page they just navigated to.
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll while drawer is open on mobile. Without this, scrolling
  // the open menu bleeds into the page underneath.
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onMobileClose]);

  const width = expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;
  const spring = { type: "spring" as const, stiffness: 260, damping: 28 };

  return (
    <>
      {/* Layout spacer — only present on lg+ where the sidebar reserves real
          horizontal space. On mobile the sidebar floats above content. */}
      <motion.div
        animate={{ width }}
        transition={spring}
        className="hidden lg:block shrink-0"
        aria-hidden
      />

      {/* Backdrop — mobile only, fades in behind the drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* The visible sidebar. On desktop: width-animates between collapsed/expanded
          via the framer animate prop. On mobile: width is fixed (drawer width) and
          we translate it on/off-screen instead. */}
      <motion.aside
        animate={{ width }}
        transition={spring}
        className={cn(
          "fixed top-0 left-0 h-screen z-40",
          // Mobile drawer: fixed width, slide-in
          "max-lg:!w-[280px]",
          "max-lg:transition-transform max-lg:duration-300 max-lg:ease-out",
          mobileOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
        )}
        aria-hidden={!mobileOpen ? undefined : false}
      >
        <div className="glass glass-edge h-full flex flex-col px-3 py-5 rounded-r-2xl">
          {/* Brand row — on mobile shows a close button on the right */}
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
              {(expanded || mobileOpen) && (
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

            {/* Mobile close — only shown when drawer is open and <lg */}
            <button
              type="button"
              onClick={onMobileClose}
              className="ml-auto lg:hidden text-ink-3 hover:text-ink-1 transition-colors p-1.5 -m-1.5 rounded-md"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Primary nav */}
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={pathname === item.href}
                expanded={expanded || mobileOpen}
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
                expanded={expanded || mobileOpen}
              />
            ))}

            {/* Collapse toggle — desktop only. The hamburger handles mobile. */}
            <button
              onClick={() => setExpanded((v) => !v)}
              className="hidden lg:flex mt-2 items-center gap-3 px-3 h-10 rounded-lg text-ink-3 hover:text-ink-1 hover:bg-white/[0.03] transition-colors"
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
    </>
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
        // Slightly taller hit area on mobile for fingers; back to 11/h-11 on lg+
        "group relative flex items-center gap-3 px-3 h-12 lg:h-11 rounded-lg",
        "transition-colors duration-200",
        active
          ? cn("bg-white/[0.04]", glowClass)
          : "text-ink-3 hover:text-ink-1 hover:bg-white/[0.02]"
      )}
    >
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
