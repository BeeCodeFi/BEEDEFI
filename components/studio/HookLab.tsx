"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Zap, Loader2, RotateCcw } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/cn";
import { generateHooksAction } from "@/lib/ai/actions";
import { HOOK_STYLE_LABEL, type HookVariant } from "@/lib/studio";
import type { AgentResult } from "@/lib/ai/orchestration";

type Props = {
  history: Array<{
    id: string;
    topic: string;
    createdAgoMin: number;
    variants: HookVariant[];
  }>;
};

const STYLE_ACCENT: Record<HookVariant["style"], "cyan" | "magenta" | "amber" | "violet"> = {
  "question-rebuttal": "cyan",
  "wait-but": "violet",
  "stat-shock": "amber",
  "story-cold-open": "magenta",
  "contrarian-claim": "violet",
};

const ACCENT_TEXT: Record<"cyan" | "magenta" | "amber" | "violet", string> = {
  cyan: "text-signal-cyan",
  magenta: "text-signal-magenta",
  amber: "text-signal-amber",
  violet: "text-signal-violet",
};

const ACCENT_BORDER: Record<"cyan" | "magenta" | "amber" | "violet", string> = {
  cyan: "border-signal-cyan/30",
  magenta: "border-signal-magenta/30",
  amber: "border-signal-amber/30",
  violet: "border-signal-violet/30",
};

export function HookLab({ history }: Props) {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<AgentResult<HookVariant[]> | null>(null);
  const [isPending, startTransition] = useTransition();

  const canGenerate = topic.trim().length > 3 && !isPending;

  const run = () => {
    if (!canGenerate) return;
    startTransition(async () => {
      const res = await generateHooksAction(topic.trim());
      setResult(res);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <GlassPanel edge className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-signal-cyan" strokeWidth={1.5} />
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-signal-cyan">
            Content agent · hooks
          </p>
        </div>

        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What's the topic? One sentence is enough."
          className="w-full bg-transparent border-0 border-b border-edge focus:border-signal-cyan/60 focus:outline-none py-2 text-lg font-display text-ink-1 placeholder:text-ink-3 transition-colors"
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
            5 styles, parallel
          </p>
          <button
            type="button"
            onClick={run}
            disabled={!canGenerate}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
              canGenerate
                ? "bg-signal-cyan/15 border-signal-cyan/50 hover:bg-signal-cyan/25 hover:border-signal-cyan shadow-glow-cyan-sm"
                : "bg-white/[0.03] border-edge text-ink-3 cursor-not-allowed"
            )}
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
            ) : result ? (
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            ) : (
              <Zap className="w-3.5 h-3.5" strokeWidth={2} />
            )}
            <span className="text-xs font-mono uppercase tracking-wider">
              {isPending ? "Generating…" : result ? "Re-roll" : "Generate"}
            </span>
          </button>
        </div>
      </GlassPanel>

      {/* RESULTS */}
      {result && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
              {result.data.length} variants · {result.latencyMs}ms
            </p>
            {result.stubbed && (
              <span className="text-[9px] font-mono uppercase tracking-wider text-signal-amber">
                Stub
              </span>
            )}
          </div>
          <ul className="flex flex-col gap-2.5">
            {result.data.map((h, i) => (
              <HookRow key={h.id} hook={h} index={i} />
            ))}
          </ul>
        </section>
      )}

      {/* HISTORY */}
      {history.length > 0 && (
        <section>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-3 mb-3">
            Earlier batches
          </p>
          <div className="flex flex-col gap-4">
            {history.map((batch) => (
              <GlassPanel key={batch.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] text-ink-1 font-display">{batch.topic}</p>
                  <span className="text-[10px] font-mono tabular-nums text-ink-3">
                    {batch.createdAgoMin}m ago
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {batch.variants.slice(0, 3).map((h, i) => (
                    <HookRow key={h.id} hook={h} index={i} compact />
                  ))}
                </ul>
              </GlassPanel>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function HookRow({
  hook,
  index,
  compact = false,
}: {
  hook: HookVariant;
  index: number;
  compact?: boolean;
}) {
  const accent = STYLE_ACCENT[hook.style];
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "rounded-lg border bg-white/[0.02] p-4 flex items-start gap-4",
        ACCENT_BORDER[accent]
      )}
    >
      <div className="flex-1 min-w-0">
        <p className={cn(compact ? "text-[12px]" : "text-[14px]", "text-ink-1 leading-snug font-display")}>
          {hook.text}
        </p>
        <div className="mt-1.5 flex items-center gap-3">
          <span className={cn("text-[10px] font-mono uppercase tracking-wider", ACCENT_TEXT[accent])}>
            {HOOK_STYLE_LABEL[hook.style]}
          </span>
          <span className="text-[10px] font-mono tabular-nums text-ink-3">
            +{hook.predictedLiftPct}% retention
          </span>
        </div>
      </div>
    </motion.li>
  );
}
