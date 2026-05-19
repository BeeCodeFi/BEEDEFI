"use server";

/**
 * Server-action surface for the AI generators.
 *
 * Client components import from here; Next.js makes these callable as RPCs
 * so the OpenRouter key (and the prompt logic) never leaves the server. The
 * underlying generators in ./generators stay pure functions and can be unit-
 * tested or composed server-side without going through the action boundary.
 */

import {
  generateScript as _generateScript,
  generateHooks as _generateHooks,
  generateThumbnails as _generateThumbnails,
  type GeneratedScript,
} from "./generators";
import { memory } from "./memoryManager";
import type { AgentResult } from "./orchestration";
import type { HookVariant, ThumbnailConcept } from "@/lib/studio";

export async function generateScriptAction(
  topic: string,
  lengthHint?: string,
  tone?: string
): Promise<AgentResult<GeneratedScript>> {
  return _generateScript(topic, lengthHint, tone);
}

export async function generateHooksAction(
  topic: string
): Promise<AgentResult<HookVariant[]>> {
  return _generateHooks(topic);
}

export async function generateThumbnailsAction(
  concept: string
): Promise<AgentResult<ThumbnailConcept[]>> {
  return _generateThumbnails(concept);
}

/**
 * Read counts from the in-memory MemoryManager. Counts only — never returns
 * the raw entries, since those can include user-content from the episodic log.
 */
export async function getMemoryStatsAction(): Promise<{
  episodic: number;
  semantic: number;
  procedural: number;
}> {
  const snap = memory.snapshot();
  return {
    episodic: snap.episodic.length,
    semantic: snap.semantic.length,
    procedural: snap.procedural.length,
  };
}

/**
 * Wipe in-memory state. Useful while iterating — also a sane "factory reset"
 * for the AI subsystem once persistence ships.
 */
export async function clearMemoryAction(): Promise<{ ok: true }> {
  memory.clear();
  return { ok: true };
}
