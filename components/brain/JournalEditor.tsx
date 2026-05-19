"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Hash } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import type { Note } from "@/lib/brain";

/**
 * Quick-capture editor. Title + body + tags, emits a Note via onSave.
 *
 * Session-local: the parent page holds the appended notes in state, so what
 * you write persists across navigations *within* this tab but doesn't survive
 * a reload. Persistence ships with Phase 6 (NeonDB + auth).
 */
type Props = {
  onSave: (note: Note) => void;
  /** Tags from the current corpus — surfaced as quick-pick chips below the input. */
  existingTags: string[];
};

export function JournalEditor({ onSave, existingTags }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [saved, setSaved] = useState(false);

  const tags = parseTagInput(tagInput);
  const canSave = title.trim().length > 0 && body.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const trimmedBody = body.trim();
    const note: Note = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      excerpt: trimmedBody.slice(0, 160) + (trimmedBody.length > 160 ? "…" : ""),
      tags,
      createdAt: new Date().toISOString(),
      wordCount: countWords(trimmedBody),
    };
    onSave(note);

    // Reset + confirm
    setTitle("");
    setBody("");
    setTagInput("");
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const addTag = (t: string) => {
    if (tags.includes(t)) return;
    setTagInput(tagInput ? `${tagInput}, ${t}` : t);
  };

  return (
    <GlassPanel edge className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-signal-violet">
            Capture
          </p>
          <h3 className="font-display text-lg font-light text-ink-1 mt-0.5">
            New note
          </h3>
        </div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
          Session-local · persistence in Phase 6
        </p>
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title — one clear claim"
        className="w-full bg-transparent border-0 border-b border-edge focus:border-signal-violet/60 focus:outline-none py-2 text-lg font-display text-ink-1 placeholder:text-ink-3 transition-colors"
      />

      {/* Body */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write the idea atomically. Link to others with [[wikilinks]]."
        rows={5}
        className="mt-4 w-full bg-white/[0.02] border border-edge rounded-lg p-3 text-sm text-ink-1 placeholder:text-ink-3 focus:border-signal-violet/40 focus:outline-none focus:shadow-glow-violet-sm transition-all resize-y font-body leading-relaxed"
      />

      {/* Tag input */}
      <div className="mt-3 flex items-center gap-2">
        <Hash className="w-3.5 h-3.5 text-ink-3 shrink-0" strokeWidth={1.5} />
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="tags, comma, separated"
          className="flex-1 bg-transparent border-0 focus:outline-none text-[12px] font-mono text-ink-1 placeholder:text-ink-3"
        />
        {tags.length > 0 && (
          <span className="text-[10px] font-mono tabular-nums text-ink-3">
            {tags.length}
          </span>
        )}
      </div>

      {/* Existing-tag quick-picks */}
      {existingTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {existingTags.slice(0, 8).map((t) => {
            const active = tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => addTag(t)}
                disabled={active}
                className={
                  active
                    ? "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-signal-violet/40 bg-signal-violet/10 text-signal-violet"
                    : "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-edge text-ink-3 hover:text-ink-1 hover:border-edge-strong transition-colors"
                }
              >
                #{t}
              </button>
            );
          })}
        </div>
      )}

      {/* Save row */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-[10px] font-mono tabular-nums text-ink-3">
          {countWords(body)}w · {body.length}c
        </p>
        <div className="flex items-center gap-3">
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] font-mono uppercase tracking-wider text-signal-violet"
            >
              Captured
            </motion.span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={
              canSave
                ? "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-signal-violet/15 border border-signal-violet/50 hover:bg-signal-violet/25 hover:border-signal-violet transition-colors shadow-glow-violet-sm"
                : "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.03] border border-edge text-ink-3 cursor-not-allowed"
            }
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
            <span className="text-xs font-mono uppercase tracking-wider">
              Capture
            </span>
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}

function parseTagInput(s: string): string[] {
  return s
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/^#+/, ""))
    .filter(Boolean);
}

function countWords(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}
