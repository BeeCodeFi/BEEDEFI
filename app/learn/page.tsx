import { Flame, BookOpen, Clock, Calendar, ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import {
  BEECODEFI_URL,
  getLearningSnapshot,
  type LearningActivity,
  type ReviewItem,
} from "@/lib/beecodefi";

/**
 * Surface over the user's BeeCodeFi learning state. Server component — the
 * snapshot fetch is awaited at render time, so the page ships HTML with real
 * (currently mocked) values rather than client-side hydration churn.
 *
 * When BeeCodeFi migrates to NeonDB, this page doesn't change at all; only
 * lib/beecodefi.ts gets a real query body.
 */
export default async function LearnPage() {
  const snapshot = await getLearningSnapshot();

  // Recent activity uses the same renderer as the agent dashboard, so we map
  // BeeCodeFi's typed events into the generic activity shape.
  const activityForFeed = snapshot.recentActivity.map(toActivityItem);

  return (
    <div className="relative min-h-screen px-8 lg:px-16 pt-12 pb-32">
      {/* HEADER */}
      <header className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-signal-amber mb-2">
            Learning · powered by BeeCodeFi
          </p>
          <h1 className="font-display text-display-lg font-light tracking-tight text-ink-1">
            Continue <span className="text-signal-grad">learning</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ink-2 font-body leading-relaxed">
            Your active path, streak, and what&rsquo;s due. The full coursework
            and review flow lives in BeeCodeFi.
          </p>
        </div>

        <a
          href={BEECODEFI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-signal-amber/10 border border-signal-amber/40 hover:bg-signal-amber/20 hover:border-signal-amber transition-colors shadow-glow-amber"
        >
          <span className="text-xs font-mono uppercase tracking-wider text-signal-amber">
            Open BeeCodeFi
          </span>
          <ExternalLink
            className="w-3.5 h-3.5 text-signal-amber group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
            strokeWidth={2}
          />
        </a>
      </header>

      {/* CURRENT PATH — big hero card */}
      <section className="mb-6">
        {snapshot.currentPath ? (
          <GlassPanel edge className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
              <ProgressRing
                value={snapshot.currentPath.progress}
                accent="amber"
                size={120}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3 mb-2">
                  Current path
                </p>
                <h2 className="font-display text-2xl font-light tracking-tight text-ink-1 mb-3">
                  {snapshot.currentPath.title}
                </h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-ink-2">
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-ink-3" strokeWidth={1.5} />
                    <span className="font-mono tabular-nums">
                      {snapshot.currentPath.completedLessons} / {snapshot.currentPath.totalLessons}
                    </span>
                    <span className="text-ink-3">lessons</span>
                  </span>
                  {snapshot.currentPath.etaMinutes !== null && (
                    <span className="inline-flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-ink-3" strokeWidth={1.5} />
                      <span className="font-mono tabular-nums">{snapshot.currentPath.etaMinutes}m</span>
                      <span className="text-ink-3">to finish</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Streak — pinned right on desktop, wraps below on mobile */}
              <div className="flex items-center gap-3 md:border-l md:border-edge md:pl-8">
                <Flame
                  className={
                    snapshot.studiedToday
                      ? "w-7 h-7 text-signal-amber drop-shadow-[0_0_8px_rgba(255,181,71,0.7)]"
                      : "w-7 h-7 text-ink-3"
                  }
                  strokeWidth={1.5}
                />
                <div>
                  <p className="font-display font-light text-3xl tabular-nums text-ink-1">
                    {snapshot.streakDays}
                  </p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
                    day streak
                  </p>
                </div>
              </div>
            </div>
          </GlassPanel>
        ) : (
          <GlassPanel edge className="p-8 text-center">
            <p className="text-sm text-ink-2 mb-4">
              No active learning path yet.
            </p>
            <a
              href={BEECODEFI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono uppercase tracking-wider text-signal-amber hover:text-signal-amber/80"
            >
              Start one in BeeCodeFi →
            </a>
          </GlassPanel>
        )}
      </section>

      {/* TWO-COLUMN: Activity + Reviews */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card accent="amber" interactive={false} className="flex flex-col gap-4">
          <CardHeader className="mb-0">
            <CardTitle>Recent activity</CardTitle>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
              {snapshot.recentActivity.length} events
            </span>
          </CardHeader>
          <ActivityFeed items={activityForFeed} />
        </Card>

        <Card accent="amber" interactive={false} className="flex flex-col gap-4">
          <CardHeader className="mb-0">
            <CardTitle>Spaced-repetition queue</CardTitle>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
              {snapshot.upcomingReviews.length} due
            </span>
          </CardHeader>
          <ul className="flex flex-col divide-y divide-edge">
            {snapshot.upcomingReviews.map((r) => (
              <ReviewRow key={r.id} item={r} />
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

function ReviewRow({ item }: { item: ReviewItem }) {
  const overdue = item.dueInMinutes < 0;
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Calendar
        className={
          overdue
            ? "w-3.5 h-3.5 text-signal-amber shrink-0"
            : "w-3.5 h-3.5 text-ink-3 shrink-0"
        }
        strokeWidth={1.5}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-ink-1 truncate">{item.topic}</p>
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
          {item.deck}
        </p>
      </div>
      <span
        className={
          overdue
            ? "text-[11px] font-mono tabular-nums text-signal-amber shrink-0"
            : "text-[11px] font-mono tabular-nums text-ink-2 shrink-0"
        }
      >
        {formatDue(item.dueInMinutes)}
      </span>
    </li>
  );
}

function toActivityItem(a: LearningActivity) {
  return {
    ago: a.ago,
    text: a.text,
    tone: a.kind === "milestone" ? ("alert" as const) : ("ok" as const),
  };
}

function formatDue(minutes: number): string {
  if (minutes < 0) return `${Math.abs(minutes)}m late`;
  if (minutes < 60) return `in ${minutes}m`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `in ${h}h`;
  return `in ${Math.floor(h / 24)}d`;
}
