"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Agent, AgentStatus } from "@/lib/agents";

/**
 * The agent's visual identity. A circular frame holds the Lucide icon, with
 * a per-status animation laid over the top:
 *   - idle: slow breathe of the ring
 *   - thinking: pulsing magenta halo
 *   - working: continuously rotating accent ring around the frame
 *   - blocked: amber-tinted stutter
 *
 * Each accent maps to a glow shadow (lookup object, never template-stringed —
 * Tailwind's content scanner can't resolve dynamic class names).
 */

type Props = {
  agent: Agent;
  status: AgentStatus;
  size?: number;
};

const ACCENT_RING: Record<Agent["accent"], string> = {
  cyan: "border-signal-cyan/50",
  magenta: "border-signal-magenta/50",
  amber: "border-signal-amber/50",
};

const ACCENT_ICON: Record<Agent["accent"], string> = {
  cyan: "text-signal-cyan",
  magenta: "text-signal-magenta",
  amber: "text-signal-amber",
};

const ACCENT_GLOW: Record<Agent["accent"], string> = {
  cyan: "shadow-glow-cyan-sm",
  magenta: "shadow-glow-magenta",
  amber: "shadow-glow-amber",
};

const STATUS_HALO: Record<AgentStatus, string> = {
  idle: "",
  thinking: "shadow-glow-magenta",
  working: "shadow-glow-cyan-sm",
  blocked: "shadow-glow-amber",
};

export function AgentAvatar({ agent, status, size = 44 }: Props) {
  const Icon = agent.icon;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      {/* The frame */}
      <div
        className={cn(
          "absolute inset-0 rounded-full border bg-white/[0.03]",
          "flex items-center justify-center",
          ACCENT_RING[agent.accent],
          status !== "idle" && STATUS_HALO[status],
          status === "idle" && ACCENT_GLOW[agent.accent]
        )}
      >
        <Icon
          className={cn(
            "w-1/2 h-1/2",
            status === "thinking" ? "text-signal-magenta" :
            status === "blocked"  ? "text-signal-amber"   :
            ACCENT_ICON[agent.accent]
          )}
          strokeWidth={1.5}
        />
      </div>

      {/* Rotating accent ring — only present while the agent is working.
          Drawn as an SVG so we can dash the stroke for that "scanning" feel. */}
      {status === "working" && (
        <motion.svg
          className="absolute -inset-1"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            className={ACCENT_ICON[agent.accent].replace("text-", "stroke-")}
            opacity={0.7}
          />
        </motion.svg>
      )}

      {/* Thinking: pulsing halo */}
      {status === "thinking" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          style={{ boxShadow: "0 0 16px 4px rgba(255,94,212,0.45)" }}
        />
      )}

      {/* Blocked: subtle amber stutter */}
      {status === "blocked" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ opacity: [0.3, 0.7, 0.3, 0.7] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          style={{ boxShadow: "0 0 12px 2px rgba(255,181,71,0.35)" }}
        />
      )}
    </div>
  );
}
