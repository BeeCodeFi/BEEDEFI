import {
  Cpu,
  Database,
  KeyRound,
  Server,
  Layers,
  ExternalLink,
  GitBranch,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { isLiveAiConfigured } from "@/lib/ai/client";
import { getMemoryStatsAction } from "@/lib/ai/actions";
import { BEECODEFI_URL, BEECODEFI_USER_ID } from "@/lib/beecodefi";
import { ClearMemoryButton } from "@/components/settings/ClearMemoryButton";

/**
 * /settings — workspace configuration surface. Server component reads runtime
 * state (env-var presence, memory counts) and renders it as plain panels. The
 * only interactive piece is the Clear-memory button (its own client island).
 *
 * Nothing here writes config. That's intentional — provider keys live in
 * .env.local and are managed outside the app; we surface their status rather
 * than make them editable in the UI (which would be a footgun for secrets).
 */
export default async function SettingsPage() {
  const liveAi = isLiveAiConfigured();
  const memStats = await getMemoryStatsAction();

  return (
    <div className="relative min-h-screen px-8 lg:px-16 pt-12 pb-32">
      <header className="mb-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-ink-3 mb-2">
          Workspace · settings
        </p>
        <h1 className="font-display text-display-lg font-light tracking-tight text-ink-1">
          <span className="text-signal-grad">Wiring</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ink-2 font-body leading-relaxed">
          Status of the integrations that make BEEDEFI feel alive. Keys and
          connection strings live in <code className="font-mono text-ink-1">.env.local</code> —
          this page reflects what&rsquo;s configured, not where to put it.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI PROVIDER */}
        <Card accent="magenta" interactive={false}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-signal-magenta" strokeWidth={1.5} />
              <CardTitle>AI provider</CardTitle>
            </div>
            <StatusBadge live={liveAi} liveLabel="Live · OpenRouter" stubLabel="Stub" />
          </CardHeader>
          <KeyValue
            k="Provider"
            v="OpenRouter"
            sub="Free models rotate — see openrouter.ai/models"
          />
          <KeyValue
            k="OPENROUTER_API_KEY"
            v={liveAi ? "configured" : "not set"}
            sub={
              liveAi
                ? "Live generations enabled for /studio."
                : "Add to .env.local to enable live generations. Stub responses are used until then."
            }
            tone={liveAi ? "cyan" : "amber"}
          />
          <KeyValue
            k="Default model"
            v="openrouter/auto"
            sub="Override per-call via the generators in lib/ai/."
          />
        </Card>

        {/* DATA SOURCES */}
        <Card accent="cyan" interactive={false}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-signal-cyan" strokeWidth={1.5} />
              <CardTitle>Data sources</CardTitle>
            </div>
            <StatusBadge live={false} liveLabel="Connected" stubLabel="Stubbed" />
          </CardHeader>
          <KeyValue
            k="BeeCodeFi (Learning)"
            v={BEECODEFI_URL}
            sub={`Single-user · ${BEECODEFI_USER_ID}. Reads are stubbed until BeeCodeFi finishes its SQLite → NeonDB migration.`}
            external={BEECODEFI_URL}
          />
          <KeyValue
            k="DATABASE_URL"
            v="not set"
            sub="When NeonDB is ready, drop the connection string here and the snapshot getters become real queries."
            tone="amber"
          />
          <KeyValue
            k="Second Brain"
            v="local mock"
            sub="Notes + links + journal captures are session-local. Persistence shares the same Neon path."
          />
        </Card>

        {/* MEMORY */}
        <Card accent="violet" interactive={false}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-signal-violet" strokeWidth={1.5} />
              <CardTitle>Agent memory</CardTitle>
            </div>
            <ClearMemoryButton />
          </CardHeader>
          <p className="text-[11px] text-ink-2 leading-relaxed mb-4">
            Three-layer store backing every agent call. In-memory only today;
            survives until the process restarts.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <MemTile label="Episodic"   value={memStats.episodic}   sub="conversations" />
            <MemTile label="Semantic"   value={memStats.semantic}   sub="facts"         />
            <MemTile label="Procedural" value={memStats.procedural} sub="recipes"       />
          </div>
        </Card>

        {/* ABOUT */}
        <Card accent="amber" interactive={false}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-signal-amber" strokeWidth={1.5} />
              <CardTitle>About</CardTitle>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
              Local dev
            </span>
          </CardHeader>
          <KeyValue k="Version"  v="0.1.0"            sub="package.json" />
          <KeyValue k="Runtime"  v="Next.js 15"       sub="App Router · React 19 · TypeScript strict" />
          <KeyValue k="3D"       v="R3F 9 · drei 10"  sub="Hardware-accelerated; capability-gated fallbacks" />
          <KeyValue
            k="Repository"
            v="github.com/BeeCodeFi/BEEDEFI"
            sub="Source + roadmap"
            external="https://github.com/BeeCodeFi/BEEDEFI"
            icon={GitBranch}
          />
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function StatusBadge({
  live,
  liveLabel,
  stubLabel,
}: {
  live: boolean;
  liveLabel: string;
  stubLabel: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-edge">
      <span
        className={
          live
            ? "h-1.5 w-1.5 rounded-full bg-signal-cyan animate-pulse"
            : "h-1.5 w-1.5 rounded-full bg-signal-amber"
        }
      />
      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink-2">
        {live ? liveLabel : stubLabel}
      </span>
    </span>
  );
}

function KeyValue({
  k,
  v,
  sub,
  tone,
  external,
  icon: Icon = KeyRound,
}: {
  k: string;
  v: string;
  sub?: string;
  tone?: "cyan" | "amber";
  external?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  const valueClass =
    tone === "cyan"  ? "text-signal-cyan" :
    tone === "amber" ? "text-signal-amber" :
                       "text-ink-1";
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-edge last:border-b-0">
      <Icon className="w-3.5 h-3.5 text-ink-3 mt-0.5 shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3">{k}</p>
        <div className="flex items-center gap-2">
          <p className={`text-[13px] font-mono tabular-nums truncate ${valueClass}`}>
            {v}
          </p>
          {external && (
            <a
              href={external}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-3 hover:text-ink-1 transition-colors"
              aria-label="Open external link"
            >
              <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
            </a>
          )}
        </div>
        {sub && (
          <p className="text-[11px] text-ink-2 leading-snug mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function MemTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <GlassPanel className="p-3">
      <p className="text-[10px] font-mono uppercase tracking-wider text-ink-3 mb-1">
        {label}
      </p>
      <p className="font-display font-light text-2xl tabular-nums text-ink-1 leading-tight">
        {value}
      </p>
      <p className="text-[10px] font-mono text-ink-3 mt-0.5">{sub}</p>
    </GlassPanel>
  );
}
