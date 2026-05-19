/**
 * High-level generation helpers consumed by /studio. Each function:
 *   1. Asks the prompt manager to build messages
 *   2. Runs the LLM via the agent envelope (handles memory + timing)
 *   3. Parses the model output into a typed shape
 *   4. Falls back to a deterministic stub when no API key is set
 *
 * The stubs are intentionally good enough to demo on — they're how the app
 * looks before you wire OpenRouter.
 */

import {
  prompts,
  runLlmAgent,
  type AgentResult,
} from "./orchestration";
import {
  HOOK_STYLE_LABEL,
  type HookVariant,
  type ThumbnailConcept,
} from "@/lib/studio";

// ---------------------------------------------------------------------------
// Scripts
// ---------------------------------------------------------------------------

export type GeneratedScript = {
  title: string;
  body: string;
  hook: string | null;
  button: string | null;
};

export async function generateScript(
  topic: string,
  lengthHint = "4 minutes",
  tone = "confident, specific, slightly dry"
): Promise<AgentResult<GeneratedScript>> {
  const messages = prompts.build("studio.script", {
    topic,
    lengthHint,
    tone,
  });

  return runLlmAgent<GeneratedScript>({
    agent: "content",
    messages,
    parse: (raw) => parseScript(raw, topic),
    fallback: () => STUB_SCRIPT(topic),
    temperature: 0.75,
    maxTokens: 900,
  });
}

function parseScript(raw: string, topic: string): GeneratedScript {
  const hookMatch = raw.match(/\[HOOK\]\s*([\s\S]*?)(?=\n|\[)/);
  const buttonMatch = raw.match(/\[BUTTON\]\s*([\s\S]*?)(?=\n|$)/);
  return {
    title: topic,
    body: raw.trim(),
    hook: hookMatch ? hookMatch[1].trim() : null,
    button: buttonMatch ? buttonMatch[1].trim() : null,
  };
}

function STUB_SCRIPT(topic: string): string {
  return [
    `[HOOK] If you've ever wondered why ${topic.toLowerCase()} feels harder than it should — you're not alone, and the reason is simpler than you think.`,
    ``,
    `Most people approach this the wrong way. They start with the *what* — what to do, what to build, what to optimize. The actual problem is upstream: it's the structure of the question itself. Once you flip the frame, the work stops feeling like brute force and starts compounding.`,
    ``,
    `Here's the three-part move I use. First, define the *smallest unit* of progress that still feels real. For ${topic.toLowerCase()}, that's usually one decision, not one project. Second, ship that unit in a window short enough that you can't talk yourself out of it. Third, log what you noticed — not what you did. The signal is in the noticing.`,
    ``,
    `If you take one thing away: the lever isn't more effort, it's a better question.`,
    ``,
    `[BUTTON] Stop optimizing the answer. Optimize the ask.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export async function generateHooks(
  topic: string
): Promise<AgentResult<HookVariant[]>> {
  const messages = prompts.build("studio.hooks", { topic });
  return runLlmAgent<HookVariant[]>({
    agent: "content",
    messages,
    parse: (raw) => parseHooks(raw),
    fallback: () => STUB_HOOKS(topic),
    temperature: 0.9,
    maxTokens: 400,
  });
}

const HOOK_STYLES: HookVariant["style"][] = [
  "question-rebuttal",
  "wait-but",
  "stat-shock",
  "story-cold-open",
  "contrarian-claim",
];

function parseHooks(raw: string): HookVariant[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const out: HookVariant[] = [];
  for (const line of lines) {
    const m = line.match(/^\[(.+?)\]\s*(.+)$/);
    if (!m) continue;
    const style = (HOOK_STYLES.find((s) => s === m[1]) ??
      "contrarian-claim") as HookVariant["style"];
    out.push({
      id: `g-${out.length}-${Date.now()}`,
      text: m[2],
      style,
      // Lift is unknown from the LLM — use a placeholder until we wire a scorer.
      predictedLiftPct: 20 + Math.floor(Math.random() * 15),
    });
    if (out.length >= 5) break;
  }
  return out;
}

function STUB_HOOKS(topic: string): string {
  const t = topic.toLowerCase();
  return [
    `[question-rebuttal] What if the way most people approach ${t} is exactly backwards?`,
    `[wait-but] You can ship faster on ${t}. Wait — but only if you stop optimizing the wrong thing first.`,
    `[stat-shock] 80% of the work on ${t} happens before anyone notices you started.`,
    `[story-cold-open] On Tuesday I rebuilt my entire approach to ${t}. By Friday the old version felt embarrassing.`,
    `[contrarian-claim] Most advice about ${t} is downstream of a question nobody's asking.`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Thumbnails
// ---------------------------------------------------------------------------

export async function generateThumbnails(
  concept: string
): Promise<AgentResult<ThumbnailConcept[]>> {
  const messages = prompts.build("studio.thumbnails", { concept });
  return runLlmAgent<ThumbnailConcept[]>({
    agent: "content",
    messages,
    parse: (raw) => parseThumbnails(raw),
    fallback: () => STUB_THUMBNAILS(concept),
    temperature: 0.85,
    maxTokens: 400,
  });
}

const MOODS: ThumbnailConcept["mood"][] = [
  "kinetic",
  "thoughtful",
  "controversial",
  "intimate",
];

function parseThumbnails(raw: string): ThumbnailConcept[] {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.includes("|"));
  const out: ThumbnailConcept[] = [];
  for (const line of lines) {
    const parts = line.split("|").map((s) => s.trim());
    if (parts.length < 4) continue;
    const mood = (MOODS.find((m) => parts[0].toLowerCase().includes(m)) ??
      "thoughtful") as ThumbnailConcept["mood"];
    out.push({
      id: `g-${out.length}-${Date.now()}`,
      composition: parts[1],
      copyLine: parts[2].toUpperCase(),
      paletteHint: parts[3],
      mood,
    });
    if (out.length >= 4) break;
  }
  return out;
}

function STUB_THUMBNAILS(concept: string): string {
  return [
    `kinetic | Split-frame: subject left, ${concept} diagram right | START HERE | cyan + violet, mild grain`,
    `thoughtful | Tight portrait, eyes off-camera | WHY IT BREAKS | amber on deep-bg`,
    `controversial | Two diverging arrows — one labeled 'right', one labeled 'easy' | PICK BOTH | magenta on black`,
    `intimate | Overhead workspace, one subject highlighted | I RAN IT ALONE | mono + single cyan accent`,
  ].join("\n");
}

// Re-export label table so studio components can render style chips.
export { HOOK_STYLE_LABEL };
