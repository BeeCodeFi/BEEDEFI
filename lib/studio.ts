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
  return MOCK_SNAPSHOT;
}

const MOCK_SNAPSHOT: StudioSnapshot = {
  drafts: [
    { id: "d1", title: "Q2 content strategy: derivative novelty",         preview: "There's a kind of newness that doesn't require new information. It just needs new structure on the existing stuff…", durationSec: 480, createdAgoMin: 28 },
    { id: "d2", title: "Why I stopped tracking time (and started tracking energy)", preview: "Time tracking lies. It tells you what you spent without telling you what it cost…", durationSec: 360, createdAgoMin: 240 },
    { id: "d3", title: "Distributed systems lessons for solo founders",   preview: "Both fail at the seams. The interfaces between systems — or between people — are where the cracks form…", durationSec: 720, createdAgoMin: 1340 },
  ],
  hookHistory: [
    {
      id: "h1",
      topic: "Why everyone's wrong about productivity systems",
      createdAgoMin: 14,
      variants: [
        { id: "h1v1", text: "If your todo list survived the weekend, it was never the list you needed.",  style: "contrarian-claim", predictedLiftPct: 31 },
        { id: "h1v2", text: "Productivity isn't a problem with your system. It's a problem with the question.", style: "wait-but",      predictedLiftPct: 27 },
        { id: "h1v3", text: "97% of productivity apps die within 60 days. Here's the one that doesn't.", style: "stat-shock",      predictedLiftPct: 19 },
        { id: "h1v4", text: "I deleted every productivity app on a Tuesday. By Friday I'd built more than the previous quarter.", style: "story-cold-open", predictedLiftPct: 24 },
        { id: "h1v5", text: "What if the problem isn't that you're disorganized — it's that you're too organized?", style: "question-rebuttal", predictedLiftPct: 22 },
      ],
    },
  ],
  thumbnailHistory: [
    {
      id: "t1",
      concept: "Distributed systems for solo founders",
      createdAgoMin: 88,
      ideas: [
        { id: "t1i1", composition: "Split-frame: solo founder silhouette left, server diagram right",   copyLine: "THE SYSTEM IS THE TEAM",        paletteHint: "cyan + violet, mild grain",    mood: "thoughtful"    },
        { id: "t1i2", composition: "Tight portrait, eyes off-camera, headline blocks bottom-right",     copyLine: "I RAN IT ALONE",                paletteHint: "amber-on-deep-bg",            mood: "intimate"      },
        { id: "t1i3", composition: "Two diverging arrows — one labeled 'team', one labeled 'system'",   copyLine: "PICK BOTH",                     paletteHint: "magenta on black",            mood: "controversial" },
        { id: "t1i4", composition: "Top-down workspace overhead, one person highlighted in cyan",       copyLine: "ONE PERSON. SEVEN AGENTS.",     paletteHint: "monochrome + single cyan accent", mood: "kinetic"    },
      ],
    },
  ],
  content: [
    { id: "c1", title: "The cold open as the highest-leverage 200ms",        publishedDaysAgo: 2,  views: 18_400,  ctrPct: 7.8, retentionPct: 62, engagement: 74 },
    { id: "c2", title: "Distributed systems lessons for solo founders",      publishedDaysAgo: 6,  views: 32_100,  ctrPct: 9.2, retentionPct: 58, engagement: 81 },
    { id: "c3", title: "Why I stopped tracking time",                        publishedDaysAgo: 12, views: 71_500,  ctrPct: 11.4, retentionPct: 69, engagement: 88 },
    { id: "c4", title: "What 'AI-native' actually means",                    publishedDaysAgo: 19, views: 24_900,  ctrPct: 6.5, retentionPct: 51, engagement: 62 },
    { id: "c5", title: "Hooks that work: 'wait, but…' as a structural device", publishedDaysAgo: 27, views: 41_200, ctrPct: 8.9, retentionPct: 64, engagement: 77 },
    { id: "c6", title: "A theory of taste",                                  publishedDaysAgo: 41, views: 95_300,  ctrPct: 12.1, retentionPct: 73, engagement: 92 },
  ],
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
