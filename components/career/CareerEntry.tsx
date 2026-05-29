"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Field, Input, Select, SaveButton, AddButton, RemoveButton, SaveToast, useSaveFlash,
} from "@/components/ui/FormPrimitives";
import { getStoredCareer, setStoredCareer } from "@/lib/store";
import type { Application, ApplicationStage, PrepItem } from "@/lib/career";

export function CareerEntry({ onSaved }: { onSaved?: () => void }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [prep, setPrep] = useState<PrepItem[]>([]);
  const { saved, showSaved } = useSaveFlash();

  useEffect(() => {
    const stored = getStoredCareer();
    if (stored) {
      setApps(stored.applications);
      setPrep(stored.prep);
    }
  }, []);

  const addApp = () => {
    setApps((prev) => [
      ...prev,
      { id: `a${Date.now()}`, company: "", role: "", stage: "applied", daysIdle: 0 },
    ]);
  };

  const updateApp = (idx: number, patch: Partial<Application>) => {
    setApps((prev) => prev.map((a, i) => (i === idx ? { ...a, ...patch } : a)));
  };

  const removeApp = (idx: number) => {
    setApps((prev) => prev.filter((_, i) => i !== idx));
  };

  const addPrep = () => {
    setPrep((prev) => [
      ...prev,
      { id: `p${Date.now()}`, topic: "", kind: "system-design", confidence: 0 },
    ]);
  };

  const updatePrep = (idx: number, patch: Partial<PrepItem>) => {
    setPrep((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const removePrep = (idx: number) => {
    setPrep((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = () => {
    setStoredCareer({ applications: apps, prep });
    showSaved();
    onSaved?.();
  };

  return (
    <div className="flex flex-col gap-6">
      <SaveToast visible={saved} />

      {/* Applications */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-ink-1">Applications ({apps.length})</h3>
          <div className="flex items-center gap-3">
            <AddButton onClick={addApp} label="Add application" />
            <SaveButton onClick={save} />
          </div>
        </div>

        {apps.map((app, i) => (
          <GlassPanel key={app.id} className="p-4 mb-3">
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-[10px] font-mono text-ink-3">#{i + 1}</span>
              <RemoveButton onClick={() => removeApp(i)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Field label="Company">
                <Input value={app.company} onChange={(e) => updateApp(i, { company: e.target.value })} placeholder="Company name" />
              </Field>
              <Field label="Role">
                <Input value={app.role} onChange={(e) => updateApp(i, { role: e.target.value })} placeholder="Position title" />
              </Field>
              <Field label="Stage">
                <Select value={app.stage} onChange={(e) => updateApp(i, { stage: e.target.value as ApplicationStage })}>
                  <option value="applied">Applied</option>
                  <option value="phone">Phone</option>
                  <option value="onsite">Onsite</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </Field>
              <Field label="Days idle">
                <Input type="number" value={app.daysIdle} onChange={(e) => updateApp(i, { daysIdle: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Band hint (optional)">
                <Input value={app.bandHint ?? ""} onChange={(e) => updateApp(i, { bandHint: e.target.value || undefined })} placeholder="$180-220k" />
              </Field>
            </div>
          </GlassPanel>
        ))}

        {apps.length === 0 && (
          <p className="text-center text-[12px] text-ink-3 font-mono uppercase tracking-wider py-6">
            No applications yet
          </p>
        )}
      </section>

      {/* Prep */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-ink-1">Prep ({prep.length})</h3>
          <AddButton onClick={addPrep} label="Add topic" />
        </div>

        {prep.map((p, i) => (
          <GlassPanel key={p.id} className="p-4 mb-3">
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-[10px] font-mono text-ink-3">#{i + 1}</span>
              <RemoveButton onClick={() => removePrep(i)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Topic">
                <Input value={p.topic} onChange={(e) => updatePrep(i, { topic: e.target.value })} placeholder="Interview topic" />
              </Field>
              <Field label="Kind">
                <Select value={p.kind} onChange={(e) => updatePrep(i, { kind: e.target.value as PrepItem["kind"] })}>
                  <option value="system-design">System Design</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="algorithms">Algorithms</option>
                  <option value="domain">Domain</option>
                </Select>
              </Field>
              <Field label="Confidence (0-100)">
                <Input type="number" min={0} max={100} value={p.confidence} onChange={(e) => updatePrep(i, { confidence: Number(e.target.value) })} />
              </Field>
            </div>
          </GlassPanel>
        ))}

        {prep.length === 0 && (
          <p className="text-center text-[12px] text-ink-3 font-mono uppercase tracking-wider py-6">
            No prep topics yet
          </p>
        )}
      </section>
    </div>
  );
}
