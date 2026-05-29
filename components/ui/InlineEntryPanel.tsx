"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PencilLine, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Collapsible panel that wraps inline data-entry forms on each page.
 * Starts collapsed; click to expand.
 */
export function InlineEntryPanel({
  children,
  accent = "cyan",
}: {
  children: React.ReactNode;
  accent?: "cyan" | "magenta" | "amber";
}) {
  const [open, setOpen] = useState(false);

  const accentClasses = {
    cyan: "border-signal-cyan/30 hover:border-signal-cyan/50 text-signal-cyan",
    magenta: "border-signal-magenta/30 hover:border-signal-magenta/50 text-signal-magenta",
    amber: "border-signal-amber/30 hover:border-signal-amber/50 text-signal-amber",
  } as const;

  return (
    <section className="mt-8">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl border bg-white/[0.02] transition-colors",
          accentClasses[accent]
        )}
      >
        <div className="flex items-center gap-3">
          <PencilLine className="w-4 h-4" strokeWidth={1.5} />
          <span className="text-xs font-mono uppercase tracking-wider">
            {open ? "Close editor" : "Add / edit data"}
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-5 pb-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
