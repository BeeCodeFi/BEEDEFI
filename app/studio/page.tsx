"use client";

import { useState, useCallback } from "react";
import { StudioShell } from "@/components/studio/StudioShell";
import { InlineEntryPanel } from "@/components/ui/InlineEntryPanel";
import { StudioEntry } from "@/components/studio/StudioEntry";
import { useStudioData } from "@/lib/useStore";

/**
 * /studio — Creator-studio dashboard. Client component reads from localStorage
 * and hands off to a client tab shell. Generations go through server actions
 * defined in lib/ai/actions.ts so the API key never crosses the wire.
 */
export default function StudioPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const snapshot = useStudioData(refreshKey);
  const handleSaved = useCallback(() => setRefreshKey((k) => k + 1), []);
  const liveAi = false; // Client can't check env — stub badge until wired

  return (
    <div className="relative min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-10 lg:pt-12 pb-32">
      <header className="flex flex-wrap items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-signal-magenta mb-2">
            Phase 05 · Creator studio
          </p>
          <h1 className="font-display text-display-lg font-light tracking-tight text-ink-1">
            <span className="text-signal-grad">Make</span> something
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ink-2 font-body leading-relaxed">
            Drafts, hooks, thumbnails, and the analytics to know what&rsquo;s
            actually working.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-edge">
            <span
              className={
                liveAi
                  ? "h-1.5 w-1.5 rounded-full bg-signal-cyan animate-pulse"
                  : "h-1.5 w-1.5 rounded-full bg-signal-amber"
              }
            />
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-2">
              {liveAi ? "Live · OpenRouter" : "Stub · set OPENROUTER_API_KEY"}
            </span>
          </span>
        </div>
      </header>

      <StudioShell snapshot={snapshot} />

      <InlineEntryPanel accent="magenta">
        <StudioEntry onSaved={handleSaved} />
      </InlineEntryPanel>
    </div>
  );
}
