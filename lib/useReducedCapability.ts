"use client";

import { useEffect, useState } from "react";

/**
 * Returns true on devices that should skip heavy 3D / motion. Detection signals:
 *
 *   1. prefers-reduced-motion media query (explicit user preference — top priority)
 *   2. Low device memory (navigator.deviceMemory < 4) — typical of older phones
 *   3. Low hardware concurrency (< 4 cores) — strong signal for low-end devices
 *   4. Save-Data header (user has data-saver enabled)
 *
 * Returns false during SSR and on initial mount, then settles to the correct
 * value after hydration. Components should render their full-fidelity version
 * by default and downgrade only after this hook returns true, to avoid layout
 * shift on capable devices.
 */
export function useReducedCapability(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const evaluate = () => {
      if (motionQuery.matches) return true;

      // @ts-expect-error - deviceMemory is experimental but widely supported
      const memory = navigator.deviceMemory as number | undefined;
      if (memory && memory < 4) return true;

      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        return true;
      }

      // @ts-expect-error - connection is non-standard
      const connection = navigator.connection;
      if (connection?.saveData) return true;

      return false;
    };

    setReduced(evaluate());

    const onChange = () => setReduced(evaluate());
    motionQuery.addEventListener("change", onChange);
    return () => motionQuery.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
