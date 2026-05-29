"use client";

import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TextArea, SaveToast, useSaveFlash } from "@/components/ui/FormPrimitives";
import { exportAllData, importAllData } from "@/lib/store";

export function BackupPanel() {
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const { saved, showSaved } = useSaveFlash();

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beedefi-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError(null);
    if (!importText.trim()) {
      setImportError("Paste JSON data first");
      return;
    }
    const success = importAllData(importText);
    if (success) {
      setImportText("");
      showSaved();
    } else {
      setImportError("Invalid JSON — could not parse");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <SaveToast visible={saved} />

      {/* Export */}
      <GlassPanel className="p-5">
        <h3 className="font-display text-lg text-ink-1 mb-2">Export</h3>
        <p className="text-[12px] text-ink-2 mb-4">
          Download all your BEEDEFI data as a single JSON file. Use this as a backup
          or to transfer data between browsers.
        </p>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-signal-cyan/10 border border-signal-cyan/40 hover:bg-signal-cyan/20 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-signal-cyan" strokeWidth={2} />
          <span className="text-xs font-mono uppercase tracking-wider text-signal-cyan">Export JSON</span>
        </button>
      </GlassPanel>

      {/* Import */}
      <GlassPanel className="p-5">
        <h3 className="font-display text-lg text-ink-1 mb-2">Import</h3>
        <p className="text-[12px] text-ink-2 mb-4">
          Paste a previously exported JSON to restore data. This will overwrite
          any existing data in localStorage for the sections present in the file.
        </p>
        <TextArea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="Paste exported JSON here..."
          className="mb-3 min-h-[120px] font-mono text-xs"
        />
        {importError && (
          <p className="text-[11px] text-signal-amber mb-3">{importError}</p>
        )}
        <button
          type="button"
          onClick={handleImport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-signal-amber/10 border border-signal-amber/40 hover:bg-signal-amber/20 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-signal-amber" strokeWidth={2} />
          <span className="text-xs font-mono uppercase tracking-wider text-signal-amber">Import JSON</span>
        </button>
      </GlassPanel>
    </div>
  );
}
