"use client";

import { useState, useCallback } from "react";
import { BrainShell } from "@/components/brain/BrainShell";
import { BrainEntry } from "@/components/brain/BrainEntry";
import { InlineEntryPanel } from "@/components/ui/InlineEntryPanel";
import { useBrainData } from "@/lib/useStore";

/**
 * /brain — second-brain dashboard. Client component reads from localStorage
 * and hands off to BrainShell for interactive state management.
 */
export default function BrainPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const snapshot = useBrainData(refreshKey);
  const handleSaved = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="relative min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-10 lg:pt-12 pb-32">
      {/* HEADER */}
      <header className="mb-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-signal-violet mb-2">
          Phase 04 · Second brain
        </p>
        <h1 className="font-display text-display-lg font-light tracking-tight text-ink-1">
          Your <span className="text-signal-grad">second brain</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ink-2 font-body leading-relaxed">
          Every note you&rsquo;ve kept, in one living graph. Hover any node to
          trace its connections; capture new thinking in the journal below and
          watch it land in the network.
        </p>
      </header>

      <BrainShell initial={snapshot} />

      <InlineEntryPanel accent="magenta">
        <BrainEntry onSaved={handleSaved} />
      </InlineEntryPanel>
    </div>
  );
}
