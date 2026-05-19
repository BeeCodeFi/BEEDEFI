"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Brain,
  Video,
  GraduationCap,
  Briefcase,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardMetric } from "@/components/ui/Card";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { FloatingDock } from "@/components/layout/FloatingDock";

/**
 * The 3D orb scene is dynamically imported with ssr disabled. R3F initializes
 * a WebGL context which can't run on the server, and shipping its bundle in the
 * initial chunk would hurt TTI for users who never see it (reduced-motion users
 * get the static fallback rendered server-side instead).
 */
const OrbScene = dynamic(
  () => import("@/components/three/OrbScene").then((m) => m.OrbScene),
  { ssr: false }
);

/**
 * Animation variants used across the landing cascade. Keeping them at module
 * scope means React doesn't recreate the objects on every render — small win,
 * but worth it for components that animate often.
 */
const cascade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 + i * 0.08,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const, // expo-out — feels confident
    },
  }),
};

export default function DashboardPage() {
  const hour = new Date().getHours();
  const greeting =
    hour < 5 ? "Still awake" : hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";

  return (
    <div className="relative min-h-screen px-8 lg:px-16 pt-12 pb-32">
      {/* HERO ZONE — orb + greeting */}
      <section className="relative h-[60vh] min-h-[480px] flex flex-col items-center justify-center text-center">
        {/* Orb sits as an absolute layer so the text overlays it cleanly */}
        <div className="absolute inset-0">
          <OrbScene />
        </div>

        {/*
          Text-anchor scrim — a soft radial darken right where the headline lands.
          Without this the bright orb directly behind the text crushes legibility.
          pointer-events-none keeps it from blocking interactions on the canvas.
        */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 40% at 50% 55%, rgba(5,6,10,0.65) 0%, rgba(5,6,10,0.35) 50%, transparent 75%)",
          }}
        />

        {/* Status line — small, mono, fades in first */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative z-10 flex items-center gap-2 mb-6"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-signal-cyan opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-signal-cyan" />
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-ink-2">
            System online · 7 agents standby
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 font-display text-display-xl font-extralight text-ink-1 tracking-tight"
          // Subtle halo lifts the headline off the orb without looking like a drop shadow
          style={{ textShadow: "0 2px 24px rgba(5,6,10,0.85), 0 0 60px rgba(5,6,10,0.6)" }}
        >
          {greeting}, <span className="text-signal-grad">commander</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="relative z-10 mt-4 max-w-md text-sm text-ink-2 font-body"
          style={{ textShadow: "0 1px 12px rgba(5,6,10,0.85)" }}
        >
          Your second mind is ready. Three projects in flight, two thoughts queued for review.
        </motion.p>
      </section>

      {/* METRICS STRIP — glanceable numbers */}
      <section className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4">
        {METRICS.map((metric, i) => (
          <motion.div
            key={metric.label}
            custom={i}
            initial="hidden"
            animate="show"
            variants={cascade}
          >
            <Card accent="none" interactive={false} className="p-5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3 mb-3">
                {metric.label}
              </p>
              <CardMetric value={metric.value} unit={metric.unit} trend={metric.trend} />
            </Card>
          </motion.div>
        ))}
      </section>

      {/* FEATURE GRID — entry points to each section */}
      <section className="mt-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-display-md font-light tracking-tight">
            Your workspace
          </h2>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
            7 modules · 3 active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i + METRICS.length}
              initial="hidden"
              animate="show"
              variants={cascade}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI thinking panel — example of a fuller content surface */}
      <section className="mt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <GlassPanel edge className="p-8">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full border border-signal-magenta/40 flex items-center justify-center bg-signal-magenta/5">
                  <Sparkles className="w-4 h-4 text-signal-magenta" strokeWidth={1.5} />
                </div>
                <div className="absolute inset-0 rounded-full animate-breathe" style={{ boxShadow: "0 0 20px rgba(255,94,212,0.4)" }} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3 mb-2">
                  Suggestion · 12 minutes ago
                </p>
                <p className="font-body text-ink-1 leading-relaxed">
                  Three of your recent learning notes touch on the same idea: distributed systems
                  and human organizations share failure modes. <span className="text-ink-2">Want me to synthesize a piece on it?</span>
                </p>
                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-1.5 rounded-md bg-signal-magenta/10 border border-signal-magenta/30 text-xs font-mono uppercase tracking-wider text-signal-magenta hover:bg-signal-magenta/20 transition-colors">
                    Synthesize
                  </button>
                  <button className="px-3 py-1.5 rounded-md border border-edge text-xs font-mono uppercase tracking-wider text-ink-3 hover:text-ink-1 hover:border-edge-strong transition-colors">
                    Later
                  </button>
                </div>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </section>

      <FloatingDock />
    </div>
  );
}

const METRICS = [
  { label: "Focus index", value: 78, unit: "%", trend: 12 },
  { label: "Notes captured", value: 142, unit: "this wk", trend: 8 },
  { label: "Streaks", value: 23, unit: "days", trend: 0 },
  { label: "Energy", value: "high", unit: "", trend: -3 },
] as const;

type FeatureCardProps = {
  title: string;
  description: string;
  icon: typeof Sparkles;
  accent: "cyan" | "magenta" | "amber";
  metric?: string;
};

const FEATURES: FeatureCardProps[] = [
  {
    title: "Agents",
    description: "Seven specialized minds working in parallel",
    icon: Sparkles,
    accent: "magenta",
    metric: "3 active",
  },
  {
    title: "Second Brain",
    description: "Your knowledge graph, alive and connected",
    icon: Brain,
    accent: "cyan",
    metric: "1,284 nodes",
  },
  {
    title: "Creator Studio",
    description: "Scripts, hooks, thumbnails, and analytics in one place",
    icon: Video,
    accent: "magenta",
    metric: "2 drafts",
  },
  {
    title: "Learning",
    description: "Active recall, spaced repetition, project-based growth",
    icon: GraduationCap,
    accent: "amber",
    metric: "5 paths",
  },
  {
    title: "Career",
    description: "Track applications, prep, and pipeline health",
    icon: Briefcase,
    accent: "amber",
    metric: "12 leads",
  },
  {
    title: "Health",
    description: "Energy, sleep, and movement as first-class signals",
    icon: Activity,
    accent: "cyan",
    metric: "good",
  },
];

function FeatureCard({ title, description, icon: Icon, accent, metric }: FeatureCardProps) {
  const iconColor = {
    cyan: "text-signal-cyan",
    magenta: "text-signal-magenta",
    amber: "text-signal-amber",
  }[accent];

  return (
    <Card accent={accent} className="group h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.5} />
          <CardTitle>{title}</CardTitle>
        </div>
        <ArrowUpRight className="w-4 h-4 text-ink-3 group-hover:text-ink-1 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300" strokeWidth={1.5} />
      </CardHeader>
      <p className="text-sm text-ink-2 leading-relaxed font-body">
        {description}
      </p>
      {metric && (
        <p className="mt-6 text-[10px] font-mono uppercase tracking-wider text-ink-3">
          {metric}
        </p>
      )}
    </Card>
  );
}
