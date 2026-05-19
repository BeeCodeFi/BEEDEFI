"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Loader2, Zap, RotateCcw } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/cn";
import { generateThumbnailsAction } from "@/lib/ai/actions";
import { MOOD_ACCENT, type ThumbnailConcept } from "@/lib/studio";
import type { AgentResult } from "@/lib/ai/orchestration";

type Props = {
  history: Array<{
    id: string;
    concept: string;
    createdAgoMin: number;
    ideas: ThumbnailConcept[];
  }>;
};

const ACCENT_BORDER = {
  cyan: "border-signal-cyan/30",
  magenta: "border-signal-magenta/30",
  amber: "border-signal-amber/30",
  violet: "border-signal-violet/30",
} as const;

const ACCENT_TEXT = {
  cyan: "text-signal-cyan",
  magenta: "text-signal-magenta",
  amber: "text-signal-amber",
  violet: "text-signal-violet",
} as const;

const ACCENT_FILL = {
  cyan: "from-signal-cyan/15 to-transparent",
  magenta: "from-signal-magenta/15 to-transparent",
  amber: "from-signal-amber/15 to-transparent",
  violet: "from-signal-violet/15 to-transparent",
} as const;

export function ThumbnailIdeation({ history }: Props) {
  const [concept, setConcept] = useState("");
  const [result, setResult] = useState<AgentResult<ThumbnailConcept[]> | null>(null);
  const [isPending, startTransition] = useTransition();

  const canGenerate = concept.trim().length > 3 && !isPending;

  const run = () => {
    if (!canGenerate) return;
    startTransition(async () => {
      const res = await generateThumbnailsAction(concept.trim());
      setResult(res);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <GlassPanel edge className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-4 h-4 text-signal-violet" strokeWidth={1.5} />
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-signal-violet">
            Content agent · thumbnail concepts
          </p>
        </div>

        <input
          type="text"
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder="What's the piece about? Think in terms of feeling, not topic."
          className="w-full bg-transparent border-0 border-b border-edge focus:border-signal-violet/60 focus:outline-none py-2 text-lg font-display text-ink-1 placeholder:text-ink-3 transition-colors"
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
            4 concepts · one per mood
          </p>
          <button
            type="button"
            onClick={run}
            disabled={!canGenerate}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
              canGenerate
                ? "bg-signal-violet/15 border-signal-violet/50 hover:bg-signal-violet/25 hover:border-signal-violet shadow-glow-violet-sm"
                : "bg-white/[0.03] border-edge text-ink-3 cursor-not-allowed"
            )}
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} /> :
             result ? <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} /> :
             <Zap className="w-3.5 h-3.5" strokeWidth={2} />}
            <span className="text-xs font-mono uppercase tracking-wider">
              {isPending ? "Generating…" : result ? "Re-roll" : "Generate"}
            </span>
          </button>
        </div>
      </GlassPanel>

      {result && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
              {result.data.length} concepts · {result.latencyMs}ms
            </p>
            {result.stubbed && (
              <span className="text-[9px] font-mono uppercase tracking-wider text-signal-amber">
                Stub
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.data.map((t, i) => (
              <ThumbCard key={t.id} concept={t} index={i} />
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-3 mb-3">
            Earlier batches
          </p>
          {history.map((batch) => (
            <GlassPanel key={batch.id} className="p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] text-ink-1 font-display">{batch.concept}</p>
                <span className="text-[10px] font-mono tabular-nums text-ink-3">
                  {batch.createdAgoMin}m ago
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {batch.ideas.map((t, i) => (
                  <ThumbCard key={t.id} concept={t} index={i} compact />
                ))}
              </div>
            </GlassPanel>
          ))}
        </section>
      )}
    </div>
  );
}

function ThumbCard({
  concept,
  index,
  compact = false,
}: {
  concept: ThumbnailConcept;
  index: number;
  compact?: boolean;
}) {
  const accent = MOOD_ACCENT[concept.mood];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.05 * index, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative rounded-xl border bg-white/[0.02] overflow-hidden",
        ACCENT_BORDER[accent]
      )}
    >
      {/* Faux thumbnail surface — a gradient + the copy line */}
      <div
        className={cn(
          "h-32 flex items-center justify-center px-4 bg-gradient-to-br",
          ACCENT_FILL[accent]
        )}
      >
        <p className={cn(
          "font-display font-medium uppercase tracking-wider text-center leading-tight",
          compact ? "text-sm" : "text-lg",
          ACCENT_TEXT[accent]
        )}>
          {concept.copyLine}
        </p>
      </div>
      <div className="p-3">
        <p className={cn("text-[10px] font-mono uppercase tracking-wider mb-1.5", ACCENT_TEXT[accent])}>
          {concept.mood}
        </p>
        {!compact && (
          <>
            <p className="text-[12px] text-ink-2 leading-snug mb-1">
              {concept.composition}
            </p>
            <p className="text-[10px] font-mono text-ink-3">
              {concept.paletteHint}
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
