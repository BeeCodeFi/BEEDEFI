import { NextResponse } from "next/server";

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

const BEECODEFI = "https://beecodefi-edu.vercel.app";

/** Simple number extractor: finds the first integer in a string. */
function firstInt(s: string): number {
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function scrapePage(path: string): Promise<string> {
  const res = await fetch(`${BEECODEFI}${path}`, { next: { revalidate: 3600 } });
  if (!res.ok) return "";
  return res.text();
}

async function fetchStats(): Promise<BeeCodeFiStats> {
  const [tutorialsHtml, quizHtml, coursesHtml] = await Promise.all([
    scrapePage("/tutorials"),
    scrapePage("/quiz"),
    scrapePage("/courses"),
  ]);

  // --- Tutorials page ---
  // Looks for patterns like "35 Lessons" and "3 Courses"
  const totalLessonsMatch = tutorialsHtml.match(/(\d+)\s*Lessons/i);
  const totalLessons = totalLessonsMatch ? parseInt(totalLessonsMatch[1], 10) : 0;

  // Extract individual tutorial tracks: "11 lessons" inside each card
  const tutorialBlocks = tutorialsHtml.match(/(\d+)\s*lessons\s*\d+\s*min\s*([\w\s&]+?)(?:Learn|Style|Add)/gi) ?? [];
  const tutorials: { name: string; lessons: number }[] = [];

  // Simpler: find patterns like "11 lessons 215 min HTML Fundamentals"
  const trackPattern = /(\d+)\s*lessons\s+\d+\s*min\s+([\w\s]+?)(?=Learn|Style|Add|<)/gi;
  let trackMatch: RegExpExecArray | null;
  while ((trackMatch = trackPattern.exec(tutorialsHtml)) !== null) {
    tutorials.push({ name: trackMatch[2].trim(), lessons: parseInt(trackMatch[1], 10) });
  }

  // Fallback: count tutorial sections from known structure
  const tutorialCount = tutorials.length || (tutorialsHtml.match(/Start Learning/gi)?.length ?? 0);

  // --- Quiz page ---
  const totalQuizzesMatch = quizHtml.match(/(\d+)\s*(?:<[^>]*>)*\s*Quizzes/i);
  const totalQuizzes = totalQuizzesMatch ? parseInt(totalQuizzesMatch[1], 10) : 0;

  const totalQuestionsMatch = quizHtml.match(/(\d+)\s*(?:<[^>]*>)*\s*Questions/i);
  const totalQuestions = totalQuestionsMatch ? parseInt(totalQuestionsMatch[1], 10) : 0;

  // Overall quiz completion: "X/Y Completed"
  const quizCompletedMatch = quizHtml.match(/(\d+)\s*\/\s*\d+\s*(?:<[^>]*>)*\s*Completed/i);
  const completedQuizzes = quizCompletedMatch ? parseInt(quizCompletedMatch[1], 10) : 0;

  // Extract quiz categories: "X/Y completed" per category
  const quizCategories: { name: string; topics: number; completed: number }[] = [];
  const categoryPattern = /(HTML\s*Fundamentals|CSS\s*Mastery|JavaScript\s*Essentials)[\s\S]*?(\d+)\s*topics[\s\S]*?(\d+)\s*\/\s*\d+\s*completed/gi;
  let catMatch: RegExpExecArray | null;
  while ((catMatch = categoryPattern.exec(quizHtml)) !== null) {
    quizCategories.push({
      name: catMatch[1].trim(),
      topics: parseInt(catMatch[2], 10),
      completed: parseInt(catMatch[3], 10),
    });
  }

  // --- Courses page ---
  const totalCoursesMatch = coursesHtml.match(/(\d+)\s*Courses/i);
  const totalCourses = totalCoursesMatch ? parseInt(totalCoursesMatch[1], 10) : 0;

  const totalVideosMatch = coursesHtml.match(/(\d+)\s*Videos/i);
  const totalCourseVideos = totalVideosMatch ? parseInt(totalVideosMatch[1], 10) : 0;

  // Completed tutorials = count tutorial tracks that are fully done
  // For now, we can't determine per-tutorial completion from the page,
  // so we count course completion from courses page
  const courseCompletedMatch = coursesHtml.match(/Mark(?:ed)?\s+as\s+Complete[d]?/gi);
  const completedCourses = coursesHtml.includes('Completed') ? (coursesHtml.match(/Completed/gi)?.length ?? 0) : 0;

  // Count tutorial tracks completed — look for completion indicators
  const tutCompletedPattern = /(\d+)\s*\/\s*\d+\s*lessons?\s*completed/gi;
  let tutCompletedCount = 0;
  let tutMatch: RegExpExecArray | null;
  while ((tutMatch = tutCompletedPattern.exec(tutorialsHtml)) !== null) {
    const done = parseInt(tutMatch[1], 10);
    if (done > 0) tutCompletedCount++;
  }

  return {
    totalCourses: totalCourses || 1,
    totalCourseVideos: totalCourseVideos || 10,
    totalTutorials: tutorialCount || 3,
    totalLessons: totalLessons || 35,
    totalQuizzes: totalQuizzes || 18,
    totalQuestions: totalQuestions || 90,
    completedQuizzes,
    completedCourses,
    completedTutorials: tutCompletedCount,
    tutorials,
    quizCategories,
    fetchedAt: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const stats = await fetchStats();
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch {
    // Fallback to known defaults if scrape fails
    return NextResponse.json(
      {
        totalCourses: 1,
        totalCourseVideos: 10,
        totalTutorials: 3,
        totalLessons: 35,
        totalQuizzes: 18,
        totalQuestions: 90,
        completedQuizzes: 0,
        completedCourses: 0,
        completedTutorials: 0,
        tutorials: [],
        quizCategories: [],
        fetchedAt: new Date().toISOString(),
      } satisfies BeeCodeFiStats,
      { status: 200 }
    );
  }
}
