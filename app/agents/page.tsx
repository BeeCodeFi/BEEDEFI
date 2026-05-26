"use client";

import { motion } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { AgentNetwork } from "@/components/agents/AgentNetwork";
import { AgentCard } from "@/components/agents/AgentCard";
import { getAgentsWithState } from "@/lib/agents";

/**
 * The agent dashboard. Layout reads top-down:
 *   1. Page header — title + at-a-glance counts
 *   2. AgentNetwork — the bus visualization
 *   3. Agent grid — seven cards, each with avatar / status / task / feed
 *
 * No live data yet; everything is mocked through lib/agents until Phase 6.
 */

const cascade = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 + i * 0.06,
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export default function AgentsPage() {
  const agents = getAgentsWithState();

  const counts = {
    working: agents.filter((a) => a.state.status === "working").length,
    thinking: agents.filter((a) => a.state.status === "thinking").length,
    blocked: agents.filter((a) => a.state.status === "blocked").length,
    idle: agents.filter((a) => a.state.status === "idle").length,
  };

  return (
    <div className="relative min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-10 lg:pt-12 pb-32">
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-end justify-between gap-6 mb-8"
      >
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-signal-violet mb-2">
            Phase 03 · Network
          </p>
          <h1 className="font-display text-display-lg font-light tracking-tight text-ink-1">
            Agent <span className="text-signal-grad">network</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-ink-2 font-body leading-relaxed">
            Seven specialized minds, one bus. Watch which agents are talking,
            who's waiting, and what's moving through the system right now.
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 text-right">
          <Stat label="Working"  value={counts.working}  accent="cyan" />
          <Stat label="Thinking" value={counts.thinking} accent="magenta" />
          <Stat label="Blocked"  value={counts.blocked}  accent="amber" />
          <Stat label="Idle"     value={counts.idle}     accent="ink" />
        </div>
      </motion.header>

      {/* NETWORK VIZ */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <GlassPanel edge className="p-3 sm:p-4 md:p-6">
          <AgentNetwork />
        </GlassPanel>
      </motion.section>

      {/* AGENT GRID */}
      <section>
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-display text-display-md font-light tracking-tight">
            Agents
          </h2>
          <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
            {agents.length} active · live state
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              custom={i}
              initial="hidden"
              animate="show"
              variants={cascade}
            >
              <AgentCard agent={agent} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "cyan" | "magenta" | "amber" | "ink";
}) {
  const color = {
    cyan: "text-signal-cyan",
    magenta: "text-signal-magenta",
    amber: "text-signal-amber",
    ink: "text-ink-2",
  }[accent];
  return (
    <div className="flex flex-col items-end">
      <span className={`font-display font-light text-2xl tabular-nums ${color}`}>
        {value}
      </span>
      <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
        {label}
      </span>
    </div>
  );
}
