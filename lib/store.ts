/**
 * Client-side localStorage persistence layer. Every section's data is stored
 * under a namespaced key and typed. Read/write helpers ensure safe parsing.
 *
 * This is the bridge until Phase 6 (NeonDB). Data entered via the /settings
 * Data Entry UI persists across page reloads and browser sessions.
 */

import type { AgentId, AgentState, AgentActivity } from "./agents";
import type { Note, Link } from "./brain";
import type { Application, PrepItem } from "./career";
import type { DailyPoint, HealthEvent, HealthSnapshot } from "./health";
import type { ScriptDraft, ContentRow } from "./studio";
import type { LearningSnapshot } from "./beecodefi";

const PREFIX = "beedefi_";

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

export function getStoredAgentState(): Record<AgentId, AgentState> | null {
  return getItem<Record<AgentId, AgentState>>("agents");
}

export function setStoredAgentState(state: Record<AgentId, AgentState>): void {
  setItem("agents", state);
}

// ---------------------------------------------------------------------------
// Brain (notes + links)
// ---------------------------------------------------------------------------

export type StoredBrain = { notes: Note[]; links: Link[] };

export function getStoredBrain(): StoredBrain | null {
  return getItem<StoredBrain>("brain");
}

export function setStoredBrain(data: StoredBrain): void {
  setItem("brain", data);
}

// ---------------------------------------------------------------------------
// Career
// ---------------------------------------------------------------------------

export type StoredCareer = {
  applications: Application[];
  prep: PrepItem[];
};

export function getStoredCareer(): StoredCareer | null {
  return getItem<StoredCareer>("career");
}

export function setStoredCareer(data: StoredCareer): void {
  setItem("career", data);
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export type StoredHealth = {
  energyIndex: number;
  energyBand: "low" | "steady" | "high";
  today: DailyPoint;
  week: DailyPoint[];
  events: HealthEvent[];
};

export function getStoredHealth(): StoredHealth | null {
  return getItem<StoredHealth>("health");
}

export function setStoredHealth(data: StoredHealth): void {
  setItem("health", data);
}

// ---------------------------------------------------------------------------
// Studio
// ---------------------------------------------------------------------------

export type StoredStudio = {
  drafts: ScriptDraft[];
  content: ContentRow[];
};

export function getStoredStudio(): StoredStudio | null {
  return getItem<StoredStudio>("studio");
}

export function setStoredStudio(data: StoredStudio): void {
  setItem("studio", data);
}

// ---------------------------------------------------------------------------
// Learning
// ---------------------------------------------------------------------------

export function getStoredLearning(): LearningSnapshot | null {
  return getItem<LearningSnapshot>("learning");
}

export function setStoredLearning(data: LearningSnapshot): void {
  setItem("learning", data);
}

// ---------------------------------------------------------------------------
// Utility: export all data (for backup)
// ---------------------------------------------------------------------------

export function exportAllData(): string {
  const data = {
    agents: getStoredAgentState(),
    brain: getStoredBrain(),
    career: getStoredCareer(),
    health: getStoredHealth(),
    studio: getStoredStudio(),
    learning: getStoredLearning(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.agents) setStoredAgentState(data.agents);
    if (data.brain) setStoredBrain(data.brain);
    if (data.career) setStoredCareer(data.career);
    if (data.health) setStoredHealth(data.health);
    if (data.studio) setStoredStudio(data.studio);
    if (data.learning) setStoredLearning(data.learning);
    return true;
  } catch {
    return false;
  }
}
