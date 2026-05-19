"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";

/**
 * The single component every "coming soon" placeholder route renders. Driven
 * by props from each route file so we don't repeat the chrome.
 */
export function PhasePlaceholder({
  title,
  phase,
  description,
}: {
  title: string;
  phase: number;
  description: string;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ink-3 hover:text-ink-1 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to dashboard
        </Link>

        <GlassPanel edge className="p-10 text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-3 mb-4">
            Phase {phase} · scheduled
          </p>
          <h1 className="font-display text-display-md font-light tracking-tight text-ink-1 mb-3">
            {title}
          </h1>
          <p className="text-sm text-ink-2 leading-relaxed max-w-md mx-auto">
            {description}
          </p>

          {/* Decorative loading bar — not functional, just signals build state */}
          <div className="mt-8 mx-auto max-w-xs h-px bg-edge relative overflow-hidden">
            <div
              className="absolute inset-y-0 w-1/3"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(94,240,255,0.6), transparent)",
                animation: "shimmer 2s linear infinite",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
