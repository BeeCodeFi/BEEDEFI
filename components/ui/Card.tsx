"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Card composes GlassPanel with the patterns specific to dashboard cards:
 * hover lift, optional accent glow, header/body slot structure.
 *
 * We extend `motion.div` directly rather than wrapping GlassPanel because we
 * want Framer Motion's animation props (whileHover, etc.) to be available to
 * consumers, and the glass styling is just a few classes we can inline.
 */

type CardProps = HTMLMotionProps<"div"> & {
  accent?: "cyan" | "magenta" | "amber" | "violet" | "none";
  interactive?: boolean;
  children: ReactNode;
};

const ACCENT_GLOW: Record<NonNullable<CardProps["accent"]>, string> = {
  cyan: "hover:shadow-glow-cyan-sm hover:border-edge-strong",
  magenta: "hover:shadow-glow-magenta hover:border-edge-strong",
  amber: "hover:shadow-glow-amber hover:border-edge-strong",
  violet: "hover:shadow-glow-violet-sm hover:border-edge-strong",
  none: "hover:border-edge-strong",
};

export function Card({
  accent = "cyan",
  interactive = true,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <motion.div
      // Slight rise on hover. Spring physics give it the right tactile feel.
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "glass glass-edge rounded-2xl p-6",
        "transition-colors duration-300",
        interactive && ACCENT_GLOW[accent],
        interactive && "cursor-pointer",
        className
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Convenience slot for the upper area of a card. Keeps spacing consistent.
 */
export function CardHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "font-display font-medium text-sm tracking-wide text-ink-2 uppercase",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardMetric({
  value,
  unit,
  trend,
}: {
  value: string | number;
  unit?: string;
  /** Positive number renders cyan up-arrow, negative renders amber down-arrow */
  trend?: number;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display font-light text-4xl tracking-tight text-ink-1 tabular-nums">
        {value}
      </span>
      {unit && (
        <span className="text-xs font-mono text-ink-3 uppercase tracking-wider">
          {unit}
        </span>
      )}
      {trend !== undefined && (
        <span
          className={cn(
            "ml-auto text-xs font-mono tabular-nums",
            trend >= 0 ? "text-signal-cyan" : "text-signal-amber"
          )}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}
