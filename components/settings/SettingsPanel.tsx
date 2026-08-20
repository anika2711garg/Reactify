"use client";

import React from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { AdvancedSettings } from "@/components/generator/AdvancedSettings";
import { useApp } from "@/lib/app-context";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function SettingsPanel() {
  const { advanced, setAdvanced, history } = useApp();
  const { theme, setTheme } = useTheme();

  return (
    <div className="h-full overflow-auto px-4 py-8 md:px-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-3 text-sm text-muted">
          These defaults shape how Reactify writes components. They are stored locally in this browser.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-[16px] border border-stroke bg-surface p-5 shadow-panel"
        >
          <h2 className="text-sm font-medium text-ink">Appearance</h2>
          <p className="mt-2 text-sm text-muted">Switch between a dark laboratory and a bright studio theme.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { id: "dark" as const, label: "Dark", copy: "Near-black canvas, violet light", icon: Moon },
              { id: "light" as const, label: "Light", copy: "Soft lavender studio, high contrast", icon: Sun },
            ].map((option) => {
              const selected = theme === option.id;
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-all duration-300",
                    selected ? "illuminated" : "border-stroke hover:border-stroke-strong hover:bg-wash"
                  )}
                >
                  <Icon className="mb-3 h-4 w-4 text-accent" />
                  <p className="text-sm font-medium text-ink">{option.label}</p>
                  <p className="mt-1 text-xs text-muted">{option.copy}</p>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="mt-4 rounded-[16px] border border-stroke bg-surface p-5">
          <h2 className="text-sm font-medium text-ink">Generation defaults</h2>
          <div className="mt-4">
            <AdvancedSettings value={advanced} onChange={setAdvanced} alwaysOpen />
          </div>
        </div>

        <div className="mt-4 rounded-[16px] border border-stroke bg-surface p-5">
          <h2 className="text-sm font-medium text-ink">Local usage</h2>
          <p className="mt-2 text-sm text-muted">{history.length} generations stored on this device.</p>
        </div>
      </div>
    </div>
  );
}
