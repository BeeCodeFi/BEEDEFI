"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Brain,
  Briefcase,
  HeartPulse,
  Video,
  GraduationCap,
  Plus,
  Trash2,
  Save,
  Download,
  Upload,
  Check,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  getStoredBrain,
  setStoredBrain,
  getStoredCareer,
  setStoredCareer,
  getStoredHealth,
  setStoredHealth,
  getStoredStudio,
  setStoredStudio,
  getStoredLearning,
  setStoredLearning,
  getStoredAgentState,
  setStoredAgentState,
  exportAllData,
  importAllData,
} from "@/lib/store";
import type { Note } from "@/lib/brain";
import type { Application, ApplicationStage, PrepItem } from "@/lib/career";
import type { DailyPoint, HealthEvent } from "@/lib/health";
import type { ContentRow } from "@/lib/studio";
import type { AgentId, AgentState, AgentActivity } from "@/lib/agents";
import type { LearningSnapshot, LearningPath, LearningActivity, ReviewItem } from "@/lib/beecodefi";

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

type Tab = "brain" | "career" | "health" | "studio" | "agents" | "learning" | "backup";

const TABS: Array<{ id: Tab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }> = [
  { id: "brain", label: "Brain", icon: Brain },
  { id: "career", label: "Career", icon: Briefcase },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "studio", label: "Studio", icon: Video },
  { id: "agents", label: "Agents", icon: Sparkles },
  { id: "learning", label: "Learning", icon: GraduationCap },
  { id: "backup", label: "Backup", icon: Download },
];

const ACCENT_TEXT = {
  cyan: "text-signal-cyan",
  magenta: "text-signal-magenta",
  amber: "text-signal-amber",
  violet: "text-signal-violet",
} as const;

const ACCENT_BG = {
  cyan: "bg-signal-cyan/10 border-signal-cyan/40",
  magenta: "bg-signal-magenta/10 border-signal-magenta/40",
  amber: "bg-signal-amber/10 border-signal-amber/40",
  violet: "bg-signal-violet/10 border-signal-violet/40",
} as const;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DataEntry() {
  const [tab, setTab] = useState<Tab>("brain");
  const [saved, setSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      {/* Tab strip */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-xs",
                active
                  ? "bg-signal-cyan/10 border-signal-cyan/40"
                  : "bg-white/[0.02] border-edge hover:border-edge-strong hover:bg-white/[0.04]"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", active ? "text-signal-cyan" : "text-ink-3")} strokeWidth={1.5} />
              <span className={cn("font-mono uppercase tracking-wider", active ? "text-signal-cyan" : "text-ink-2")}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Save confirmation toast */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-6 right-6 z-[200] inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-signal-cyan/20 border border-signal-cyan/50 shadow-glow-cyan-sm"
        >
          <Check className="w-4 h-4 text-signal-cyan" strokeWidth={2} />
          <span className="text-xs font-mono uppercase tracking-wider text-signal-cyan">
            Saved to local storage
          </span>
        </motion.div>
      )}

      {/* Tab content */}
      {tab === "brain" && <BrainTab onSave={showSaved} />}
      {tab === "career" && <CareerTab onSave={showSaved} />}
      {tab === "health" && <HealthTab onSave={showSaved} />}
      {tab === "studio" && <StudioTab onSave={showSaved} />}
      {tab === "agents" && <AgentsTab onSave={showSaved} />}
      {tab === "learning" && <LearningTab onSave={showSaved} />}
      {tab === "backup" && <BackupTab onSave={showSaved} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared form primitives
// ---------------------------------------------------------------------------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-3">{label}</span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-white/[0.03] border border-edge rounded-lg px-3 py-2 text-sm text-ink-1 placeholder:text-ink-3",
        "focus:outline-none focus:border-signal-cyan/50 transition-colors",
        props.className
      )}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full bg-white/[0.03] border border-edge rounded-lg px-3 py-2 text-sm text-ink-1 placeholder:text-ink-3 resize-y min-h-[80px]",
        "focus:outline-none focus:border-signal-cyan/50 transition-colors",
        props.className
      )}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className={cn(
        "w-full bg-white/[0.03] border border-edge rounded-lg px-3 py-2 text-sm text-ink-1",
        "focus:outline-none focus:border-signal-cyan/50 transition-colors",
        props.className
      )}
    />
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-signal-cyan/10 border border-signal-cyan/40 hover:bg-signal-cyan/20 transition-colors"
    >
      <Save className="w-3.5 h-3.5 text-signal-cyan" strokeWidth={2} />
      <span className="text-xs font-mono uppercase tracking-wider text-signal-cyan">Save</span>
    </button>
  );
}

