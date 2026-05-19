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
  return MOCK_SNAPSHOT;
}

const WEEK: DailyPoint[] = [
  { label: "Wed", date: "2026-05-13", sleepHours: 6.5, sleepQuality: 64, steps: 5_800,  activeMinutes: 22, hrvMs: 41 },
  { label: "Thu", date: "2026-05-14", sleepHours: 7.2, sleepQuality: 78, steps: 8_400,  activeMinutes: 38, hrvMs: 47 },
  { label: "Fri", date: "2026-05-15", sleepHours: 7.8, sleepQuality: 84, steps: 7_100,  activeMinutes: 31, hrvMs: 52 },
  { label: "Sat", date: "2026-05-16", sleepHours: 8.4, sleepQuality: 89, steps: 11_200, activeMinutes: 64, hrvMs: 58 },
  { label: "Sun", date: "2026-05-17", sleepHours: 7.9, sleepQuality: 81, steps: 9_300,  activeMinutes: 42, hrvMs: 54 },
  { label: "Mon", date: "2026-05-18", sleepHours: 6.8, sleepQuality: 71, steps: 6_500,  activeMinutes: 28, hrvMs: 46 },
  { label: "Tue", date: "2026-05-19", sleepHours: 7.5, sleepQuality: 80, steps: 6_200,  activeMinutes: 35, hrvMs: 51 },
];

const MOCK_SNAPSHOT: HealthSnapshot = {
  energyBand: "high",
  energyIndex: 78,
  today: WEEK[WEEK.length - 1],
  week: WEEK,
  events: [
    { ago: 22,   text: "Logged 6,200 steps — 38% to daily target",          kind: "system" },
    { ago: 48,   text: "Elevated HRV — energy band moved to HIGH",          kind: "system" },
    { ago: 86,   text: "Reminded to hydrate — last drink 2h ago",           kind: "user"   },
    { ago: 240,  text: "Sleep quality 80 — within recovery threshold",      kind: "system" },
    { ago: 720,  text: "Anomaly: resting HR +6bpm vs baseline (transient)", kind: "anomaly" },
    { ago: 1320, text: "Started 35min low-intensity zone-2 session",         kind: "user"   },
  ],
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
