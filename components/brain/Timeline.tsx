"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { getTagAccent, type Note } from "@/lib/brain";

/**
 * Chronological view of notes, bucketed by recency. Buckets render in order
 * (Today → This week → This month → Earlier), each as a labelled section.
 * Empty buckets are dropped so the layout never has dead space.
 */

type Props = {
  notes: Note[];
};

type Bucket = {
  key: string;
  label: string;
  /** Upper bound in ms-ago (exclusive). null means "everything else." */
  ceilingMs: number | null;
};

const BUCKETS: Bucket[] = [
  { key: "today",  label: "Today",      ceilingMs: 24 * 60 * 60 * 1000 },
  { key: "week",   label: "This week",  ceilingMs: 7  * 24 * 60 * 60 * 1000 },
  { key: "month",  label: "This month", ceilingMs: 30 * 24 * 60 * 60 * 1000 },
  { key: "older",  label: "Earlier",    ceilingMs: null },
];

const ACCENT_DOT: Record<"cyan" | "magenta" | "amber" | "violet", string> = {
  cyan: "bg-signal-cyan",
  magenta: "bg-signal-magenta",
  amber: "bg-signal-amber",
  violet: "bg-signal-violet",
};

export function Timeline({ notes }: Props) {
  const grouped = useMemo(() => {
    const now = Date.now();
    const byBucket = new Map<string, Note[]>();
    BUCKETS.forEach((b) => byBucket.set(b.key, []));

    // Sort newest first so each bucket reads top-down chronological.
    const sorted = [...notes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    for (const note of sorted) {
      const ageMs = now - new Date(note.createdAt).getTime();
      const bucket = BUCKETS.find(
        (b) => b.ceilingMs === null || ageMs < b.ceilingMs
      );
      if (bucket) byBucket.get(bucket.key)!.push(note);
    }

    return BUCKETS
      .map((b) => ({ ...b, notes: byBucket.get(b.key) ?? [] }))
      .filter((b) => b.notes.length > 0);
  }, [notes]);

  return (
    <div className="flex flex-col gap-7">
      {grouped.map((bucket) => (
        <section key={bucket.key}>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-signal-violet">
              {bucket.label}
            </p>
            <span className="h-px flex-1 bg-edge" />
            <span className="text-[10px] font-mono tabular-nums text-ink-3">
              {bucket.notes.length}
            </span>
          </div>
          <ul className="flex flex-col gap-3">
            {bucket.notes.map((note, i) => (
              <TimelineRow key={note.id} note={note} index={i} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function TimelineRow({ note, index }: { note: Note; index: number }) {
  const accent = getTagAccent(note.tags[0]);
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group flex items-start gap-3"
    >
      <span
        className={cn(
          "mt-2 inline-block h-1.5 w-1.5 rounded-full shrink-0",
          ACCENT_DOT[accent]
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h4 className="text-[14px] font-display font-medium text-ink-1 leading-snug">
            {note.title}
          </h4>
          <span className="text-[10px] font-mono tabular-nums text-ink-3 shrink-0">
            {formatTime(note.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-[12px] text-ink-2 leading-snug line-clamp-2">
          {note.excerpt}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {note.tags.map((t) => (
            <span
              key={t}
              className="text-[9px] font-mono uppercase tracking-wider text-ink-3"
            >
              #{t}
            </span>
          ))}
          <span className="text-[9px] font-mono tabular-nums text-ink-3">
            · {note.wordCount}w
          </span>
        </div>
      </div>
    </motion.li>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d`;
  // Falls back to short date for older items.
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
