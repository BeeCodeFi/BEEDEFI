"use client";

import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Sparkles,
  Mic,
  Command,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { CommandPalette } from "./CommandPalette";

/**
 * macOS-style dock with proximity magnification — on fine-pointer devices.
 *
 * On touch devices the magnification is meaningless (no hover), and the small
 * 40px base targets are too small for fingers. So we detect pointer capability
 * once on mount, and render a touch-tuned variant: uniform 52px buttons, no
 * size animation, tighter horizontal padding so the dock fits on narrow
 * viewports. The whole row also gets safe-area-aware bottom inset so it
 * doesn't sit under the iOS home indicator.
 */

type DockAction = {
  icon: LucideIcon;
  label: string;
  /** Optional accent — defaults to neutral */
  accent?: "cyan" | "magenta" | "amber";
  onClick?: () => void;
};

export function FloatingDock() {
  const mouseX = useMotionValue(Infinity);
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Pointer-type detection runs in an effect so SSR markup is stable. The
  // first paint shows the desktop variant; if the user is on touch, the effect
  // flips it on the next frame. The visual delta is small enough that no flash
  // is visible.
  const [isFinePointer, setIsFinePointer] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setIsFinePointer(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsFinePointer(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Global Cmd+K / Ctrl+K to toggle palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const DOCK_ACTIONS: DockAction[] = [
    { icon: Plus, label: "New", accent: "cyan", onClick: () => router.push("/brain") },
    { icon: Search, label: "Search", onClick: () => setPaletteOpen(true) },
    { icon: Sparkles, label: "Ask AI", accent: "magenta", onClick: () => router.push("/studio") },
    { icon: Mic, label: "Voice", onClick: () => router.push("/agents") },
    { icon: Command, label: "Palette", onClick: () => setPaletteOpen(true) },
  ];

  return (
    <>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <motion.div
        onMouseMove={isFinePointer ? (e) => mouseX.set(e.pageX) : undefined}
        onMouseLeave={isFinePointer ? () => mouseX.set(Infinity) : undefined}
        className={cn(
          "fixed left-1/2 -translate-x-1/2 z-50",
          // Lift above the iOS home indicator on touch devices.
          "bottom-4 sm:bottom-6"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div
          className={cn(
            "glass glass-edge rounded-2xl flex items-end",
            isFinePointer ? "px-3 py-2 gap-2" : "px-2.5 py-2 gap-1.5"
          )}
        >
          {DOCK_ACTIONS.map((action) => (
            <DockItem
              key={action.label}
              action={action}
              mouseX={mouseX}
              isFinePointer={isFinePointer}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}

function DockItem({
  action,
  mouseX,
  isFinePointer,
}: {
  action: DockAction;
  mouseX: MotionValue<number>;
  isFinePointer: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const sizeTransform = useTransform(distance, [-150, 0, 150], [40, 64, 40]);
  const size = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const Icon = action.icon;
  const accentClass = action.accent
    ? { cyan: "text-signal-cyan", magenta: "text-signal-magenta", amber: "text-signal-amber" }[action.accent]
    : "text-ink-2";

  // Touch variant: uniform 52px square (above Apple's 44pt minimum, comfortable
  // for thumbs), no size animation.
  if (!isFinePointer) {
    return (
      <button
        ref={ref}
        onClick={action.onClick}
        className={cn(
          "relative h-[52px] w-[52px] rounded-xl",
          "bg-white/[0.03] border border-edge",
          "active:bg-white/[0.08] active:border-edge-strong",
          "flex items-center justify-center",
          "transition-colors duration-150"
        )}
        aria-label={action.label}
        style={{ touchAction: "manipulation" }}
      >
        <Icon className={cn("w-5 h-5", accentClass)} strokeWidth={1.75} />
      </button>
    );
  }

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
