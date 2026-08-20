"use client";

import React from "react";
import { AdvancedSettings } from "@/components/generator/AdvancedSettings";
import { useApp } from "@/lib/app-context";

export function SettingsPanel() {
  const { advanced, setAdvanced, history } = useApp();

  return (
    <div className="h-full overflow-auto px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-3 text-sm text-muted">
          These defaults shape how Reactify writes components. They are stored locally in this browser.
        </p>

        <div className="mt-8 rounded-[16px] border border-stroke bg-surface p-5">
          <h2 className="text-sm font-medium text-ink">Generation defaults</h2>
          <div className="mt-4">
            <AdvancedSettings value={advanced} onChange={setAdvanced} alwaysOpen />
          </div>
        </div>

        <div className="mt-4 rounded-[16px] border border-stroke bg-surface p-5">
          <h2 className="text-sm font-medium text-ink">Appearance</h2>
          <p className="mt-2 text-sm text-muted">
            Reactify is designed as a dark laboratory. A light theme is intentionally omitted so the workspace stays consistent.
          </p>
        </div>

        <div className="mt-4 rounded-[16px] border border-stroke bg-surface p-5">
          <h2 className="text-sm font-medium text-ink">Local usage</h2>
          <p className="mt-2 text-sm text-muted">{history.length} generations stored on this device.</p>
        </div>
      </div>
    </div>
  );
}
