"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { AgentActivity } from "@/lib/agents";

/**
 * A compact, scroll-free feed of recent agent activity. Each row is a bullet,
 * a relative timestamp, and the action text. Alert-tone rows tint the bullet
 * amber so anomalies catch the eye without screaming.
 *
 * Items fade in with a staggered cascade matching the rest of the app.
 */
type Props = {
  items: AgentActivity[];
  className?: string;
};

export function ActivityFeed({ items, className }: Props) {
  if (items.length === 0) {
    return (
      <p className={cn("text-[11px] font-mono uppercase tracking-wider text-ink-4", className)}>
        No activity yet
      </p>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-start gap-2.5 text-[12px] leading-snug"
        >
          <span
            className={cn(
              "mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full",
              item.tone === "alert" ? "bg-signal-amber" : "bg-ink-3"
            )}
          />
          <span className="font-mono tabular-nums text-ink-3 shrink-0 w-10">
            {formatAgo(item.ago)}
          </span>
          <span className={cn("text-ink-2", item.tone === "alert" && "text-ink-1")}>
            {item.text}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

function formatAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
