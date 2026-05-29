"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Field, Input, Select, SaveButton, SaveToast, useSaveFlash,
} from "@/components/ui/FormPrimitives";
import { getStoredHealth, setStoredHealth } from "@/lib/store";
import type { DailyPoint } from "@/lib/health";

export function HealthEntry({ onSaved }: { onSaved?: () => void }) {
  const [today, setToday] = useState<DailyPoint>({
    label: new Date().toLocaleDateString("en", { weekday: "short" }),
    date: new Date().toISOString().slice(0, 10),
    sleepHours: 0,
    sleepQuality: 0,
    steps: 0,
    activeMinutes: 0,
    hrvMs: 0,
  });
  const [energyIndex, setEnergyIndex] = useState(0);
  const [energyBand, setEnergyBand] = useState<"low" | "steady" | "high">("steady");
  const { saved, showSaved } = useSaveFlash();

  useEffect(() => {
    const stored = getStoredHealth();
    if (stored) {
      setToday(stored.today);
      setEnergyIndex(stored.energyIndex);
      setEnergyBand(stored.energyBand);
    }
  }, []);

  const save = () => {
    setStoredHealth({
      today,
      energyIndex,
      energyBand,
      week: [today],
      events: [],
    });
    showSaved();
    onSaved?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <SaveToast visible={saved} />
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink-1">Today&rsquo;s Health Data</h3>
        <SaveButton onClick={save} />
      </div>

      <GlassPanel className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Sleep hours">
            <Input type="number" step="0.1" value={today.sleepHours} onChange={(e) => setToday({ ...today, sleepHours: Number(e.target.value) })} />
          </Field>
          <Field label="Sleep quality (0-100)">
            <Input type="number" min={0} max={100} value={today.sleepQuality} onChange={(e) => setToday({ ...today, sleepQuality: Number(e.target.value) })} />
          </Field>
          <Field label="Steps">
            <Input type="number" value={today.steps} onChange={(e) => setToday({ ...today, steps: Number(e.target.value) })} />
          </Field>
          <Field label="Active minutes">
            <Input type="number" value={today.activeMinutes} onChange={(e) => setToday({ ...today, activeMinutes: Number(e.target.value) })} />
          </Field>
          <Field label="HRV (ms)">
            <Input type="number" value={today.hrvMs} onChange={(e) => setToday({ ...today, hrvMs: Number(e.target.value) })} />
          </Field>
          <Field label="Energy index (0-100)">
            <Input type="number" min={0} max={100} value={energyIndex} onChange={(e) => setEnergyIndex(Number(e.target.value))} />
          </Field>
          <Field label="Energy band">
            <Select value={energyBand} onChange={(e) => setEnergyBand(e.target.value as "low" | "steady" | "high")}>
              <option value="low">Low</option>
              <option value="steady">Steady</option>
              <option value="high">High</option>
            </Select>
          </Field>
        </div>
      </GlassPanel>
    </div>
  );
}
