import {
  Sparkles,
  GraduationCap,
  Telescope,
  ListChecks,
  Briefcase,
  BarChart3,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";

/**
 * Phase 3 agent roster. The seven agents are static for now — Phase 6 wires
 * them to real backends. Anything that will eventually come from the server
 * (status, currentTask, activity) lives on a separate `state` shape so it can
 * be swapped for a live source without restructuring the component tree.
 */

export type AgentStatus = "idle" | "thinking" | "working" | "blocked";

/**
 * Accent comes from the existing semantic palette. We deliberately re-use the
 * three signal hues (no per-agent custom colors) so the dashboard reads as a
 * cohesive system rather than seven independent UIs. signal-violet is reserved
 * for the network bus and is not assigned to any single agent.
 */
export type AgentAccent = "cyan" | "magenta" | "amber";

export type AgentId =
  | "content"
  | "learning"
  | "research"
  | "productivity"
  | "business"
  | "analytics"
  | "health";

export type Agent = {
  id: AgentId;
  label: string;
  role: string;
  icon: LucideIcon;
  accent: AgentAccent;
};

export type AgentActivity = {
  /** Minutes since the action — converted to "Nm ago" by the feed renderer. */
  ago: number;
  text: string;
  /** "ok" leaves the marker neutral; "alert" tints the bullet amber. */
  tone?: "ok" | "alert";
};

export type AgentState = {
  status: AgentStatus;
  currentTask: string;
  /** 0-100. The progress ring is the source of truth for visual completeness. */
  progress: number;
  /** Minutes remaining. Display only — null hides the ETA. */
  etaMinutes: number | null;
  activity: AgentActivity[];
};

export type AgentWithState = Agent & { state: AgentState };

/**
 * Static catalog. Ordering here also drives the network-viz polar angles —
 * see AgentNetwork for the angle calculation.
 */
export const AGENTS: Agent[] = [
  { id: "content",      label: "Content",      role: "Drafts, hooks, scripts",        icon: Sparkles,      accent: "magenta" },
  { id: "learning",     label: "Learning",     role: "Recall, paths, retention",      icon: GraduationCap, accent: "amber"   },
  { id: "research",     label: "Research",     role: "Source gathering, synthesis",   icon: Telescope,     accent: "cyan"    },
  { id: "productivity", label: "Productivity", role: "Tasks, focus, calendar",        icon: ListChecks,    accent: "cyan"    },
  { id: "business",     label: "Business",     role: "Pipeline, ops, decisions",      icon: Briefcase,     accent: "amber"   },
  { id: "analytics",    label: "Analytics",    role: "Signals, dashboards, anomaly",  icon: BarChart3,     accent: "magenta" },
  { id: "health",       label: "Health",       role: "Energy, sleep, movement",       icon: HeartPulse,    accent: "cyan"    },
];

/**
 * Initial state. All agents start idle with no activity — real tasks and
 * history will accumulate as you use the system. Phase 6 wires this to a
 * live backend; until then, edit currentTask and add activity entries here
 * as your day progresses.
 */
const IDLE: AgentState = {
  status: "idle",
  currentTask: "Standing by",
  progress: 0,
  etaMinutes: null,
  activity: [],
};

export const AGENT_STATE: Record<AgentId, AgentState> = {
  content:      { ...IDLE },
  learning:     { ...IDLE },
  research:     { ...IDLE },
  productivity: { ...IDLE },
  business:     { ...IDLE },
  analytics:    { ...IDLE },
  health:       { ...IDLE },
};

/**
 * Directed adjacency used by the network viz. Each edge means "the source
 * agent regularly produces data the target consumes." Bidirectional pairs
 * appear twice — that's fine, the viz renders both arrows.
 */
export const AGENT_EDGES: Array<[AgentId, AgentId]> = [
  ["research", "content"],
  ["research", "learning"],
  ["analytics", "content"],
  ["analytics", "business"],
  ["analytics", "health"],
  ["productivity", "content"],
  ["productivity", "business"],
  ["learning", "research"],
  ["health", "productivity"],
  ["business", "analytics"],
];

export function getAgentsWithState(): AgentWithState[] {
  return AGENTS.map((a) => ({ ...a, state: AGENT_STATE[a.id] }));
}
