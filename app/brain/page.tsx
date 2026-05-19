import { getBrainSnapshot } from "@/lib/brain";
import { BrainShell } from "@/components/brain/BrainShell";

/**
 * /brain — second-brain dashboard. Server component does the initial data fetch
 * (mocked for now) and hands off to a single client island that manages the
 * interactive state. Wire-up for Phase 6 (NeonDB) is just a query body change
 * inside getBrainSnapshot.
 */
export default async function BrainPage() {
  const snapshot = await getBrainSnapshot();

  return (
    <div className="relative min-h-screen px-8 lg:px-16 pt-12 pb-32">
      {/* HEADER */}
      <header className="mb-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-signal-violet mb-2">
          Phase 04 · Second brain
        </p>
        <h1 className="font-display text-display-lg font-light tracking-tight text-ink-1">
          Your <span className="text-signal-grad">second brain</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-ink-2 font-body leading-relaxed">
          Every note you&rsquo;ve kept, in one living graph. Hover any node to
          trace its connections; capture new thinking in the journal below and
          watch it land in the network.
        </p>
      </header>

      <BrainShell initial={snapshot} />
    </div>
  );
}
