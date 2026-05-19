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
