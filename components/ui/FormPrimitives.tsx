"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Save, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Shared form primitives used by inline data-entry panels           */
/* ------------------------------------------------------------------ */

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink-3">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full bg-white/[0.03] border border-edge rounded-lg px-3 py-2 text-sm text-ink-1 placeholder:text-ink-3",
        "focus:outline-none focus:border-signal-cyan/50 transition-colors",
        props.className
      )}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full bg-white/[0.03] border border-edge rounded-lg px-3 py-2 text-sm text-ink-1 placeholder:text-ink-3 resize-y min-h-[80px]",
        "focus:outline-none focus:border-signal-cyan/50 transition-colors",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      {...props}
      className={cn(
        "w-full bg-white/[0.03] border border-edge rounded-lg px-3 py-2 text-sm text-ink-1",
        "focus:outline-none focus:border-signal-cyan/50 transition-colors",
        props.className
      )}
    />
  );
}

export function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-signal-cyan/10 border border-signal-cyan/40 hover:bg-signal-cyan/20 transition-colors"
    >
      <Save className="w-3.5 h-3.5 text-signal-cyan" strokeWidth={2} />
      <span className="text-xs font-mono uppercase tracking-wider text-signal-cyan">Save</span>
    </button>
  );
}

export function AddButton({ onClick, label = "Add" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-edge hover:border-signal-cyan/40 hover:bg-signal-cyan/5 transition-colors"
    >
      <Plus className="w-3.5 h-3.5 text-signal-cyan" strokeWidth={2} />
      <span className="text-xs font-mono uppercase tracking-wider text-ink-2">{label}</span>
    </button>
  );
}

export function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 rounded-md hover:bg-signal-amber/10 transition-colors"
      aria-label="Remove"
    >
      <Trash2 className="w-3.5 h-3.5 text-signal-amber" strokeWidth={1.5} />
    </button>
  );
}

export function SaveToast({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="fixed top-6 right-6 z-[200] inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-signal-cyan/20 border border-signal-cyan/50 shadow-glow-cyan-sm"
    >
      <Check className="w-4 h-4 text-signal-cyan" strokeWidth={2} />
      <span className="text-xs font-mono uppercase tracking-wider text-signal-cyan">
        Saved to local storage
      </span>
    </motion.div>
  );
}

/** Hook-friendly saved flash helper */
export function useSaveFlash() {
  const [saved, setSaved] = useState(false);
  const showSaved = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);
  return { saved, showSaved };
}
