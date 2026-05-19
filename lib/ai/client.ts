/**
 * OpenRouter chat client + stub fallback.
 *
 * Phase 6 wires in real LLM calls via OpenRouter (free models on the free tier).
 * Until `OPENROUTER_API_KEY` is set in the environment, every call falls back
 * to a deterministic stub so the rest of the app can be built and demoed
 * without burning credits.
 *
 * Why route everything through here instead of calling fetch in each
 * generator: a single place to swap providers, add caching, add rate limits,
 * or stream tokens later. The interface stays stable.
 *
 * Free-tier reminders (per CLAUDE.md):
 *   - OpenRouter has rotating free models — verify availability before
 *     hard-coding a model name. We default to a free tier model and let
 *     callers override.
 *   - Don't suggest paid services without flagging the cost.
 */

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
  /** OpenRouter model slug. Free-tier model by default. */
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Caller-supplied stub used when no API key is set. */
  fallback?: () => string | Promise<string>;
  /** Optional tag used by the memory manager to bucket events. */
  agent?: string;
};

export type ChatResponse = {
  text: string;
  model: string;
  /** True when the response came from the stub, not from a live call. */
  stubbed: boolean;
  /** Approximate latency in ms. */
  latencyMs: number;
};

const DEFAULT_MODEL = "openrouter/auto";

/**
 * Detect whether a real provider is wired up. We only check at call time
 * (not at module load) so changes to .env during dev don't require a restart.
 */
export function isLiveAiConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  const start = Date.now();
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    const text = req.fallback ? await req.fallback() : DEFAULT_STUB_RESPONSE;
    return {
      text,
      model: "stub",
      stubbed: true,
      latencyMs: Date.now() - start,
    };
  }

  const model = req.model ?? DEFAULT_MODEL;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // OpenRouter recommends an HTTP-Referer + X-Title for free-tier prioritization.
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "BEEDEFI",
      },
      body: JSON.stringify({
        model,
        messages: req.messages,
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxTokens ?? 800,
      }),
    });

    if (!res.ok) {
      // Soft-fail to the stub so the UI never sees a 500. Callers can detect
      // the failure via `stubbed: true` in the response.
      const text = req.fallback ? await req.fallback() : DEFAULT_STUB_RESPONSE;
      return { text, model: "stub", stubbed: true, latencyMs: Date.now() - start };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };
    const text =
      data.choices?.[0]?.message?.content ??
      (req.fallback ? await req.fallback() : DEFAULT_STUB_RESPONSE);

    return {
      text,
      model: data.model ?? model,
      stubbed: false,
      latencyMs: Date.now() - start,
    };
  } catch {
    const text = req.fallback ? await req.fallback() : DEFAULT_STUB_RESPONSE;
    return { text, model: "stub", stubbed: true, latencyMs: Date.now() - start };
  }
}

const DEFAULT_STUB_RESPONSE =
  "[stub response] Wire OPENROUTER_API_KEY in your environment to enable live generation.";
