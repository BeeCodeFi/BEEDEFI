"use client";

import { useState, useCallback } from "react";
import { Activity, Moon, Footprints, Zap, HeartPulse, Droplet } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { InlineEntryPanel } from "@/components/ui/InlineEntryPanel";
import { HealthEntry } from "@/components/health/HealthEntry";
import { cn } from "@/lib/cn";
import {
  ENERGY_ACCENT,
  ENERGY_LABEL,
  type DailyPoint,
  type HealthSnapshot,
} from "@/lib/health";
import { useHealthData } from "@/lib/useStore";

/**
 * /health — energy, sleep, and movement. Server-rendered with a snapshot, all
 * sparkline visuals are inline SVG so there's no extra library cost.
 */

const ACCENT_TEXT = {
  cyan: "text-signal-cyan",
  magenta: "text-signal-magenta",
  amber: "text-signal-amber",
} as const;

export default function HealthPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const snap = useHealthData(refreshKey);
  const handleSaved = useCallback(() => setRefreshKey((k) => k + 1), []);
  const energyAccent = ENERGY_ACCENT[snap.energyBand];

  return (
    <div className="relative min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-10 lg:pt-12 pb-32">
      {/* HEADER */}
      <header className="mb-8 sm:mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-signal-cyan mb-2">
          Phase 05 · Health
        </p>
        <h1 className="font-display text-display-lg font-light tracking-tight text-ink-1">
          Today&rsquo;s <span className="text-signal-grad">signal</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ink-2 font-body leading-relaxed">
          Energy, sleep, movement, and what your body is telling you right now.
        </p>
      </header>

      {/* ENERGY HERO */}
      <section className="mb-6">
        <GlassPanel edge className="p-5 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-5 sm:gap-6 md:gap-10">
            <ProgressRing
              value={snap.energyIndex}
              accent={energyAccent}
              size={120}
              label={`${snap.energyIndex}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3 mb-2">
                Energy band
              </p>
              <div className="flex items-baseline gap-3">
                <h2 className={cn("font-display text-3xl font-light tracking-tight", ACCENT_TEXT[energyAccent])}>
                  {ENERGY_LABEL[snap.energyBand]}
                </h2>
                <span className="text-[11px] font-mono uppercase tracking-wider text-ink-3">
                  index {snap.energyIndex}/100
                </span>
              </div>
              <p className="mt-2 text-[13px] text-ink-2 leading-relaxed max-w-md">
                {snap.energyIndex === 0
                  ? "Log today's sleep, steps, and active minutes to get your energy reading."
                  : "Sleep quality solid, HRV trending up, movement light. Good day to attempt the harder block of work; ease into evening cardio."}
              </p>
            </div>

            {/* Inline today vitals */}
            <div className="grid grid-cols-2 gap-4 md:border-l md:border-edge md:pl-6 lg:pl-8">
              <VitalMini icon={Moon}       label="Sleep"      value={`${snap.today.sleepHours}h`} sub={`q${snap.today.sleepQuality}`} />
              <VitalMini icon={Footprints} label="Steps"      value={fmtK(snap.today.steps)}      sub={`/${fmtK(snap.targets.steps)}`} />
              <VitalMini icon={Zap}        label="Active"     value={`${snap.today.activeMinutes}m`} sub={`/${snap.targets.activeMinutes}m`} />
              <VitalMini icon={HeartPulse} label="HRV"        value={`${snap.today.hrvMs}ms`}     sub={hrvDelta(snap.week)} />
            </div>
          </div>
        </GlassPanel>
      </section>

      {/* CHARTS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <ChartCard
          title="Sleep · 7 days"
          icon={Moon}
          accent="magenta"
          unit="h"
          target={snap.targets.sleepHours}
          points={snap.week.map((d) => ({ label: d.label, v: d.sleepHours }))}
        />
        <ChartCard
          title="Steps · 7 days"
          icon={Footprints}
          accent="cyan"
          unit=""
          target={snap.targets.steps}
          points={snap.week.map((d) => ({ label: d.label, v: d.steps }))}
          formatY={fmtK}
        />
        <ChartCard
          title="HRV · 7 days"
          icon={HeartPulse}
          accent="amber"
          unit="ms"
          points={snap.week.map((d) => ({ label: d.label, v: d.hrvMs }))}
        />
      </section>

      {/* EVENTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card accent="cyan" interactive={false}>
          <CardHeader>
            <CardTitle>Today&rsquo;s events</CardTitle>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
              {snap.events.length} entries
            </span>
          </CardHeader>
          <ActivityFeed
            items={snap.events.map((e) => ({
              ago: e.ago,
              text: e.text,
              tone: e.kind === "anomaly" ? ("alert" as const) : ("ok" as const),
            }))}
          />
        </Card>

        <Card accent="magenta" interactive={false}>
          <CardHeader>
            <CardTitle>Nudges</CardTitle>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
              from Health agent
            </span>
          </CardHeader>
          <ul className="flex flex-col gap-3 text-[13px] text-ink-2">
            <Nudge icon={Droplet}   text="Drink 350ml in the next 30 min — last drink 2h ago." />
            <Nudge icon={Activity}  text="Move 5 min — you've been sitting for 47 minutes." />
            <Nudge icon={Moon}      text="Wind-down at 22:30 if you want to hit your 7.5h target." />
            <Nudge icon={Zap}       text="Energy high — attempt the hardest block of work in the next 90m." />
          </ul>
        </Card>
      </section>

      <InlineEntryPanel accent="cyan">
        <HealthEntry onSaved={handleSaved} />
      </InlineEntryPanel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Inline pieces
// ---------------------------------------------------------------------------

function VitalMini({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-ink-3 mt-0.5" strokeWidth={1.5} />
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3">{label}</p>
        <p className="text-[15px] font-display font-light text-ink-1 leading-tight">{value}</p>
        <p className="text-[10px] font-mono tabular-nums text-ink-3">{sub}</p>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  accent,
  unit,
  target,
  points,
  formatY,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accent: "cyan" | "magenta" | "amber";
  unit?: string;
  target?: number;
  points: Array<{ label: string; v: number }>;
  formatY?: (v: number) => string;
}) {
  return (
    <Card accent={accent} interactive={false}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className={cn("w-4 h-4", ACCENT_TEXT[accent])} strokeWidth={1.5} />
          <CardTitle>{title}</CardTitle>
        </div>
        <span className="text-[10px] font-mono tabular-nums text-ink-3">
          {formatY ? formatY(points[points.length - 1].v) : points[points.length - 1].v}
          {unit ?? ""}
        </span>
      </CardHeader>
      <Sparkline points={points} target={target} accent={accent} />
    </Card>
  );
}

function Sparkline({
  points,
  target,
  accent,
}: {
  points: Array<{ label: string; v: number }>;
  target?: number;
  accent: "cyan" | "magenta" | "amber";
}) {
  const W = 320;
  const H = 80;
  const padX = 12;
  const padY = 14;
  const max = Math.max(...points.map((p) => p.v), target ?? 0);
  const min = Math.min(...points.map((p) => p.v), target ?? Infinity);
  const range = max - min || 1;
  const step = (W - padX * 2) / (points.length - 1);

  const xy = points.map((p, i) => ({
    x: padX + i * step,
    y: H - padY - ((p.v - min) / range) * (H - padY * 2),
    label: p.label,
    v: p.v,
  }));

  const path = xy
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Smoothed area path (drop to bottom for the fill).
  const fillPath = `${path} L ${xy[xy.length - 1].x} ${H - padY} L ${xy[0].x} ${H - padY} Z`;

  const stroke = {
    cyan: "#5ef0ff",
    magenta: "#ff5ed4",
    amber: "#ffb547",
  }[accent];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-1">
      {/* Target line, if provided */}
      {target !== undefined && (
        <line
          x1={padX}
          x2={W - padX}
          y1={H - padY - ((target - min) / range) * (H - padY * 2)}
          y2={H - padY - ((target - min) / range) * (H - padY * 2)}
          stroke="rgba(255,255,255,0.15)"
          strokeDasharray="2 3"
          strokeWidth={1}
        />
      )}
      <path d={fillPath} fill={stroke} fillOpacity="0.08" />
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {xy.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={stroke} />
      ))}
      {/* Axis labels */}
      {xy.map((p, i) => (
        <text
          key={`l${i}`}
          x={p.x}
          y={H - 2}
          textAnchor="middle"
          fill="#697089"
          style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

function Nudge({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="w-3.5 h-3.5 mt-1 text-signal-magenta shrink-0" strokeWidth={1.5} />
      <span className="leading-snug">{text}</span>
    </li>
  );
}

function fmtK(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `${n}`;
}

function hrvDelta(week: HealthSnapshot["week"]): string {
  if (week.length < 2) return "";
  const today = week[week.length - 1].hrvMs;
  const yest = week[week.length - 2].hrvMs;
  const d = today - yest;
  if (d === 0) return "→ flat";
  return d > 0 ? `▲ +${d}ms` : `▼ ${d}ms`;
}
