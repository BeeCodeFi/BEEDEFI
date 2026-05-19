"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Zap } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { generateScriptAction } from "@/lib/ai/actions";
import type { ScriptDraft } from "@/lib/studio";
import type { AgentResult } from "@/lib/ai/orchestration";
import type { GeneratedScript } from "@/lib/ai/generators";

type Props = {
  drafts: ScriptDraft[];
};

const LENGTHS = ["3 minutes", "4 minutes", "5 minutes", "8 minutes"] as const;
const TONES = [
  "confident, specific, slightly dry",
  "warm, conversational, personal",
  "punchy, contrarian, surprising",
] as const;

export function ScriptGenerator({ drafts }: Props) {
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("4 minutes");
  const [tone, setTone] = useState<(typeof TONES)[number]>(TONES[0]);
  const [result, setResult] = useState<AgentResult<GeneratedScript> | null>(null);
  const [isPending, startTransition] = useTransition();

  const canGenerate = topic.trim().length > 3 && !isPending;

  const handleGenerate = () => {
    if (!canGenerate) return;
    startTransition(async () => {
      const res = await generateScriptAction(topic.trim(), length, tone);
      setResult(res);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* MAIN COLUMN */}
      <div className="flex flex-col gap-4">
        <GlassPanel edge className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-signal-magenta" strokeWidth={1.5} />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-signal-magenta">
              Content agent · script
            </p>
          </div>

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What's the one idea this script should land?"
            className="w-full bg-transparent border-0 border-b border-edge focus:border-signal-magenta/60 focus:outline-none py-2 text-lg font-display text-ink-1 placeholder:text-ink-3 transition-colors"
          />

          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <Pill label="Length">
              <select
                value={length}
                onChange={(e) => setLength(e.target.value as (typeof LENGTHS)[number])}
                className="bg-transparent border-0 focus:outline-none text-[11px] font-mono uppercase tracking-wider text-ink-1"
              >
                {LENGTHS.map((l) => (
                  <option key={l} value={l} className="bg-bg-2 text-ink-1">
                    {l}
                  </option>
                ))}
              </select>
            </Pill>

            <Pill label="Tone">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as (typeof TONES)[number])}
                className="bg-transparent border-0 focus:outline-none text-[11px] font-mono uppercase tracking-wider text-ink-1 max-w-[18rem] truncate"
              >
                {TONES.map((t) => (
                  <option key={t} value={t} className="bg-bg-2 text-ink-1">
                    {t}
                  </option>
                ))}
              </select>
            </Pill>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={cn(
                "ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                canGenerate
                  ? "bg-signal-magenta/15 border-signal-magenta/50 hover:bg-signal-magenta/25 hover:border-signal-magenta shadow-glow-magenta"
                  : "bg-white/[0.03] border-edge text-ink-3 cursor-not-allowed"
              )}
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <Zap className="w-3.5 h-3.5" strokeWidth={2} />
              )}
              <span className="text-xs font-mono uppercase tracking-wider">
                {isPending ? "Generating…" : "Generate"}
              </span>
            </button>
          </div>
        </GlassPanel>

        {/* OUTPUT */}
        {result && (
          <motion.div
            key={result.latencyMs}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card accent="magenta" interactive={false}>
              <CardHeader>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-signal-magenta mb-1">
                    Draft
                  </p>
                  <CardTitle className="normal-case text-ink-1 tracking-normal text-[16px] font-light">
                    {result.data.title}
                  </CardTitle>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-mono tabular-nums text-ink-3">
                    {result.latencyMs}ms · {result.data.body.length}c
                  </span>
                  {result.stubbed && (
                    <span className="text-[9px] font-mono uppercase tracking-wider text-signal-amber">
                      Stub · wire OPENROUTER_API_KEY for live
                    </span>
                  )}
                </div>
              </CardHeader>

              <pre className="whitespace-pre-wrap text-[13px] text-ink-2 leading-relaxed font-body">
                {result.data.body}
              </pre>
            </Card>
          </motion.div>
        )}
      </div>

      {/* RIGHT RAIL: recent drafts */}
      <aside>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-3 mb-3">
          Recent drafts
        </p>
        <div className="flex flex-col gap-2">
          {drafts.map((d) => (
            <GlassPanel key={d.id} className="p-3 group cursor-pointer hover:border-edge-strong transition-colors">
              <p className="text-[13px] font-display text-ink-1 leading-snug">
                {d.title}
              </p>
              <p className="mt-1 text-[11px] text-ink-2 line-clamp-2 leading-snug">
                {d.preview}
              </p>
              <p className="mt-2 text-[10px] font-mono tabular-nums text-ink-3">
                {Math.round(d.durationSec / 60)}m · {d.createdAgoMin}m ago
              </p>
            </GlassPanel>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Pill({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.03] border border-edge">
      <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
        {label}
      </span>
      {children}
    </span>
  );
}
