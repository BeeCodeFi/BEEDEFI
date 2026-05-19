"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

/**
 * Page transition — a soft crossfade with a brief Y rise on entry. Earlier
 * versions used scaleY to collapse the outgoing route to a glowing seam, but
 * that's a footgun: any animation hiccup leaves the page collapsed to a thin
 * line, indistinguishable from an empty page. Opacity-and-translate is safer,
 * still feels cinematic, and never leaves a route invisible.
 *
 * MotionConfig reducedMotion="user" wires this whole subtree into the OS
 * reduced-motion preference for free.
 */
const variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      opacity: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
      y: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      opacity: { duration: 0.22, ease: [0.7, 0, 0.84, 0] },
      y: { duration: 0.22, ease: [0.7, 0, 0.84, 0] },
    },
  },
};

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          variants={variants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
