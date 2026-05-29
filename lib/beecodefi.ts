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
 * STUBBED — returns live data from the constants below. See module header
 * for the NeonDB migration plan. Update the fields below as your learning
 * progresses; Phase 6 will sync this automatically.
 */
export async function getLearningSnapshot(
  _userId: string = BEECODEFI_USER_ID
): Promise<LearningSnapshot> {
  return SNAPSHOT;
}

// ---------------------------------------------------------------------------
// Your learning state. Update currentPath as you progress through a course,
// bump streakDays each day you study, and add to recentActivity and
// upcomingReviews as they happen.
// ---------------------------------------------------------------------------

const SNAPSHOT: LearningSnapshot = {
  currentPath: null,
  streakDays: 0,
  studiedToday: false,
  recentActivity: [],
  upcomingReviews: [],
  lastSyncedAt: null,
};
