"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Check } from "lucide-react";
import { clearMemoryAction } from "@/lib/ai/actions";

/**
 * Small interactive piece on the settings page — invokes the clear-memory
 * server action. Kept as its own client island so the rest of /settings stays
 * a server component.
 *
 * After clearing, calls router.refresh() so the surrounding server-rendered
 * stats reflect the new (zero) counts without a full page reload.
 */

export function ClearMemoryButton() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const run = () => {
    if (!confirmed) {
      setConfirmed(true);
      window.setTimeout(() => setConfirmed(false), 3000);
      return;
    }
    startTransition(async () => {
      await clearMemoryAction();
      setConfirmed(false);
      setDone(true);
      router.refresh();
      window.setTimeout(() => setDone(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={isPending}
      className={
        confirmed
          ? "inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-signal-amber/15 border border-signal-amber/50 hover:bg-signal-amber/25 transition-colors"
          : "inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.03] border border-edge hover:border-edge-strong transition-colors"
      }
    >
      {done ? (
        <Check className="w-3.5 h-3.5 text-signal-cyan" strokeWidth={2} />
      ) : (
        <Trash2
          className={
            confirmed
              ? "w-3.5 h-3.5 text-signal-amber"
              : "w-3.5 h-3.5 text-ink-3"
          }
          strokeWidth={1.5}
        />
      )}
      <span
        className={
          confirmed
            ? "text-[11px] font-mono uppercase tracking-wider text-signal-amber"
            : "text-[11px] font-mono uppercase tracking-wider text-ink-2"
        }
      >
        {done ? "Cleared" : confirmed ? "Confirm clear?" : "Clear memory"}
      </span>
    </button>
  );
}
