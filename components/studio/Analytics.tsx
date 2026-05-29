"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Eye, Clock, MousePointerClick, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { ContentRow } from "@/lib/studio";

type Props = {
  content: ContentRow[];
};

export function Analytics({ content }: Props) {
  const stats = aggregate(content);
  // Outliers — top-engagement piece and weakest retention (for the agent nudges).
  const topEngagement = [...content].sort((a, b) => b.engagement - a.engagement)[0];
  const weakestRetention = [...content].sort((a, b) => a.retentionPct - b.retentionPct)[0];

  if (content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-ink-4">
          No content data yet
        </p>
        <p className="text-[12px] text-ink-3 text-center max-w-xs leading-relaxed">
          Add published pieces to lib/studio.ts to see analytics here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* OVERVIEW STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile icon={Eye}                label="Total views"    value={fmtK(stats.views)}                    delta="+18%" tone="cyan"    />
        <StatTile icon={MousePointerClick}  label="Avg CTR"        value={`${stats.ctrAvg.toFixed(1)}%`}        delta="+0.9pt" tone="magenta" />
        <StatTile icon={Clock}              label="Avg retention" value={`${stats.retentionAvg.toFixed(0)}%`}  delta="+3pt"   tone="amber"   />
        <StatTile icon={Flame}              label="Top piece"      value={`${stats.topEngagement}`}             delta="lead"    tone="violet"  />
      </section>

      {/* CONTENT TABLE */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h3 className="font-display text-xl font-light tracking-tight text-ink-1">
            Per piece
          </h3>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
            {content.length} pieces · last 60 days
          </span>
        </div>

        <div className="rounded-xl border border-edge overflow-hidden">
          {/* Table scrolls horizontally on narrow viewports — the fixed column
              widths total ~560px, so anything below md would crush the title. */}
          <div className="scroll-touch overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Header row */}
              <div className="grid grid-cols-[1fr_80px_80px_120px_120px] gap-4 px-4 py-3 bg-white/[0.02] border-b border-edge">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">Title</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3 text-right">Views</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3 text-right">CTR</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3 text-right">Retention</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3 text-right">Engagement</span>
              </div>
              {content.map((row, i) => (
                <Row key={row.id} row={row} index={i} maxViews={stats.maxViews} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* OUTLIERS / NUDGES */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card accent="magenta" interactive={false}>
          <CardHeader>
            <CardTitle>Top performer</CardTitle>
            <span className="text-[10px] font-mono uppercase tracking-wider text-signal-magenta">
              Engagement {topEngagement?.engagement}
            </span>
          </CardHeader>
          <p className="text-[14px] font-display text-ink-1 leading-snug mb-2">
            {topEngagement?.title}
          </p>
          <p className="text-[12px] text-ink-2 leading-relaxed">
            Hook structure and pacing earning high engagement. Worth template-extracting — what about the cold open is doing the work?
          </p>
        </Card>

        <Card accent="amber" interactive={false}>
          <CardHeader>
            <CardTitle>Watch this</CardTitle>
            <span className="text-[10px] font-mono uppercase tracking-wider text-signal-amber">
              Retention {weakestRetention?.retentionPct}%
            </span>
          </CardHeader>
          <p className="text-[14px] font-display text-ink-1 leading-snug mb-2">
            {weakestRetention?.title}
          </p>
          <p className="text-[12px] text-ink-2 leading-relaxed">
            Retention dropped below threshold — usually a mid-piece dip. Consider whether the second-act transition is doing the work it needs to.
          </p>
        </Card>
      </section>
    </div>
  );
}

function Row({ row, index, maxViews }: { row: ContentRow; index: number; maxViews: number }) {
  const viewsBarPct = Math.max(8, Math.round((row.views / maxViews) * 100));
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-[1fr_80px_80px_120px_120px] gap-4 px-4 py-3 border-b border-edge last:border-b-0 hover:bg-white/[0.015] transition-colors"
    >
      <div className="min-w-0">
        <p className="text-[13px] text-ink-1 truncate">{row.title}</p>
        <p className="text-[10px] font-mono tabular-nums text-ink-3 mt-0.5">
          {row.publishedDaysAgo}d ago
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[13px] font-mono tabular-nums text-ink-1">
          {fmtK(row.views)}
        </span>
        <div className="mt-1 w-full h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-signal-cyan"
            style={{ width: `${viewsBarPct}%` }}
          />
        </div>
      </div>
      <span className={cn(
        "text-[13px] font-mono tabular-nums text-right self-center",
        row.ctrPct >= 9 ? "text-signal-cyan" : "text-ink-1"
      )}>
        {row.ctrPct.toFixed(1)}%
      </span>
      <BarCell value={row.retentionPct} accent={row.retentionPct < 55 ? "amber" : "cyan"} />
      <BarCell value={row.engagement}  accent={row.engagement >= 85 ? "magenta" : "ink"} />
    </motion.div>
  );
}

function BarCell({ value, accent }: { value: number; accent: "cyan" | "amber" | "magenta" | "ink" }) {
  const fill = {
    cyan: "bg-signal-cyan",
    amber: "bg-signal-amber",
    magenta: "bg-signal-magenta",
    ink: "bg-ink-3",
  }[accent];
  const text = {
    cyan: "text-signal-cyan",
    amber: "text-signal-amber",
    magenta: "text-signal-magenta",
    ink: "text-ink-1",
  }[accent];

  return (
    <div className="flex flex-col items-end justify-center">
      <span className={cn("text-[13px] font-mono tabular-nums", text)}>
        {value}{accent === "magenta" || accent === "ink" ? "" : "%"}
      </span>
      <div className="mt-1 w-full h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={cn("h-full", fill)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  delta: string;
  tone: "cyan" | "magenta" | "amber" | "violet";
}) {
  const text = {
    cyan: "text-signal-cyan",
    magenta: "text-signal-magenta",
    amber: "text-signal-amber",
    violet: "text-signal-violet",
  }[tone];
  const positive = delta.startsWith("+");
  return (
    <Card accent={tone} interactive={false} className="p-4">
      <div className="flex items-center justify-between">
        <Icon className={cn("w-4 h-4", text)} strokeWidth={1.5} />
        <span className={cn(
          "text-[10px] font-mono tabular-nums inline-flex items-center gap-1",
          positive ? "text-signal-cyan" : "text-ink-3"
        )}>
          {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {delta}
        </span>
      </div>
      <p className="font-display font-light text-2xl tabular-nums text-ink-1 mt-3">
        {value}
      </p>
      <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3 mt-1">
        {label}
      </p>
    </Card>
  );
}

function aggregate(content: ContentRow[]) {
  const views = content.reduce((s, c) => s + c.views, 0);
  const ctrAvg = content.reduce((s, c) => s + c.ctrPct, 0) / content.length;
  const retentionAvg = content.reduce((s, c) => s + c.retentionPct, 0) / content.length;
  const top = [...content].sort((a, b) => b.engagement - a.engagement)[0];
  const maxViews = Math.max(...content.map((c) => c.views));
  return {
    views,
    ctrAvg,
    retentionAvg,
    topEngagement: top?.engagement ?? 0,
    maxViews,
  };
}

function fmtK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `${n}`;
}
