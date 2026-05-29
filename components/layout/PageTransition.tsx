"use client";

import { MotionConfig, motion } from "framer-motion";
import { type ReactNode } from "react";

/**
 * Page transition wrapper.
 *
 * Earlier versions used `<AnimatePresence mode="wait">` keyed on pathname so
 * each navigation crossfaded out the old page and crossfaded in the new one.
 * That had a load-bearing flaw: in the Next.js App Router, `usePathname()`
 * returns the new path the moment a Link is clicked, but the `children` prop
 * in the layout doesn't swap to the new route until that route's RSC payload
 * arrives. Keying the AnimatePresence on pathname therefore caused the
 * wrapper to unmount the old content the moment pathname changed — but when
 * it remounted, the `children` prop was still the OLD route (RSC in flight),
 * so the page appeared not to update at all. The user's symptom was "the
 * page doesn't load on navigation; reload fixes it" — which made sense
 * because a hard reload bypasses client navigation and renders the new
 * tree directly.
 *
 * Fix: don't key on pathname. We do a single fade-in-and-rise on the
 * wrapper's mount and leave per-route animation to the cascade variants the
 * individual pages already use. Navigation now feels instant; the cinematic
 * choreography still plays via each page's own entrance.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          opacity: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          y: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
