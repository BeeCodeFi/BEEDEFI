"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, NAV_FOOTER_ITEMS } from "@/lib/nav";

/**
 * Lightweight command palette. Opens via Cmd+K / Ctrl+K or the dock Search /
 * Palette buttons. Filters routes by label — no fuzzy matching (yet). The
 * first item is auto-selected so Enter navigates instantly.
 */

type Props = {
  open: boolean;
  onClose: () => void;
};

const ALL_ROUTES = [...NAV_ITEMS, ...NAV_FOOTER_ITEMS];

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  const filtered = query.trim()
    ? ALL_ROUTES.filter((r) =>
        r.label.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_ROUTES;

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      // Focus after the animation frame so the input is rendered
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Keyboard nav
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (i + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" && filtered[activeIdx]) {
        e.preventDefault();
        router.push(filtered[activeIdx].href);
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [filtered, activeIdx, router, onClose]
  );

  // Close on Escape (global fallback for when input isn't focused)
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[20vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-[101] glass glass-edge rounded-xl overflow-hidden shadow-2xl"
            onKeyDown={handleKeyDown}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-edge">
              <Search className="w-4 h-4 text-ink-3 shrink-0" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(0);
                }}
                placeholder="Jump to…"
                className="flex-1 bg-transparent border-0 outline-none text-sm font-body text-ink-1 placeholder:text-ink-3"
              />
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono text-ink-3 border border-edge bg-white/[0.03]">
                esc
              </kbd>
            </div>

            {/* Results */}
            <ul className="max-h-[40vh] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <li className="px-4 py-6 text-center text-[12px] text-ink-3 font-mono uppercase tracking-wider">
                  No matches
                </li>
              ) : (
                filtered.map((route, i) => {
                  const Icon = route.icon;
                  const active = i === activeIdx;
                  return (
                    <li key={route.href}>
                      <button
                        type="button"
                        onClick={() => {
                          router.push(route.href);
                          onClose();
                        }}
                        onMouseEnter={() => setActiveIdx(i)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                          active
                            ? "bg-white/[0.06]"
                            : "hover:bg-white/[0.03]"
                        )}
                      >
                        <Icon
                          className={cn("w-4 h-4 shrink-0", active ? "text-signal-cyan" : "text-ink-3")}
                          strokeWidth={1.5}
                        />
                        <span className={cn("flex-1 text-sm", active ? "text-ink-1" : "text-ink-2")}>
                          {route.label}
                        </span>
                        {active && (
                          <ArrowRight className="w-3.5 h-3.5 text-signal-cyan" strokeWidth={1.5} />
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
