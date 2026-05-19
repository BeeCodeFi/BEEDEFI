"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * A circular progress indicator. The stroke-dashoffset animates from full to
 * the target value, giving a satisfying "wind-up" reveal when the value first
 * appears.
 *
 * Sizing is intrinsic to the SVG — pass `size` in px. Stroke width scales
 * proportionally so the visual weight stays consistent.
 */
type Props = {
  /** 0–100 */
  value: number;
  size?: number;
  accent?: "cyan" | "magenta" | "amber" | "violet";
  label?: string;
  className?: string;
};

const ACCENT_STROKE: Record<NonNullable<Props["accent"]>, string> = {
  cyan: "stroke-signal-cyan",
  magenta: "stroke-signal-magenta",
  amber: "stroke-signal-amber",
  violet: "stroke-signal-violet",
};

export function ProgressRing({
  value,
  size = 56,
  accent = "cyan",
  label,
  className,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = Math.max(2, Math.round(size * 0.07));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-white/[0.06]"
        />
        {/* Value arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className={cn(ACCENT_STROKE[accent], "drop-shadow-[0_0_8px_currentColor]")}
        />
      </svg>
      {/* Center label — either the numeric value or a custom string */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-mono tabular-nums text-ink-1">
          {label ?? `${Math.round(clamped)}%`}
        </span>
      </span>
    </div>
  );
}
