"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Zap, Image as ImageIcon, BarChart3 } from "lucide-react";
import { cn } from "@/lib/cn";
import { ScriptGenerator } from "./ScriptGenerator";
import { HookLab } from "./HookLab";
import { ThumbnailIdeation } from "./ThumbnailIdeation";
import { Analytics } from "./Analytics";
import type { StudioSnapshot } from "@/lib/studio";

/**
 * Tab shell for /studio. Four views, only one mounted at a time so the
 * (eventual) AI generators don't fire from inactive tabs.
 *
 * Tab state is local — refreshing resets to "scripts". That's fine for a
 * dashboard; we can persist into the URL search params later if it matters.
 */

type Tab = "scripts" | "hooks" | "thumbnails" | "analytics";

const TABS: Array<{
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accent: "cyan" | "magenta" | "amber" | "violet";
}> = [
  { id: "scripts",    label: "Scripts",    icon: FileText,  accent: "magenta" },
  { id: "hooks",      label: "Hooks",      icon: Zap,       accent: "cyan"    },
  { id: "thumbnails", label: "Thumbnails", icon: ImageIcon, accent: "violet"  },
  { id: "analytics",  label: "Analytics",  icon: BarChart3, accent: "amber"   },
];

const ACCENT_TEXT = {
  cyan: "text-signal-cyan",
  magenta: "text-signal-magenta",
  amber: "text-signal-amber",
  violet: "text-signal-violet",
} as const;

const ACCENT_BG = {
  cyan: "bg-signal-cyan/10 border-signal-cyan/40",
  magenta: "bg-signal-magenta/10 border-signal-magenta/40",
  amber: "bg-signal-amber/10 border-signal-amber/40",
  violet: "bg-signal-violet/10 border-signal-violet/40",
} as const;

export function StudioShell({ snapshot }: { snapshot: StudioSnapshot }) {
  const [tab, setTab] = useState<Tab>("scripts");

  return (
    <>
      {/* TAB STRIP */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                active
                  ? cn(ACCENT_BG[t.accent])
                  : "bg-white/[0.02] border-edge hover:border-edge-strong hover:bg-white/[0.04]"
              )}
            >
              {active && (
                <motion.span
                  layoutId="studio-tab-bar"
                  className={cn("absolute left-2 right-2 -bottom-px h-px", ACCENT_TEXT[t.accent])}
                  style={{ background: "currentColor" }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={cn("w-3.5 h-3.5", active ? ACCENT_TEXT[t.accent] : "text-ink-3")} strokeWidth={1.5} />
              <span className={cn(
                "text-xs font-mono uppercase tracking-wider",
                active ? ACCENT_TEXT[t.accent] : "text-ink-2"
              )}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {tab === "scripts"    && <ScriptGenerator drafts={snapshot.drafts} />}
        {tab === "hooks"      && <HookLab history={snapshot.hookHistory} />}
        {tab === "thumbnails" && <ThumbnailIdeation history={snapshot.thumbnailHistory} />}
        {tab === "analytics"  && <Analytics content={snapshot.content} />}
      </motion.div>
    </>
  );
}
