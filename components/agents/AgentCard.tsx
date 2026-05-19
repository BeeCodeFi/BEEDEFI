"use client";

import { Card, CardHeader } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ActivityFeed } from "@/components/ui/ActivityFeed";
import { AgentAvatar } from "./AgentAvatar";
import type { AgentWithState } from "@/lib/agents";

/**
 * One agent tile. The information hierarchy reads top-to-bottom:
 *
 *   1. Identity row    — avatar, name, role, status
 *   2. Current task    — what the agent is doing right now + progress + ETA
 *   3. Activity feed   — three most recent actions
 *
 * The Card primitive supplies the glass surface and hover lift; everything
 * else is layout inside it.
 */
type Props = {
  agent: AgentWithState;
};

export function AgentCard({ agent }: Props) {
  const { state } = agent;
  const showProgress = state.status === "working" || state.status === "thinking" || state.progress > 0;

  return (
    <Card accent={agent.accent} interactive={true} className="flex flex-col gap-5">
      {/* IDENTITY */}
      <CardHeader className="mb-0">
        <div className="flex items-center gap-3">
          <AgentAvatar agent={agent} status={state.status} />
          <div className="flex flex-col">
            <h3 className="font-display text-sm font-medium tracking-wide text-ink-1">
              {agent.label}
            </h3>
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-3 mt-0.5">
              {agent.role}
            </p>
          </div>
        </div>
        <StatusPill status={state.status} />
      </CardHeader>

      {/* CURRENT TASK */}
      <div className="flex items-center gap-4">
        {showProgress && (
          <ProgressRing
            value={state.progress}
            accent={agent.accent}
            size={52}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3 mb-1">
            {state.status === "idle" ? "Standby" : state.status === "blocked" ? "Blocked on" : "Current task"}
          </p>
          <p className="text-[13px] text-ink-2 leading-snug line-clamp-2">
            {state.currentTask}
          </p>
          {state.etaMinutes !== null && (
            <p className="mt-1 text-[10px] font-mono tabular-nums text-ink-3">
              ETA {state.etaMinutes}m
            </p>
          )}
        </div>
      </div>

      {/* ACTIVITY */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3 mb-2.5">
          Activity
        </p>
        <ActivityFeed items={state.activity} />
      </div>
    </Card>
  );
}
