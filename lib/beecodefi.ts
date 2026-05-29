/**
 * BeeCodeFi integration — read-side data layer.
 *
 * BeeCodeFi is a separately-deployed learning app (https://beecodefi-edu.vercel.app/)
 * that owns the canonical learning state for this user. BEEDEFI's /learn route is
 * a surface over that data + a deep-link into the real app.
 *
 * BeeCodeFi uses NeonDB (Postgres). To wire direct reads:
 *   1. Add `BEECODEFI_DATABASE_URL` to .env pointing at the Neon read replica
 *   2. Add a postgres driver (recommended: `@neondatabase/serverless`)
 *   3. Replace the scraping approach with real SQL queries
 *   4. Keep the shape of LearningSnapshot intact — components consume it as-is
 */

export const BEECODEFI_URL = "https://beecodefi-edu.vercel.app/";

/**
 * The user's identifier inside BeeCodeFi. Single-user app for now — when this
 * is wired for real, swap to reading from session / env / auth context.
 */
export const BEECODEFI_USER_ID = "kumaryursh@gmail.com";

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
  /** Completion counters */
  coursesCompleted: number;
  quizzesCompleted: number;
  tutorialsCompleted: number;
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
// BeeCodeFi platform content — fetched dynamically via /api/beecodefi.
// The API route scrapes the live BeeCodeFi pages and caches for 1 hour.
// Fallback values below are used if the fetch fails.
// ---------------------------------------------------------------------------

export type BeeCodeFiStats = {
  totalCourses: number;
  totalCourseVideos: number;
  totalTutorials: number;
  totalLessons: number;
  totalQuizzes: number;
  totalQuestions: number;
  /** Completion counts scraped from BeeCodeFi pages */
  completedQuizzes: number;
  completedCourses: number;
  completedTutorials: number;
  tutorials: { name: string; lessons: number }[];
  quizCategories: { name: string; topics: number; completed: number }[];
  fetchedAt: string;
};

export const BEECODEFI_STATS_FALLBACK: BeeCodeFiStats = {
  totalTutorials: 3,
  totalLessons: 35,
  totalQuizzes: 18,
  totalQuestions: 90,
  totalCourses: 1,
  totalCourseVideos: 10,
  completedQuizzes: 0,
  completedCourses: 0,
  completedTutorials: 0,
  tutorials: [],
  quizCategories: [],
  fetchedAt: "",
};

const SNAPSHOT: LearningSnapshot = {
  currentPath: {
    id: "web-dev-fundamentals",
    title: "Web Development Fundamentals",
    progress: 0,
    totalLessons: 35,
    completedLessons: 0,
    etaMinutes: 835,
  },
  streakDays: 0,
  studiedToday: false,
  recentActivity: [],
  upcomingReviews: [
    { id: "quiz-html", topic: "HTML Fundamentals", dueInMinutes: 0, deck: "HTML · 6 topics" },
    { id: "quiz-css", topic: "CSS Mastery", dueInMinutes: 0, deck: "CSS · 6 topics" },
    { id: "quiz-js", topic: "JavaScript Essentials", dueInMinutes: 0, deck: "JS · 6 topics" },
  ],
  coursesCompleted: 0,
  quizzesCompleted: 0,
  tutorialsCompleted: 0,
  lastSyncedAt: null,
};
