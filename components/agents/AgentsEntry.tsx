"use client";

import { useState, useEffect } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Field, Input, Select, SaveButton, AddButton, RemoveButton, SaveToast, useSaveFlash,
} from "@/components/ui/FormPrimitives";
import { getStoredAgentState, setStoredAgentState } from "@/lib/store";
import type { AgentId, AgentState, AgentActivity } from "@/lib/agents";

const AGENT_IDS: AgentId[] = ["content", "learning", "research", "productivity", "business", "analytics", "health"];

export function AgentsEntry({ onSaved }: { onSaved?: () => void }) {
  const [states, setStates] = useState<Record<AgentId, AgentState>>(() => {
    const idle: AgentState = { status: "idle", currentTask: "Standing by", progress: 0, etaMinutes: null, activity: [] };
    return Object.fromEntries(AGENT_IDS.map((id) => [id, { ...idle }])) as Record<AgentId, AgentState>;
  });
  const { saved, showSaved } = useSaveFlash();

  useEffect(() => {
    const stored = getStoredAgentState();
    if (stored) setStates(stored);
  }, []);

  const updateAgent = (id: AgentId, patch: Partial<AgentState>) => {
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const addActivity = (id: AgentId) => {
    const activity: AgentActivity = { ago: 0, text: "" };
    setStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], activity: [...prev[id].activity, activity] },
    }));
  };

  const updateActivity = (id: AgentId, idx: number, patch: Partial<AgentActivity>) => {
    setStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        activity: prev[id].activity.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
      },
    }));
  };

  const removeActivity = (id: AgentId, idx: number) => {
    setStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], activity: prev[id].activity.filter((_, i) => i !== idx) },
    }));
  };

  const save = () => {
    setStoredAgentState(states);
    showSaved();
    onSaved?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <SaveToast visible={saved} />
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink-1">Agent States</h3>
        <SaveButton onClick={save} />
      </div>

      {AGENT_IDS.map((id) => (
        <GlassPanel key={id} className="p-4">
          <h4 className="font-display text-sm font-medium text-ink-1 mb-3 capitalize">{id}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <Field label="Status">
              <Select value={states[id].status} onChange={(e) => updateAgent(id, { status: e.target.value as AgentState["status"] })}>
                <option value="idle">Idle</option>
                <option value="thinking">Thinking</option>
                <option value="working">Working</option>
                <option value="blocked">Blocked</option>
              </Select>
            </Field>
            <Field label="Current task">
              <Input value={states[id].currentTask} onChange={(e) => updateAgent(id, { currentTask: e.target.value })} placeholder="What is this agent doing?" />
            </Field>
            <Field label="Progress (0-100)">
              <Input type="number" min={0} max={100} value={states[id].progress} onChange={(e) => updateAgent(id, { progress: Number(e.target.value) })} />
            </Field>
            <Field label="ETA (minutes)">
              <Input type="number" value={states[id].etaMinutes ?? ""} onChange={(e) => updateAgent(id, { etaMinutes: e.target.value ? Number(e.target.value) : null })} placeholder="null = hidden" />
            </Field>
          </div>

          <div className="mt-3 border-t border-edge pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">Activity</span>
              <AddButton onClick={() => addActivity(id)} label="Add" />
            </div>
            {states[id].activity.map((act, ai) => (
              <div key={ai} className="flex items-center gap-2 mb-2">
                <Input type="number" value={act.ago} onChange={(e) => updateActivity(id, ai, { ago: Number(e.target.value) })} placeholder="min ago" className="w-20" />
                <Input value={act.text} onChange={(e) => updateActivity(id, ai, { text: e.target.value })} placeholder="What happened" className="flex-1" />
                <RemoveButton onClick={() => removeActivity(id, ai)} />
              </div>
            ))}
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
