"use client";

import { useState, useEffect } from "react";
import {
  getStoredAgentState,
  getStoredBrain,
  getStoredCareer,
  getStoredHealth,
  getStoredStudio,
  getStoredLearning,
  type StoredBrain,
  type StoredCareer,
  type StoredHealth,
  type StoredStudio,
} from "./store";
import { AGENT_STATE, AGENTS, type AgentWithState, type AgentId, type AgentState } from "./agents";
import type { BrainSnapshot } from "./brain";
import type { CareerSnapshot, ApplicationStage } from "./career";
import type { HealthSnapshot } from "./health";
import type { StudioSnapshot } from "./studio";
import type { LearningSnapshot } from "./beecodefi";

/**
 * Client-side hooks that read from localStorage, with fallback to the
 * hardcoded defaults in the lib files. Pages that use these become live —
 * they reflect whatever data you enter in /settings.
 */

export function useAgentsData(refreshKey = 0): AgentWithState[] {
  const [agents, setAgents] = useState<AgentWithState[]>(() =>
    AGENTS.map((a) => ({ ...a, state: AGENT_STATE[a.id] }))
  );

  useEffect(() => {
    const stored = getStoredAgentState();
    if (stored) {
      setAgents(AGENTS.map((a) => ({ ...a, state: stored[a.id] ?? AGENT_STATE[a.id] })));
    }
  }, [refreshKey]);

  return agents;
}

export function useBrainData(refreshKey = 0): BrainSnapshot {
  const [snapshot, setSnapshot] = useState<BrainSnapshot>({ notes: [], links: [], tags: [] });

  useEffect(() => {
    const stored = getStoredBrain();
    if (stored && stored.notes.length > 0) {
      const tags = Array.from(new Set(stored.notes.flatMap((n) => n.tags))).sort();
      setSnapshot({ notes: stored.notes, links: stored.links, tags });
    }
  }, [refreshKey]);

  return snapshot;
}

export function useCareerData(refreshKey = 0): CareerSnapshot {
  const STAGES: ApplicationStage[] = ["applied", "phone", "onsite", "offer", "rejected"];
  const empty: CareerSnapshot = {
    applications: [],
    prep: [],
    stats: { activeLeads: 0, responseRatePct: 0, avgDaysToReply: 0, byStage: { applied: 0, phone: 0, onsite: 0, offer: 0, rejected: 0 } },
  };

  const [snapshot, setSnapshot] = useState<CareerSnapshot>(empty);

  useEffect(() => {
    const stored = getStoredCareer();
    if (stored) {
      const byStage = STAGES.reduce(
        (acc, s) => ((acc[s] = stored.applications.filter((a) => a.stage === s).length), acc),
        {} as Record<ApplicationStage, number>
      );
      const active = stored.applications.filter((a) => a.stage !== "rejected").length;
      const total = stored.applications.length;
      const replied = stored.applications.filter((a) => a.stage !== "applied").length;
      setSnapshot({
        applications: stored.applications,
        prep: stored.prep,
        stats: {
          activeLeads: active,
          responseRatePct: total > 0 ? Math.round((replied / total) * 100) : 0,
          avgDaysToReply: 0,
          byStage,
        },
      });
    }
  }, [refreshKey]);

  return snapshot;
}

export function useHealthData(refreshKey = 0): HealthSnapshot {
  const defaultToday = {
    label: "Thu",
    date: "2026-05-29",
    sleepHours: 0,
    sleepQuality: 0,
    steps: 0,
    activeMinutes: 0,
    hrvMs: 0,
  };

  const [snapshot, setSnapshot] = useState<HealthSnapshot>({
    energyBand: "steady",
    energyIndex: 0,
    today: defaultToday,
    week: [defaultToday],
    events: [],
    targets: { sleepHours: 7.5, steps: 9_000, activeMinutes: 45 },
  });

  useEffect(() => {
    const stored = getStoredHealth();
    if (stored) {
      setSnapshot({
        energyBand: stored.energyBand,
        energyIndex: stored.energyIndex,
        today: stored.today,
        week: stored.week.length > 0 ? stored.week : [stored.today],
        events: stored.events,
        targets: { sleepHours: 7.5, steps: 9_000, activeMinutes: 45 },
      });
    }
  }, [refreshKey]);

  return snapshot;
}

export function useStudioData(refreshKey = 0): StudioSnapshot {
  const [snapshot, setSnapshot] = useState<StudioSnapshot>({
    drafts: [],
    hookHistory: [],
    thumbnailHistory: [],
    content: [],
  });

  useEffect(() => {
    const stored = getStoredStudio();
    if (stored) {
      setSnapshot({
        drafts: stored.drafts,
        hookHistory: [],
        thumbnailHistory: [],
        content: stored.content,
      });
    }
  }, [refreshKey]);

  return snapshot;
}

export function useLearningData(refreshKey = 0): LearningSnapshot {
  const [snapshot, setSnapshot] = useState<LearningSnapshot>({
    currentPath: null,
    streakDays: 0,
    studiedToday: false,
    recentActivity: [],
    upcomingReviews: [],
    coursesCompleted: 0,
    quizzesCompleted: 0,
    tutorialsCompleted: 0,
    lastSyncedAt: null,
  });

  useEffect(() => {
    const stored = getStoredLearning();
    if (stored) setSnapshot(stored);
  }, [refreshKey]);

  return snapshot;
}
