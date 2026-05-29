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

// ---------------------------------------------------------------------------
// Your pipeline. Add applications here as you apply — the kanban columns and
// stats update automatically.
// ---------------------------------------------------------------------------

const APPLICATIONS: Application[] = [];

// ---------------------------------------------------------------------------
// Interview prep tracker. Add topics as you work through them.
// ---------------------------------------------------------------------------

const PREP: PrepItem[] = [];

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
      responseRatePct: 0,
      avgDaysToReply: 0,
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
