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
 * Read the user's brain snapshot. Returns live data — start capturing notes
 * via the journal to populate the graph. Phase 6 wires this to NeonDB.
 */
export async function getBrainSnapshot(): Promise<BrainSnapshot> {
  const tags = Array.from(
    new Set(NOTES.flatMap((n) => n.tags))
  ).sort();
  return { notes: NOTES, links: LINKS, tags };
}

// ---------------------------------------------------------------------------
// Your notes. Add entries here as you capture ideas — the graph and timeline
// update automatically. Each note needs a unique id, title, excerpt, tags
// (use existing TAG_ACCENT keys or invent new ones), createdAt (ISO string),
// and an approximate wordCount.
// ---------------------------------------------------------------------------

export const NOTES: Note[] = [];

export const LINKS: Link[] = [];
