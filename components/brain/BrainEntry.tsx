"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Field, Input, TextArea, SaveButton, AddButton, RemoveButton, SaveToast, useSaveFlash,
} from "@/components/ui/FormPrimitives";
import { getStoredBrain, setStoredBrain } from "@/lib/store";
import type { Note } from "@/lib/brain";

export function BrainEntry({ onSaved }: { onSaved?: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const { saved, showSaved } = useSaveFlash();

  useEffect(() => {
    const stored = getStoredBrain();
    if (stored) setNotes(stored.notes);
  }, []);

  const addNote = () => {
    setNotes((prev) => [
      ...prev,
      {
        id: `n${Date.now()}`,
        title: "",
        excerpt: "",
        tags: [],
        createdAt: new Date().toISOString(),
        wordCount: 0,
      },
    ]);
  };

  const updateNote = (idx: number, patch: Partial<Note>) => {
    setNotes((prev) => prev.map((n, i) => (i === idx ? { ...n, ...patch } : n)));
  };

  const removeNote = (idx: number) => {
    setNotes((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = () => {
    setStoredBrain({ notes, links: [] });
    showSaved();
    onSaved?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <SaveToast visible={saved} />
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink-1">Notes ({notes.length})</h3>
        <div className="flex items-center gap-3">
          <AddButton onClick={addNote} label="Add note" />
          <SaveButton onClick={save} />
        </div>
      </div>

      {notes.map((note, i) => (
        <GlassPanel key={note.id} className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="text-[10px] font-mono text-ink-3">#{i + 1}</span>
            <RemoveButton onClick={() => removeNote(i)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Title">
              <Input value={note.title} onChange={(e) => updateNote(i, { title: e.target.value })} placeholder="Note title" />
            </Field>
            <Field label="Tags (comma-separated)">
              <Input
                value={note.tags.join(", ")}
                onChange={(e) => updateNote(i, { tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                placeholder="systems, ai, product"
              />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Excerpt">
              <TextArea
                value={note.excerpt}
                onChange={(e) => updateNote(i, {
                  excerpt: e.target.value,
                  wordCount: e.target.value.split(/\s+/).filter(Boolean).length,
                })}
                placeholder="The main insight or idea..."
              />
            </Field>
          </div>
        </GlassPanel>
      ))}

      {notes.length === 0 && (
        <p className="text-center text-[12px] text-ink-3 font-mono uppercase tracking-wider py-8">
          No notes yet &mdash; click &quot;Add note&quot; to begin
        </p>
      )}
    </div>
  );
}
