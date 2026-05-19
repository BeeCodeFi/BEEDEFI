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
 * Mock state. Hand-tuned to read like a plausible weekday afternoon — a mix of
 * statuses so the UI surfaces every variant on first render. Replace with a
 * live source in Phase 6; the shape is intentionally serializable.
 */
export const MOCK_STATE: Record<AgentId, AgentState> = {
  content: {
    status: "working",
    currentTask: "Drafting Q2 content strategy script",
    progress: 43,
    etaMinutes: 12,
    activity: [
      { ago: 4,  text: "Synthesized 3 reference notes into a hook" },
      { ago: 12, text: "Drafted 1,200 words for the long-form arc" },
      { ago: 23, text: "Pulled 5 analytics events for cold-open data" },
    ],
  },
  learning: {
    status: "thinking",
    currentTask: "Scheduling spaced-repetition review batch",
    progress: 67,
    etaMinutes: 4,
    activity: [
      { ago: 2,  text: "Re-ranked 18 flashcards by retention curve" },
      { ago: 9,  text: "Added 4 new cards from yesterday's reading" },
      { ago: 31, text: "Marked 'system design' path 12% further along" },
    ],
  },
  research: {
    status: "working",
    currentTask: "Synthesizing distributed-systems failure modes",
    progress: 78,
    etaMinutes: 6,
    activity: [
      { ago: 1,  text: "Cross-referenced 3 papers on partial failures" },
      { ago: 8,  text: "Pulled quotes from 2 newsletter back-issues" },
      { ago: 19, text: "Flagged 1 source as low-confidence" , tone: "alert" },
    ],
  },
  productivity: {
    status: "idle",
    currentTask: "Awaiting next focus block",
    progress: 0,
    etaMinutes: null,
    activity: [
      { ago: 17, text: "Closed the 14:00 focus block — 47m on-task" },
      { ago: 62, text: "Rescheduled 2 calendar conflicts" },
      { ago: 94, text: "Surfaced 3 stale tasks to triage" },
    ],
  },
  business: {
    status: "blocked",
    currentTask: "Waiting on response from stakeholder review",
    progress: 35,
    etaMinutes: null,
    activity: [
      { ago: 6,  text: "Drafted decision memo for pricing change" , tone: "alert" },
      { ago: 38, text: "Updated pipeline: 12 leads → 9 qualified" },
      { ago: 71, text: "Filed 1 ops anomaly for review" },
    ],
  },
  analytics: {
    status: "working",
    currentTask: "Recomputing weekly engagement deltas",
    progress: 21,
    etaMinutes: 18,
    activity: [
      { ago: 3,  text: "Recomputed 4 dashboards on fresh data" },
      { ago: 14, text: "Flagged 1 metric anomaly (engagement -22%)" , tone: "alert" },
      { ago: 41, text: "Backfilled 6 hours of missing events" },
    ],
  },
  health: {
    status: "idle",
    currentTask: "Monitoring evening recovery window",
    progress: 0,
    etaMinutes: null,
    activity: [
      { ago: 22, text: "Logged 6,200 steps — under daily target" },
      { ago: 48, text: "Detected elevated HRV — energy reading 'high'" },
      { ago: 86, text: "Reminded user to hydrate" },
    ],
  },
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
  return AGENTS.map((a) => ({ ...a, state: MOCK_STATE[a.id] }));
}
