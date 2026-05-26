"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { KnowledgeGraph } from "./KnowledgeGraph";
import { Timeline } from "./Timeline";
import { JournalEditor } from "./JournalEditor";
import type { BrainSnapshot, Note } from "@/lib/brain";

/**
 * Client shell for /brain. Holds the appended-notes state so the JournalEditor
 * can prepend new captures without a round-trip. The graph + timeline both
 * read from this single source.
 *
 * Why hoist state here instead of inside JournalEditor: the graph and timeline
 * are siblings of the editor, so the state has to live above all three. Keeping
 * the page component itself a server component preserves the static-shell
 * benefit while letting the interactive shell live in one client island.
 */
type Props = {
  initial: BrainSnapshot;
};

export function BrainShell({ initial }: Props) {
  const [notes, setNotes] = useState<Note[]>(initial.notes);

  const addNote = (note: Note) => {
    setNotes((prev) => [note, ...prev]);
  };

  // Tags are derived — recompute on add so the quick-pick chips stay current.
  const tags = useMemo(
    () => Array.from(new Set(notes.flatMap((n) => n.tags))).sort(),
    [notes]
  );

  return (
    <>
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 sm:mb-8"
      >
        <KnowledgeGraph notes={notes} links={initial.links} />
      </motion.section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <div className="flex items-end justify-between mb-4">
            <h2 className="font-display text-xl font-light tracking-tight text-ink-1">
              Timeline
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
              {notes.length} notes
            </span>
          </div>
          <Timeline notes={notes} />
        </div>

        <div>
          <div className="flex items-end justify-between mb-4">
            <h2 className="font-display text-xl font-light tracking-tight text-ink-1">
              Journal
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
              {tags.length} tags in play
            </span>
          </div>
          <JournalEditor onSave={addNote} existingTags={tags} />
        </div>
      </section>
    </>
  );
}
