/**
 * PromptManager — a tiny template engine for building prompts in a
 * structured, testable way. Templates declare their variables, runtime
 * substitutions are type-checked at the call site.
 *
 * Why a class instead of bare functions: a single instance lets us layer in
 * versioning, A/B-test prompts, and emit telemetry from one place without
 * touching every call site.
 */

import type { ChatMessage } from "./client";

export type PromptTemplate<V extends string> = {
  id: string;
  /** System message — sets agent persona and constraints. */
  system: string;
  /** User-message template. Use {{var}} placeholders. */
  user: string;
  /** Names of expected variables — runtime checked. */
  vars: readonly V[];
};

export class PromptManager {
  private readonly templates = new Map<string, PromptTemplate<string>>();

  register<V extends string>(t: PromptTemplate<V>): void {
    if (this.templates.has(t.id)) {
      throw new Error(`PromptManager: duplicate template id "${t.id}"`);
    }
    this.templates.set(t.id, t as PromptTemplate<string>);
  }

  /** Build the messages array ready for client.chat(). */
  build<V extends string>(
    id: string,
    vars: Record<V, string>
  ): ChatMessage[] {
    const t = this.templates.get(id);
    if (!t) throw new Error(`PromptManager: unknown template "${id}"`);

    for (const v of t.vars) {
      if (!(v in vars)) {
        throw new Error(`PromptManager: missing variable "${v}" for "${id}"`);
      }
    }

    const userMsg = t.user.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      (vars as Record<string, string>)[key] ?? ""
    );

    return [
      { role: "system", content: t.system },
      { role: "user", content: userMsg },
    ];
  }

  list(): string[] {
    return Array.from(this.templates.keys()).sort();
  }
}

/**
 * Default app-wide prompt registry. Templates can also live closer to their
 * call sites if they grow specialized, but starting them here keeps Phase 6
 * easy to scan.
 */
export const prompts = new PromptManager();

prompts.register({
  id: "studio.script",
  system:
    "You are the Content agent for an AI-native personal workspace. You write " +
    "short-form scripts (3–6 minutes) with a strong cold open, one clear " +
    "argument, and a memorable last line. No filler, no throat-clearing. " +
    "Voice: confident, specific, slightly dry.",
  user:
    "Topic: {{topic}}\n\nWrite a script. Mark the cold open as [HOOK] and " +
    "the closing line as [BUTTON]. Around {{lengthHint}}. Tone: {{tone}}.",
  vars: ["topic", "lengthHint", "tone"] as const,
});

prompts.register({
  id: "studio.hooks",
  system:
    "You are a hook generator. Produce five distinct opening lines, each in " +
    "a different style: question-rebuttal, wait-but, stat-shock, " +
    "story-cold-open, contrarian-claim. Each hook stands alone, no setup, no " +
    "explanation, no markdown. One line each, separated by newlines, prefixed " +
    "with the style tag in brackets like '[wait-but] ...'.",
  user: "Topic: {{topic}}\n\nGenerate the five hooks now.",
  vars: ["topic"] as const,
});

prompts.register({
  id: "studio.thumbnails",
  system:
    "You are a thumbnail-concept ideator. Produce four distinct visual " +
    "concepts. Each concept is one line in this exact format:\n" +
    "MOOD | COMPOSITION | COPY LINE | PALETTE\n" +
    "Where MOOD is one of: kinetic, thoughtful, controversial, intimate. " +
    "COPY LINE is at most 5 words, ALL CAPS. No markdown, no numbering.",
  user: "Concept: {{concept}}\n\nGenerate four thumbnail concepts now.",
  vars: ["concept"] as const,
});
