/**
 * MemoryManager — a thin in-memory store for agent interactions.
 *
 * Three layers per CLAUDE.md Phase 6 design note:
 *   - episodic:  per-conversation history ("what did I just ask?")
 *   - semantic:  durable facts the user has established ("user prefers terse responses")
 *   - procedural: how-to recipes the agent has been taught ("when generating hooks, always …")
 *
 * The implementation is in-memory only — every process restart starts fresh.
 * Phase 6 with NeonDB swaps the storage layer; the interface stays.
 *
 * Why a class: a single instance held at the module level acts as the app-wide
 * memory. Tests can instantiate a fresh one to assert deterministic behavior.
 */

export type EpisodicEntry = {
  agent: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
};

export type SemanticFact = {
  key: string;
  value: string;
  /** Higher score wins on conflict during retrieval. */
  confidence: number;
  updatedAt: number;
};

export type ProceduralRecipe = {
  id: string;
  agent: string;
  /** Human-readable rule. */
  instruction: string;
  createdAt: number;
};

export class MemoryManager {
  private episodic: EpisodicEntry[] = [];
  private semantic = new Map<string, SemanticFact>();
  private procedural = new Map<string, ProceduralRecipe>();

  // ---- Episodic ---------------------------------------------------------

  appendEpisodic(entry: Omit<EpisodicEntry, "timestamp">): void {
    this.episodic.push({ ...entry, timestamp: Date.now() });
    // Cap at a reasonable in-memory size. The newest entries are always kept.
    if (this.episodic.length > 500) {
      this.episodic = this.episodic.slice(-500);
    }
  }

  /** Most recent N episodic entries for a given agent, oldest → newest. */
  recentEpisodic(agent: string, n = 10): EpisodicEntry[] {
    return this.episodic.filter((e) => e.agent === agent).slice(-n);
  }

  // ---- Semantic ---------------------------------------------------------

  setFact(key: string, value: string, confidence = 0.8): void {
    const existing = this.semantic.get(key);
    if (existing && existing.confidence > confidence) return; // don't downgrade
    this.semantic.set(key, {
      key,
      value,
      confidence,
      updatedAt: Date.now(),
    });
  }

  getFact(key: string): SemanticFact | undefined {
    return this.semantic.get(key);
  }

  listFacts(): SemanticFact[] {
    return Array.from(this.semantic.values()).sort((a, b) =>
      a.key.localeCompare(b.key)
    );
  }

  // ---- Procedural -------------------------------------------------------

  teachRecipe(agent: string, instruction: string): ProceduralRecipe {
    const id = `${agent}:${this.procedural.size + 1}`;
    const recipe: ProceduralRecipe = {
      id,
      agent,
      instruction,
      createdAt: Date.now(),
    };
    this.procedural.set(id, recipe);
    return recipe;
  }

  recipesFor(agent: string): ProceduralRecipe[] {
    return Array.from(this.procedural.values()).filter((r) => r.agent === agent);
  }

  // ---- Bulk export (useful for migration to a real store later) ---------

  snapshot() {
    return {
      episodic: [...this.episodic],
      semantic: Array.from(this.semantic.values()),
      procedural: Array.from(this.procedural.values()),
    };
  }

  clear(): void {
    this.episodic = [];
    this.semantic.clear();
    this.procedural.clear();
  }
}

/** App-wide singleton. Replace with a per-request instance if multi-tenant. */
export const memory = new MemoryManager();
