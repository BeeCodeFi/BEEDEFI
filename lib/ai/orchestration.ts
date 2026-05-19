/**
 * Multi-agent orchestration scaffold.
 *
 * Each agent is a small async function that takes a request and returns a
 * structured response. The orchestrator can run them sequentially, in
 * parallel, or as a pipeline (one agent's output becomes another's input).
 *
 * This is a SCAFFOLD — Phase 6 ships the architecture; richer routing
 * (planner agent, tool use, retry policy) lands later. The interface is
 * stable so future work doesn't require touching call sites.
 */

import type { ChatMessage } from "./client";
import { chat } from "./client";
import { memory } from "./memoryManager";
import { prompts } from "./promptManager";

export type AgentResult<T = unknown> = {
  agent: string;
  ok: boolean;
  data: T;
  /** True when any chat call in this agent fell back to the stub. */
  stubbed: boolean;
  latencyMs: number;
};

export type AgentRunner<I, O> = (input: I) => Promise<AgentResult<O>>;

/**
 * Run a single LLM call inside the agent envelope — handles memory bookkeeping
 * and timing so individual agents stay focused on their domain logic.
 */
export async function runLlmAgent<O>(opts: {
  agent: string;
  messages: ChatMessage[];
  parse: (raw: string) => O;
  fallback: () => string | Promise<string>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<AgentResult<O>> {
  const start = Date.now();

  // Log the inbound user message into episodic memory before the call so we
  // capture intent even if the call fails.
  const userMsg = opts.messages[opts.messages.length - 1];
  if (userMsg?.role === "user") {
    memory.appendEpisodic({
      agent: opts.agent,
      role: "user",
      content: userMsg.content,
    });
  }

  const res = await chat({
    messages: opts.messages,
    model: opts.model,
    temperature: opts.temperature,
    maxTokens: opts.maxTokens,
    fallback: opts.fallback,
    agent: opts.agent,
  });

  memory.appendEpisodic({
    agent: opts.agent,
    role: "assistant",
    content: res.text,
  });

  return {
    agent: opts.agent,
    ok: true,
    data: opts.parse(res.text),
    stubbed: res.stubbed,
    latencyMs: Date.now() - start,
  };
}

/**
 * Run a list of agents in parallel and collect all results. Each agent is
 * isolated — one failing doesn't stop the others.
 */
export async function runParallel<O>(
  runners: Array<() => Promise<AgentResult<O>>>
): Promise<Array<AgentResult<O>>> {
  return Promise.all(
    runners.map((r) =>
      r().catch(
        (err): AgentResult<O> => ({
          agent: "unknown",
          ok: false,
          data: { error: String(err) } as unknown as O,
          stubbed: true,
          latencyMs: 0,
        })
      )
    )
  );
}

/** Re-export the shared singletons so callers only need one import. */
export { memory, prompts };
