/**
 * Second-brain data layer. Stubbed mock corpus of notes + tags + links;
 * shape is final, body becomes a real query in Phase 6 when persistence
 * (Neon or otherwise) lands.
 *
 * Naming convention here is deliberate:
 *   - `Note` is the unit of capture
 *   - `Link` is a directed edge between notes (source → target)
 *   - Tags are flat strings; we don't model a tag entity because tags get
 *     created/renamed faster than we'd want to migrate
 */

export type Note = {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  /** ISO timestamp of creation. */
  createdAt: string;
  /** Word count — drives the node radius in the graph viz. */
  wordCount: number;
};

export type Link = {
  source: string;
  target: string;
  /** Display only — bidirectional pairs render twice, that's fine. */
  weight?: number;
};

export type BrainSnapshot = {
  notes: Note[];
  links: Link[];
  /** Distinct tags in alphabetical order — convenient for filter UIs. */
  tags: string[];
};

/**
 * Tag → accent color. We re-use the existing signal palette + violet so the
 * graph reads with the same visual language as the rest of the app.
 */
export const TAG_ACCENT: Record<string, "cyan" | "magenta" | "amber" | "violet"> = {
  systems:     "cyan",
  ai:          "magenta",
  product:     "amber",
  philosophy:  "violet",
  writing:     "magenta",
  habits:      "amber",
  career:      "cyan",
  research:    "violet",
};

export const TAG_HEX: Record<NonNullable<typeof TAG_ACCENT[string]>, string> = {
  cyan: "#5ef0ff",
  magenta: "#ff5ed4",
  amber: "#ffb547",
  violet: "#a78bff",
};

/** Default for unmapped tags. */
const DEFAULT_ACCENT = "cyan" as const;
export function getTagAccent(tag: string | undefined) {
  if (!tag) return DEFAULT_ACCENT;
  return TAG_ACCENT[tag] ?? DEFAULT_ACCENT;
}

/**
 * Read the user's brain snapshot. STUBBED — see header for migration plan.
 */
export async function getBrainSnapshot(): Promise<BrainSnapshot> {
  const tags = Array.from(
    new Set(MOCK_NOTES.flatMap((n) => n.tags))
  ).sort();
  return { notes: MOCK_NOTES, links: MOCK_LINKS, tags };
}

// ---------------------------------------------------------------------------
// Mock corpus. Hand-tuned so the graph has both dense clusters and bridges,
// and the timeline shows a believable cadence (some today, some this week,
// some older).
// ---------------------------------------------------------------------------

const NOW = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

function ago(ms: number): string {
  return new Date(NOW - ms).toISOString();
}