function AddButton({ onClick, label = "Add" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-edge hover:border-signal-cyan/40 hover:bg-signal-cyan/5 transition-colors"
    >
      <Plus className="w-3.5 h-3.5 text-signal-cyan" strokeWidth={2} />
      <span className="text-xs font-mono uppercase tracking-wider text-ink-2">{label}</span>
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded-md hover:bg-signal-amber/10 transition-colors"
      aria-label="Remove"
    >
      <Trash2 className="w-3.5 h-3.5 text-signal-amber" strokeWidth={1.5} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// BRAIN TAB
// ---------------------------------------------------------------------------

function BrainTab({ onSave }: { onSave: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);

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
    onSave();
  };

  return (
    <div className="flex flex-col gap-4">
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
          No notes yet — click &quot;Add note&quot; to begin
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CAREER TAB
// ---------------------------------------------------------------------------

function CareerTab({ onSave }: { onSave: () => void }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [prep, setPrep] = useState<PrepItem[]>([]);

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
    onSave();
  };

  return (
    <div className="flex flex-col gap-6">
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
                <Input value={app.bandHint ?? ""} onChange={(e) => updateApp(i, { bandHint: e.target.value || undefined })} placeholder="$180–220k" />
              </Field>
            </div>
          </GlassPanel>
        ))}
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
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HEALTH TAB
// ---------------------------------------------------------------------------

function HealthTab({ onSave }: { onSave: () => void }) {
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
      week: [today], // Will accumulate over days
      events: [],
    });
    onSave();
  };

  return (
    <div className="flex flex-col gap-4">
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

// ---------------------------------------------------------------------------
// STUDIO TAB
// ---------------------------------------------------------------------------

function StudioTab({ onSave }: { onSave: () => void }) {
  const [content, setContent] = useState<ContentRow[]>([]);

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
    onSave();
  };

  return (
    <div className="flex flex-col gap-4">
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
          No content yet — click &quot;Add piece&quot; to track published work
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AGENTS TAB
// ---------------------------------------------------------------------------

const AGENT_IDS: AgentId[] = ["content", "learning", "research", "productivity", "business", "analytics", "health"];

function AgentsTab({ onSave }: { onSave: () => void }) {
  const [states, setStates] = useState<Record<AgentId, AgentState>>(() => {
    const idle: AgentState = { status: "idle", currentTask: "Standing by", progress: 0, etaMinutes: null, activity: [] };
    return Object.fromEntries(AGENT_IDS.map((id) => [id, { ...idle }])) as Record<AgentId, AgentState>;
  });

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
    onSave();
  };

  return (
    <div className="flex flex-col gap-4">
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

          {/* Activity entries */}
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

// ---------------------------------------------------------------------------
// LEARNING TAB
// ---------------------------------------------------------------------------

function LearningTab({ onSave }: { onSave: () => void }) {
  const [snapshot, setSnapshot] = useState<LearningSnapshot>({
    currentPath: null,
    streakDays: 0,
    studiedToday: false,
    recentActivity: [],
    upcomingReviews: [],
    lastSyncedAt: null,
  });

  useEffect(() => {
    const stored = getStoredLearning();
    if (stored) setSnapshot(stored);
  }, []);

  const update = (patch: Partial<LearningSnapshot>) => {
    setSnapshot((prev) => ({ ...prev, ...patch }));
  };

  const setPath = (patch: Partial<LearningPath>) => {
    const current = snapshot.currentPath ?? { id: "path-1", title: "", progress: 0, totalLessons: 0, completedLessons: 0, etaMinutes: null };
    update({ currentPath: { ...current, ...patch } });
  };

  const save = () => {
    setStoredLearning(snapshot);
    onSave();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-ink-1">Learning State</h3>
        <SaveButton onClick={save} />
      </div>

      <GlassPanel className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Field label="Streak (days)">
            <Input type="number" value={snapshot.streakDays} onChange={(e) => update({ streakDays: Number(e.target.value) })} />
          </Field>
          <Field label="Studied today">
            <Select value={snapshot.studiedToday ? "yes" : "no"} onChange={(e) => update({ studiedToday: e.target.value === "yes" })}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </Field>
        </div>

        <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-3 mb-3">Current Path</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Field label="Title">
            <Input value={snapshot.currentPath?.title ?? ""} onChange={(e) => setPath({ title: e.target.value })} placeholder="Course name" />
          </Field>
          <Field label="Progress (0-100)">
            <Input type="number" min={0} max={100} value={snapshot.currentPath?.progress ?? 0} onChange={(e) => setPath({ progress: Number(e.target.value) })} />
          </Field>
          <Field label="Total lessons">
            <Input type="number" value={snapshot.currentPath?.totalLessons ?? 0} onChange={(e) => setPath({ totalLessons: Number(e.target.value) })} />
          </Field>
          <Field label="Completed lessons">
            <Input type="number" value={snapshot.currentPath?.completedLessons ?? 0} onChange={(e) => setPath({ completedLessons: Number(e.target.value) })} />
          </Field>
        </div>
      </GlassPanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BACKUP TAB
// ---------------------------------------------------------------------------

function BackupTab({ onSave }: { onSave: () => void }) {
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beedefi-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError(null);
    if (!importText.trim()) {
      setImportError("Paste JSON data first");
      return;
    }
    const success = importAllData(importText);
    if (success) {
      setImportText("");
      onSave();
    } else {
      setImportError("Invalid JSON — could not parse");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Export */}
      <GlassPanel className="p-5">
        <h3 className="font-display text-lg text-ink-1 mb-2">Export</h3>
        <p className="text-[12px] text-ink-2 mb-4">
          Download all your BEEDEFI data as a single JSON file. Use this as a backup
          or to transfer data between browsers.
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-signal-cyan/10 border border-signal-cyan/40 hover:bg-signal-cyan/20 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-signal-cyan" strokeWidth={2} />
          <span className="text-xs font-mono uppercase tracking-wider text-signal-cyan">Export JSON</span>
        </button>
      </GlassPanel>

      {/* Import */}
      <GlassPanel className="p-5">
        <h3 className="font-display text-lg text-ink-1 mb-2">Import</h3>
        <p className="text-[12px] text-ink-2 mb-4">
          Paste a previously exported JSON to restore data. This will overwrite
          any existing data in localStorage for the sections present in the file.
        </p>
        <TextArea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder='Paste exported JSON here...'
          className="mb-3 min-h-[120px] font-mono text-xs"
        />
        {importError && (
          <p className="text-[11px] text-signal-amber mb-3">{importError}</p>
        )}
        <button
          type="button"
          onClick={handleImport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-signal-amber/10 border border-signal-amber/40 hover:bg-signal-amber/20 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-signal-amber" strokeWidth={2} />
          <span className="text-xs font-mono uppercase tracking-wider text-signal-amber">Import JSON</span>
        </button>
      </GlassPanel>
    </div>
  );
}
