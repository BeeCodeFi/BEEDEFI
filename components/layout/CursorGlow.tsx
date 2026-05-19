"use client";

import { useEffect, useRef } from "react";

/**
 * A radial glow that follows the cursor. Performance-critical: we write to a
 * CSS custom property via the DOM, never to React state, so this component
 * renders exactly once and pointer movement is handled entirely by the browser
 * compositor.
 *
 * Hidden on touch devices via CSS media query — a glow without a cursor is just
 * a smear in the middle of the screen.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Bail on touch — `(pointer: fine)` is the standards-compliant way to detect
    // a mouse-or-trackpad-grade pointer.
    if (!window.matchMedia("(pointer: fine)").matches) {
      el.style.display = "none";
      return;
    }

    let rafId = 0;
    let pendingX = 0;
    let pendingY = 0;

    const onMove = (e: PointerEvent) => {
      pendingX = e.clientX;
      pendingY = e.clientY;
      // requestAnimationFrame batches writes to the next paint, so even at high
      // pointer-event rates (some mice fire >1000 events/sec) we only touch the
      // DOM once per frame.
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          el.style.setProperty("--x", `${pendingX}px`);
          el.style.setProperty("--y", `${pendingY}px`);
          rafId = 0;
        });
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-0 z-[60] pointer-events-none"
      style={{
        // Initial position offscreen so the glow doesn't flash at 0,0 on mount
        // before the first pointermove arrives.
        ["--x" as string]: "-1000px",
        ["--y" as string]: "-1000px",
        background:
          "radial-gradient(600px circle at var(--x) var(--y), rgba(94,240,255,0.06), transparent 40%)",
      }}
    />
  );
}
