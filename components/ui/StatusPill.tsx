"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { AgentStatus } from "@/lib/agents";

/**
 * Compact status indicator: colored dot + uppercase mono label. The dot's
 * animation encodes the state — pulse for thinking, slow spin-like opacity
 * sweep for working, stutter for blocked, gentle breathe for idle.
 *
 * The visual language is intentionally consistent with the rest of the app
 * (signal hues, font-mono uppercase, tracking-wider).
 */

type Props = {
  status: AgentStatus;
  className?: string;
};

const STATUS_META: Record<
  AgentStatus,
  { label: string; dot: string; text: string; ring: string }
> = {
  idle:     { label: "Idle",     dot: "bg-ink-3",          text: "text-ink-3",          ring: "" },
  thinking: { label: "Thinking", dot: "bg-signal-magenta", text: "text-signal-magenta", ring: "ring-1 ring-signal-magenta/30" },
  working:  { label: "Working",  dot: "bg-signal-cyan",    text: "text-signal-cyan",    ring: "ring-1 ring-signal-cyan/30" },
  blocked:  { label: "Blocked",  dot: "bg-signal-amber",   text: "text-signal-amber",   ring: "ring-1 ring-signal-amber/30" },
};

const DOT_ANIM: Record<AgentStatus, Parameters<typeof motion.span>[0]["animate"]> = {
  idle:     { opacity: [0.6, 1, 0.6] },
  thinking: { scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] },
  working:  { opacity: [0.5, 1, 1, 0.5] },
  blocked:  { x: [0, -1, 1, -1, 0], opacity: [0.7, 1, 0.7] },
};

const DOT_TIMING: Record<AgentStatus, { duration: number; repeat: number; ease?: string }> = {
  idle:     { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  thinking: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
  working:  { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
  blocked:  { duration: 0.9, repeat: Infinity },
};

export function StatusPill({ status, className }: Props) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04]",
        meta.ring,
        className
      )}
    >
      <motion.span
        className={cn("inline-block h-1.5 w-1.5 rounded-full", meta.dot)}
        animate={DOT_ANIM[status]}
        transition={DOT_TIMING[status]}
      />
      <span
        className={cn(
          "text-[10px] font-mono uppercase tracking-[0.18em]",
          meta.text
        )}
      >
        {meta.label}
      </span>
    </span>
  );
}
