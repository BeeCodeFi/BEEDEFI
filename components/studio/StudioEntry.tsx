"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Field, Input, Select, SaveButton, AddButton, RemoveButton, SaveToast, useSaveFlash,
} from "@/components/ui/FormPrimitives";
import { getStoredStudio, setStoredStudio } from "@/lib/store";
import type { ContentRow } from "@/lib/studio";

export function StudioEntry({ onSaved }: { onSaved?: () => void }) {
  const [content, setContent] = useState<ContentRow[]>([]);
  const { saved, showSaved } = useSaveFlash();

  useEffect(() => {
    const stored = getStoredStudio();
    if (stored) setContent(stored.content);
  }, []);

  const addContent = () => {
    setContent((prev) => [
      ...prev,
      { id: `c${Date.now()}`, title: "", publishedDaysAgo: 0, views: 0, ctrPct: 0, retentionPct: 0, engagement: 0 },
    ]);
  };

  const updateContent = (idx: number, patch: Partial<ContentRow>) => {
    setContent((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const removeContent = (idx: number) => {
    setContent((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = () => {
    setStoredStudio({ drafts: [], content });
    showSaved();
    onSaved?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <SaveToast visible={saved} />
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink-1">Published Content ({content.length})</h3>
        <div className="flex items-center gap-3">
          <AddButton onClick={addContent} label="Add piece" />
          <SaveButton onClick={save} />
        </div>
      </div>

      {content.map((row, i) => (
        <GlassPanel key={row.id} className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="text-[10px] font-mono text-ink-3">#{i + 1}</span>
            <RemoveButton onClick={() => removeContent(i)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Title">
              <Input value={row.title} onChange={(e) => updateContent(i, { title: e.target.value })} placeholder="Content title" />
            </Field>
            <Field label="Published (days ago)">
              <Input type="number" value={row.publishedDaysAgo} onChange={(e) => updateContent(i, { publishedDaysAgo: Number(e.target.value) })} />
            </Field>
            <Field label="Views">
              <Input type="number" value={row.views} onChange={(e) => updateContent(i, { views: Number(e.target.value) })} />
            </Field>
            <Field label="CTR %">
              <Input type="number" step="0.1" value={row.ctrPct} onChange={(e) => updateContent(i, { ctrPct: Number(e.target.value) })} />
            </Field>
            <Field label="Retention %">
              <Input type="number" value={row.retentionPct} onChange={(e) => updateContent(i, { retentionPct: Number(e.target.value) })} />
            </Field>
            <Field label="Engagement (0-100)">
              <Input type="number" min={0} max={100} value={row.engagement} onChange={(e) => updateContent(i, { engagement: Number(e.target.value) })} />
            </Field>
          </div>
        </GlassPanel>
      ))}

      {content.length === 0 && (
        <p className="text-center text-[12px] text-ink-3 font-mono uppercase tracking-wider py-8">
          No content yet &mdash; click &quot;Add piece&quot; to track published work
        </p>
      )}
    </div>
  );
}
