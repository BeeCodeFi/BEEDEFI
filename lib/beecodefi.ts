/**
 * BeeCodeFi integration — read-side data layer.
 *
 * BeeCodeFi is a separately-deployed learning app (https://beecodefi-edu.vercel.app/)
 * that owns the canonical learning state for this user. BEEDEFI's /learn route is
 * a surface over that data + a deep-link into the real app.
 *
 * Right now BeeCodeFi runs on SQLite, which doesn't play well with serverless
 * reads from another origin. Once it migrates to NeonDB, the body of
 * getLearningSnapshot() becomes a real query — the *signature* is final.
 *
 * When wiring this for real:
 *   1. Add `DATABASE_URL` to .env pointing at the Neon read replica
 *   2. Add a postgres driver (recommended: `@neondatabase/serverless`)
 *   3. Replace MOCK_SNAPSHOT with the query + mapping
 *   4. Keep the shape of LearningSnapshot intact — components consume it as-is
 */

export const BEECODEFI_URL = "https://beecodefi-edu.vercel.app/";

/**
 * The user's identifier inside BeeCodeFi. Single-user app for now — when this
 * is wired for real, swap to reading from session / env / auth context.
 */
export const BEECODEFI_USER_ID = "akumar@payliance.com";

export type LearningPath = {
  id: string;
  title: string;
  /** 0–100 */
  progress: number;
  totalLessons: number;
  completedLessons: number;
  /** Best-effort minutes-remaining estimate; null if unknown. */
  etaMinutes: number | null;
};

export type ReviewItem = {
  id: string;
  topic: string;
  /** Negative if the review is overdue. */
  dueInMinutes: number;
  /** Spaced-repetition deck the item belongs to. */
  deck: string;
};

export type LearningActivity = {
  /** Minutes since the event, for the same renderer used elsewhere. */
  ago: number;
  text: string;
  kind: "lesson" | "quiz" | "review" | "milestone";
};

export type LearningSnapshot = {
  currentPath: LearningPath | null;
  streakDays: number;
  /** Convenience flag — true if user has done anything today. */
  studiedToday: boolean;
  recentActivity: LearningActivity[];
  upcomingReviews: ReviewItem[];
  /** ISO string. null until first sync. */
  lastSyncedAt: string | null;
};

/**
 * Read the user's current learning snapshot from BeeCodeFi.
 *
 * STUBBED — returns mock data. See module header for the migration plan.
 */
export async function getLearningSnapshot(
  _userId: string = BEECODEFI_USER_ID
): Promise<LearningSnapshot> {
  return MOCK_SNAPSHOT;
}

const MOCK_SNAPSHOT: LearningSnapshot = {
  currentPath: {
    id: "ds-fundamentals",
    title: "Distributed Systems · Fundamentals",
    progress: 62,
    totalLessons: 24,
    completedLessons: 15,
    etaMinutes: 38,
  },
  streakDays: 23,
  studiedToday: true,
  recentActivity: [
    { ago: 18,  text: "Completed 'Consensus & Quorums' lesson",                kind: "lesson"    },
    { ago: 47,  text: "Reviewed 12 cards — 91% recall",                        kind: "review"    },
    { ago: 96,  text: "Passed 'CAP Theorem' quiz — 9/10",                      kind: "quiz"      },
    { ago: 240, text: "Started 'Distributed Systems · Fundamentals' path",     kind: "milestone" },
    { ago: 1440, text: "Wrapped 'Networking · Foundations' — 100%",             kind: "milestone" },
  ],
  upcomingReviews: [
    { id: "r1", topic: "Vector clocks",          dueInMinutes: -12, deck: "Distributed systems" },
    { id: "r2", topic: "Raft leader election",   dueInMinutes: 25,  deck: "Distributed systems" },
    { id: "r3", topic: "TCP slow start",         dueInMinutes: 180, deck: "Networking"          },
    { id: "r4", topic: "Bloom filters",          dueInMinutes: 240, deck: "Data structures"     },
    { id: "r5", topic: "Read-repair vs anti-entropy", dueInMinutes: 1380, deck: "Distributed systems" },
  ],
  lastSyncedAt: null,
};
