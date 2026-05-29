/**
 * Creator-studio data layer + types. Stubbed mock data for analytics and prior
 * generations; live generation goes through lib/ai/* in Phase 6 (the call site
 * gracefully degrades to a stubbed AI response if no key is configured).
 */

export type ScriptDraft = {
  id: string;
  title: string;
  /** First ~120 chars of the body, for list previews. */
  preview: string;
  durationSec: number;
  createdAgoMin: number;
};

export type HookVariant = {
  id: string;
  text: string;
  /** Stylistic descriptor — for the chip beneath each variant. */
  style:
    | "question-rebuttal"
    | "wait-but"
    | "stat-shock"
    | "story-cold-open"
    | "contrarian-claim";
  /** Predicted retention lift vs baseline, in percent. Mock for now. */
  predictedLiftPct: number;
};

export type ThumbnailConcept = {
  id: string;
  composition: string;     // e.g. "Split-frame: subject left, headline right"
  copyLine: string;        // The headline text overlay
  paletteHint: string;     // "cyan/violet with grain"
  mood: "kinetic" | "thoughtful" | "controversial" | "intimate";
};

export type ContentRow = {
  id: string;
  title: string;
  publishedDaysAgo: number;
  views: number;
  /** Click-through rate from impression. */
  ctrPct: number;
  /** Average view duration as % of total runtime. */
  retentionPct: number;
  /** Sum of likes + comments + shares, normalized 0-100. */
  engagement: number;
};

export type StudioSnapshot = {
  drafts: ScriptDraft[];
  /** A few previously-generated hook batches the user can re-open. */
  hookHistory: Array<{
    id: string;
    topic: string;
    createdAgoMin: number;
    variants: HookVariant[];
  }>;
  thumbnailHistory: Array<{
    id: string;
    concept: string;
    createdAgoMin: number;
    ideas: ThumbnailConcept[];
  }>;
  content: ContentRow[];
};

export async function getStudioSnapshot(): Promise<StudioSnapshot> {
  return SNAPSHOT;
}

// ---------------------------------------------------------------------------
// Your studio content. Add script drafts, hook batches, thumbnail concepts,
// and published content rows here as you create them. Phase 6 will generate
// these via AI — for now, fill them in manually.
// ---------------------------------------------------------------------------

const SNAPSHOT: StudioSnapshot = {
  drafts: [],
  hookHistory: [],
  thumbnailHistory: [],
  content: [],
};

export const HOOK_STYLE_LABEL: Record<HookVariant["style"], string> = {
  "question-rebuttal": "Question · rebuttal",
  "wait-but": "Wait, but…",
  "stat-shock": "Stat shock",
  "story-cold-open": "Story cold-open",
  "contrarian-claim": "Contrarian claim",
};

export const MOOD_ACCENT: Record<ThumbnailConcept["mood"], "cyan" | "magenta" | "amber" | "violet"> = {
  kinetic: "cyan",
  thoughtful: "violet",
  controversial: "magenta",
  intimate: "amber",
};
