import { Briefcase, ArrowUpRight, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { cn } from "@/lib/cn";
import {
  getCareerSnapshot,
  STAGE_LABELS,
  STAGE_ACCENT,
  PREP_KIND_LABEL,
  type Application,
  type ApplicationStage,
  type PrepItem,
} from "@/lib/career";

/**
 * /career — application pipeline + interview prep tracker. Server component
 * fetches the (mocked) snapshot and renders three sections:
 *
 *   1. Stat strip — response rate, active leads, avg days to reply
 *   2. Pipeline   — kanban-ish column per stage
 *   3. Prep grid  — interview prep items with confidence rings
 */

const STAGE_ORDER: ApplicationStage[] = ["applied", "phone", "onsite", "offer", "rejected"];

const ACCENT_TEXT: Record<"cyan" | "magenta" | "amber" | "violet" | "ink", string> = {
  cyan: "text-signal-cyan",
  magenta: "text-signal-magenta",
  amber: "text-signal-amber",
  violet: "text-signal-violet",
  ink: "text-ink-2",
};

const ACCENT_BORDER: Record<"cyan" | "magenta" | "amber" | "violet" | "ink", string> = {
  cyan: "border-signal-cyan/30",
  magenta: "border-signal-magenta/30",
  amber: "border-signal-amber/30",
  violet: "border-signal-violet/30",
  ink: "border-edge",
};

export default async function CareerPage() {
  const snap = await getCareerSnapshot();
  const grouped = STAGE_ORDER.map((s) => ({
    stage: s,
    items: snap.applications.filter((a) => a.stage === s),
  }));

  return (
    <div className="relative min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-10 lg:pt-12 pb-32">
      <header className="flex flex-wrap items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-signal-cyan mb-2">
            Phase 05 · Career
          </p>
          <h1 className="font-display text-display-lg font-light tracking-tight text-ink-1">
            Your <span className="text-signal-grad">pipeline</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ink-2 font-body leading-relaxed">
            What you&rsquo;re applying to, where it stands, and where you&rsquo;re
            spending prep cycles.
          </p>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <Stat label="Active leads"  value={`${snap.stats.activeLeads}`} accent="cyan" />
          <Stat label="Response rate" value={`${snap.stats.responseRatePct}%`} accent="magenta" />
          <Stat label="Avg reply"     value={`${snap.stats.avgDaysToReply}d`} accent="amber" />
        </div>
      </header>

      {/* PIPELINE */}
      <section className="mb-12">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-xl font-light tracking-tight text-ink-1">
            Pipeline
          </h2>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
            {snap.applications.length} total
          </span>
        </div>

        {/* Mobile: horizontal scroll so the 5 stages stay legible side-by-side
            rather than collapsing into a single column. Each card-column gets
            a fixed min-width on small screens; on lg+ the layout becomes a
            balanced 5-column grid. */}
        <div className="scroll-touch -mx-4 sm:-mx-6 md:-mx-8 lg:mx-0 overflow-x-auto lg:overflow-visible">
          <div className="flex lg:grid lg:grid-cols-5 gap-3 px-4 sm:px-6 md:px-8 lg:px-0 snap-x snap-mandatory lg:snap-none">
          {grouped.map(({ stage, items }) => (
            <div key={stage} className="flex flex-col shrink-0 w-[80vw] sm:w-[42vw] md:w-[28vw] lg:w-auto snap-start">
              <div className={cn(
                "flex items-center justify-between px-3 py-2 rounded-t-lg border-b",
                ACCENT_BORDER[STAGE_ACCENT[stage]],
                "bg-white/[0.02]"
              )}>
                <span className={cn(
                  "text-[10px] font-mono uppercase tracking-[0.18em]",
                  ACCENT_TEXT[STAGE_ACCENT[stage]]
                )}>
                  {STAGE_LABELS[stage]}
                </span>
                <span className="text-[10px] font-mono tabular-nums text-ink-3">
                  {items.length}
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-2 min-h-[8rem]">
                {items.length === 0 ? (
                  <p className="text-[11px] font-mono uppercase tracking-wider text-ink-4 px-3 py-4">
                    Empty
                  </p>
                ) : (
                  items.map((app) => <AppRow key={app.id} app={app} />)
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* PREP */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-xl font-light tracking-tight text-ink-1">
            Prep
          </h2>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
            {snap.prep.length} topics in rotation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {snap.prep.map((p) => (
            <PrepCard key={p.id} item={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AppRow({ app }: { app: Application }) {
  const accent = STAGE_ACCENT[app.stage];
  return (
    <GlassPanel className="p-3 group cursor-pointer hover:border-edge-strong transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-display text-ink-1 truncate">{app.company}</p>
          <p className="text-[11px] text-ink-2 mt-0.5 leading-snug line-clamp-2">
            {app.role}
          </p>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-ink-3 group-hover:text-ink-1 transition-colors shrink-0" strokeWidth={1.5} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-ink-3">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          <span className="tabular-nums">{app.daysIdle}d idle</span>
        </span>
        {app.bandHint && (
          <span className={cn("text-[10px] font-mono tabular-nums", ACCENT_TEXT[accent])}>
            {app.bandHint}
          </span>
        )}
      </div>
    </GlassPanel>
  );
}

function PrepCard({ item }: { item: PrepItem }) {
  const accent =
    item.kind === "system-design" ? "cyan" :
    item.kind === "behavioral"    ? "magenta" :
    item.kind === "algorithms"    ? "amber" : "violet";
  return (
    <Card accent={accent} interactive={false}>
      <CardHeader>
        <div>
          <p className={cn("text-[10px] font-mono uppercase tracking-wider mb-1", ACCENT_TEXT[accent])}>
            {PREP_KIND_LABEL[item.kind]}
          </p>
          <CardTitle className="normal-case font-display tracking-normal text-ink-1 text-[15px] font-light">
            {item.topic}
          </CardTitle>
        </div>
        <ProgressRing value={item.confidence} accent={accent} size={48} />
      </CardHeader>
      <p className="text-[11px] font-mono tabular-nums text-ink-3">
        confidence · {item.confidence}%
      </p>
    </Card>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "cyan" | "magenta" | "amber" }) {
  return (
    <div className="flex flex-col items-end">
      <span className={cn("font-display font-light text-2xl tabular-nums", ACCENT_TEXT[accent])}>
        {value}
      </span>
      <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
        {label}
      </span>
    </div>
  );
}