const MOCK_NOTES: Note[] = [
  // === Today ===
  { id: "n1",  title: "Failure modes share between distributed systems and orgs", excerpt: "Both fail at the seams — interfaces, retries, escalation paths.", tags: ["systems", "philosophy"], createdAt: ago(35 * MIN),  wordCount: 420 },
  { id: "n2",  title: "Quorums as a metaphor for team decision-making",          excerpt: "How many people actually need to weigh in before a call is final?", tags: ["systems", "product"],     createdAt: ago(2 * HOUR),  wordCount: 280 },
  { id: "n3",  title: "Daily review: what's been generative vs. extractive",     excerpt: "Two buckets: things that compound, things that consume.",            tags: ["habits"],                  createdAt: ago(4 * HOUR),  wordCount: 180 },
  { id: "n4",  title: "Cold open as the highest-leverage 200ms",                 excerpt: "If they don't lean in by frame 6, the rest doesn't matter.",         tags: ["writing", "product"],      createdAt: ago(6 * HOUR),  wordCount: 350 },

  // === This week ===
  { id: "n5",  title: "Vector clocks click when you stop thinking time",         excerpt: "Causality is the actual primitive; wall time is a fragile shortcut.", tags: ["systems"],                createdAt: ago(1.2 * DAY), wordCount: 510 },
  { id: "n6",  title: "Memory manager interface for the AI workspace",           excerpt: "Three layers: episodic, semantic, procedural. Phase 6 design.",       tags: ["ai", "systems"],          createdAt: ago(1.8 * DAY), wordCount: 620 },
  { id: "n7",  title: "When the prompt is the architecture",                     excerpt: "Some products are essentially a prompt tree wearing UI as a costume.", tags: ["ai", "product"],         createdAt: ago(2.1 * DAY), wordCount: 410 },
  { id: "n8",  title: "Hooks library — what survived first 50 reviews",          excerpt: "Question-rebuttal hooks beat statement-claim hooks 2.3x in retention.", tags: ["writing"],               createdAt: ago(2.5 * DAY), wordCount: 290 },
  { id: "n9",  title: "Spaced repetition under-rates re-deriving",               excerpt: "Re-derivation > recall when the goal is to *use* the idea, not name it.", tags: ["habits", "research"],   createdAt: ago(3 * DAY),   wordCount: 330 },
  { id: "n10", title: "What I look for in a senior engineer interview",          excerpt: "Taste. Specifically: noticing tradeoffs they weren't asked about.",   tags: ["career"],                  createdAt: ago(3.4 * DAY), wordCount: 470 },
  { id: "n11", title: "CAP isn't really a triangle",                             excerpt: "It's a runtime decision under partition. The other two are myths.",   tags: ["systems"],                createdAt: ago(4 * DAY),   wordCount: 380 },
  { id: "n12", title: "Why I'm wary of agentic systems that don't memoize",       excerpt: "Replaying a 12-step chain to recover one mistake is the kind of bug that kills trust.", tags: ["ai", "systems"], createdAt: ago(5 * DAY), wordCount: 540 },

  // === Earlier ===
  { id: "n13", title: "Reading note: 'How to take smart notes' is mostly about Zettelkasten", excerpt: "Useful pattern: write atomic notes, link liberally, reuse across writing.", tags: ["writing", "research"], createdAt: ago(8 * DAY), wordCount: 220 },
  { id: "n14", title: "Idea: a feed that scores items by 'derivative novelty'",   excerpt: "Not new info — but new structure on existing info. Hard to game.",    tags: ["product", "research"],     createdAt: ago(10 * DAY),  wordCount: 410 },
  { id: "n15", title: "Energy regulation > time management",                      excerpt: "Time is the budget; energy is the price tag. Most people misprice.",   tags: ["habits", "philosophy"],   createdAt: ago(12 * DAY),  wordCount: 360 },
  { id: "n16", title: "Hooks that worked: 'wait, but…' as a structural device",  excerpt: "Sets up a contradiction the audience hasn't articulated. They lean in.", tags: ["writing"],                createdAt: ago(14 * DAY),  wordCount: 240 },
  { id: "n17", title: "Note-taking is mostly about retrieval, not capture",       excerpt: "Easy to write. Hard to find later. The system is the indexing.",     tags: ["habits", "research"],     createdAt: ago(18 * DAY),  wordCount: 290 },
  { id: "n18", title: "Career arc — generalist for 5 years, specialist for 10",   excerpt: "The composition matters more than either pure mode.",                 tags: ["career", "philosophy"],   createdAt: ago(22 * DAY),  wordCount: 510 },
  { id: "n19", title: "Bloom filters: false positives are a feature",             excerpt: "Trade exactness for space. Cache-warm paths love this.",               tags: ["systems"],                createdAt: ago(28 * DAY),  wordCount: 310 },
  { id: "n20", title: "What 'AI-native' actually means",                          excerpt: "Not 'has an LLM call.' Means the UX assumes a thinking partner.",     tags: ["ai", "product", "philosophy"], createdAt: ago(35 * DAY), wordCount: 600 },
  { id: "n21", title: "Stopped journaling on paper — switched to capture-everywhere", excerpt: "Capture beats curation when the bar to write is the bottleneck.", tags: ["habits", "writing"],     createdAt: ago(45 * DAY),  wordCount: 200 },
  { id: "n22", title: "Distributed consensus reading list",                       excerpt: "Raft, Paxos Made Live, Spanner — in that order.",                    tags: ["systems", "research"],    createdAt: ago(60 * DAY),  wordCount: 280 },
  { id: "n23", title: "A theory of taste",                                        excerpt: "Taste = compressed exposure × care. You can shortcut one, not both.", tags: ["philosophy"],            createdAt: ago(72 * DAY),  wordCount: 460 },
  { id: "n24", title: "Lesson: pre-mortems beat retrospectives",                  excerpt: "Imagined failure is cheaper than real failure. Cheaper still: written.", tags: ["product", "habits"],    createdAt: ago(90 * DAY),  wordCount: 340 },
];

const MOCK_LINKS: Link[] = [
  // Systems cluster
  ["n1", "n2"], ["n1", "n5"], ["n5", "n6"], ["n5", "n11"], ["n11", "n22"],
  ["n6", "n12"], ["n6", "n7"], ["n12", "n11"], ["n19", "n22"], ["n2", "n5"],
  // AI cluster
  ["n6", "n20"], ["n7", "n20"], ["n7", "n14"], ["n12", "n20"],
  // Writing cluster
  ["n4", "n8"], ["n8", "n16"], ["n13", "n16"], ["n13", "n17"], ["n21", "n13"],
  ["n4", "n16"],
  // Habits cluster
  ["n3", "n9"], ["n3", "n15"], ["n9", "n17"], ["n15", "n24"], ["n21", "n3"],
  // Cross-cluster bridges (the interesting ones)
  ["n1", "n23"], ["n20", "n23"], ["n14", "n8"], ["n18", "n10"], ["n6", "n14"],
  ["n12", "n24"], ["n7", "n2"], ["n9", "n22"],
].map(([source, target]) => ({ source, target }));
