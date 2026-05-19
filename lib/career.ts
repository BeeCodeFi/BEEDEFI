/**
 * Career data layer. Stubbed — same pattern as lib/beecodefi and lib/brain.
 * Real data wires up in Phase 6 (NeonDB read).
 */

export type ApplicationStage =
  | "applied"
  | "phone"
  | "onsite"
  | "offer"
  | "rejected";

export type Application = {
  id: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  /** Days since the last activity on this application. */
  daysIdle: number;
  /** Salary band hint, optional. */
  bandHint?: string;
};

export type PrepItem = {
  id: string;
  topic: string;
  /** "system-design" | "behavioral" | "algorithms" | "domain" */
  kind: "system-design" | "behavioral" | "algorithms" | "domain";
  confidence: number; // 0-100
};

export type CareerSnapshot = {
  applications: Application[];
  prep: PrepItem[];
  /** Aggregate counts; surfaced as the header stats. */
  stats: {
    activeLeads: number;
    responseRatePct: number;
    avgDaysToReply: number;
    /** Stage counts in declared order. */
    byStage: Record<ApplicationStage, number>;
  };
};

export async function getCareerSnapshot(): Promise<CareerSnapshot> {
  return MOCK_SNAPSHOT;
}

const STAGES: ApplicationStage[] = ["applied", "phone", "onsite", "offer", "rejected"];

const APPLICATIONS: Application[] = [
  { id: "a1",  company: "Anchor Systems",     role: "Senior Distributed Systems Eng",   stage: "onsite",   daysIdle: 2,  bandHint: "$220–260k" },
  { id: "a2",  company: "Helix Robotics",     role: "Staff Backend Eng",                stage: "phone",    daysIdle: 5 },
  { id: "a3",  company: "Quill AI",           role: "Founding Engineer",                stage: "offer",    daysIdle: 1,  bandHint: "$180–220k + eq" },
  { id: "a4",  company: "Norther Labs",       role: "Senior Platform Eng",              stage: "applied",  daysIdle: 11 },
  { id: "a5",  company: "Mercury Compute",    role: "Tech Lead, Storage",               stage: "onsite",   daysIdle: 4 },
  { id: "a6",  company: "Lighthouse Data",    role: "Senior Eng, Analytics",            stage: "applied",  daysIdle: 18 },
  { id: "a7",  company: "Drift Audio",        role: "Senior Eng, Realtime",             stage: "rejected", daysIdle: 9 },
  { id: "a8",  company: "Pleiades Health",    role: "Staff Eng, Patient Platform",      stage: "applied",  daysIdle: 3 },
  { id: "a9",  company: "Spool",              role: "Senior Eng, Pipelines",            stage: "phone",    daysIdle: 8 },
  { id: "a10", company: "Bowline AI",         role: "Founding Eng (Infra)",             stage: "applied",  daysIdle: 7 },
  { id: "a11", company: "Folio",              role: "Senior Eng, Editor Surfaces",      stage: "rejected", daysIdle: 24 },
  { id: "a12", company: "Citizen Compute",    role: "Senior Backend Eng",               stage: "applied",  daysIdle: 1 },
];

const PREP: PrepItem[] = [
  { id: "p1", topic: "Designing a distributed log",            kind: "system-design", confidence: 78 },
  { id: "p2", topic: "Behavioral: conflict story arc",         kind: "behavioral",    confidence: 64 },
  { id: "p3", topic: "Graph algos: SCCs, topological order",   kind: "algorithms",    confidence: 55 },
  { id: "p4", topic: "Storage internals: LSM vs B-tree",       kind: "domain",        confidence: 82 },
  { id: "p5", topic: "Designing a multi-region key-value",     kind: "system-design", confidence: 71 },
  { id: "p6", topic: "Negotiation: anchor on TC, not base",    kind: "behavioral",    confidence: 48 },
];

const MOCK_SNAPSHOT: CareerSnapshot = {
  applications: APPLICATIONS,
  prep: PREP,
  stats: (() => {
    const byStage = STAGES.reduce(
      (acc, s) => ((acc[s] = APPLICATIONS.filter((a) => a.stage === s).length), acc),
      {} as Record<ApplicationStage, number>
    );
    const active = APPLICATIONS.filter((a) => a.stage !== "rejected").length;
    return {
      activeLeads: active,
      responseRatePct: 58,
      avgDaysToReply: 6,
      byStage,
    };
  })(),
};

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  applied: "Applied",
  phone: "Phone",
  onsite: "Onsite",
  offer: "Offer",
  rejected: "Rejected",
};

export const STAGE_ACCENT: Record<ApplicationStage, "cyan" | "magenta" | "amber" | "violet" | "ink"> = {
  applied: "ink",
  phone: "cyan",
  onsite: "magenta",
  offer: "amber",
  rejected: "ink",
};

export const PREP_KIND_LABEL: Record<PrepItem["kind"], string> = {
  "system-design": "System design",
  behavioral: "Behavioral",
  algorithms: "Algorithms",
  domain: "Domain",
};
