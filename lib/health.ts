/**
 * Health data layer. Stubbed. Same pattern as the others.
 */

export type EnergyBand = "low" | "steady" | "high";

export type DailyPoint = {
  /** "Mon" | "Tue" | ... display label */
  label: string;
  /** ISO date */
  date: string;
  sleepHours: number;
  /** 0-100 */
  sleepQuality: number;
  steps: number;
  activeMinutes: number;
  /** Heart-rate variability in ms; higher generally = more recovered. */
  hrvMs: number;
};

export type HealthEvent = {
  ago: number; // minutes
  text: string;
  kind: "system" | "user" | "anomaly";
};

export type HealthSnapshot = {
  energyBand: EnergyBand;
  energyIndex: number; // 0-100
  today: DailyPoint;
  week: DailyPoint[]; // length 7, oldest → newest, last entry == today
  events: HealthEvent[];
  /** Quick targets the user is tracking. */
  targets: {
    sleepHours: number;
    steps: number;
    activeMinutes: number;
  };
};

export async function getHealthSnapshot(): Promise<HealthSnapshot> {
  return SNAPSHOT;
}

// ---------------------------------------------------------------------------
// Today's baseline. Fill in your actual numbers each day — or wire this to a
// wearable API in Phase 6. The week array builds up as you add daily entries;
// oldest first, last entry = today.
// ---------------------------------------------------------------------------

const TODAY: DailyPoint = {
  label: "Thu",
  date: "2026-05-29",
  sleepHours: 0,
  sleepQuality: 0,
  steps: 0,
  activeMinutes: 0,
  hrvMs: 0,
};

const SNAPSHOT: HealthSnapshot = {
  energyBand: "steady",
  energyIndex: 0,
  today: TODAY,
  week: [TODAY],
  events: [],
  targets: {
    sleepHours: 7.5,
    steps: 9_000,
    activeMinutes: 45,
  },
};

export const ENERGY_ACCENT: Record<EnergyBand, "cyan" | "amber" | "magenta"> = {
  high: "cyan",
  steady: "amber",
  low: "magenta",
};

export const ENERGY_LABEL: Record<EnergyBand, string> = {
  high: "High",
  steady: "Steady",
  low: "Low",
};
