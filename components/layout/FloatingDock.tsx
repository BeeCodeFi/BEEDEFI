"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import {
  Plus,
  Search,
  Sparkles,
  Mic,
  Command,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * macOS-style dock with proximity magnification. As the cursor approaches an
 * item, that item (and its neighbors, more subtly) scale up.
 *
 * Implementation: we track the cursor's X position relative to the dock as a
 * MotionValue, then each DockItem computes its own scale via useTransform based
 * on the distance from cursor to its center. No React state involved — the whole
 * thing runs on Framer Motion's spring system.
 */

type DockAction = {
  icon: LucideIcon;
  label: string;
  /** Optional accent — defaults to neutral */
  accent?: "cyan" | "magenta" | "amber";
  onClick?: () => void;
};

const DOCK_ACTIONS: DockAction[] = [
  { icon: Plus, label: "New", accent: "cyan" },
  { icon: Search, label: "Search" },
  { icon: Sparkles, label: "Ask AI", accent: "magenta" },
  { icon: Mic, label: "Voice" },
  { icon: Command, label: "Palette" },
];

export function FloatingDock() {
  // mouseX is undefined when cursor is outside the dock; we use Infinity as the
  // "far away" sentinel so items return to base scale smoothly.
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="glass glass-edge rounded-2xl px-3 py-2 flex items-end gap-2">
        {DOCK_ACTIONS.map((action) => (
          <DockItem key={action.label} action={action} mouseX={mouseX} />
        ))}
      </div>
    </motion.div>
  );
}

function DockItem({
  action,
  mouseX,
}: {
  action: DockAction;
  mouseX: MotionValue<number>;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  // Distance from cursor to this item's center, in pixels.
  // useTransform creates a derived MotionValue — runs on every animation frame
  // without React re-renders.
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Map distance [-150 .. 0 .. 150] to size [40 .. 64 .. 40].
  // The range controls falloff sharpness — wider range = gentler magnification.
  const sizeTransform = useTransform(distance, [-150, 0, 150], [40, 64, 40]);
  // Spring-smooth the size for that satisfying squishy feel
  const size = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const Icon = action.icon;
  const accentClass = action.accent
    ? { cyan: "text-signal-cyan", magenta: "text-signal-magenta", amber: "text-signal-amber" }[action.accent]
    : "text-ink-2";

  return (
    <motion.button
      ref={ref}
      style={{ width: size, height: size }}
      onClick={action.onClick}
      className={cn(
        "relative aspect-square rounded-xl",
        "bg-white/[0.03] border border-edge",
        "hover:bg-white/[0.06] hover:border-edge-strong",
        "flex items-center justify-center group",
        "transition-colors duration-150"
      )}
      aria-label={action.label}
    >
      <Icon className={cn("w-5 h-5", accentClass)} strokeWidth={1.75} />

      {/* Tooltip — appears above on hover */}
      <span
        className={cn(
          "absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md",
          "text-[10px] font-mono uppercase tracking-wider whitespace-nowrap",
          "bg-bg-3 border border-edge text-ink-2",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          "pointer-events-none"
        )}
      >
        {action.label}
      </span>
    </motion.button>
  );
}
