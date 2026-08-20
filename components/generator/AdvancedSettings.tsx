"use client";

import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { AdvancedOptions } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AdvancedSettingsProps {
  value: AdvancedOptions;
  onChange: (value: AdvancedOptions) => void;
  alwaysOpen?: boolean;
}

const FIELDS: {
  key: keyof AdvancedOptions;
  label: string;
  options: { value: AdvancedOptions[keyof AdvancedOptions]; label: string }[];
}[] = [
  {
    key: "framework",
    label: "Framework",
    options: [
      { value: "react-tailwind", label: "React + Tailwind" },
      { value: "next", label: "Next.js" },
    ],
  },
  {
    key: "responsive",
    label: "Responsive behavior",
    options: [
      { value: "mobile-first", label: "Mobile first" },
      { value: "desktop-first", label: "Desktop first" },
      { value: "fluid", label: "Fluid" },
    ],
  },
  {
    key: "granularity",
    label: "Component granularity",
    options: [
      { value: "section", label: "Section" },
      { value: "page", label: "Page" },
      { value: "atomic", label: "Atomic" },
    ],
  },
];

export function AdvancedSettings({ value, onChange, alwaysOpen = false }: AdvancedSettingsProps) {
  const [open, setOpen] = useState(alwaysOpen);

  return (
    <div className="w-full max-w-xl">
      {!alwaysOpen && (
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="mx-auto flex items-center gap-2 text-xs text-muted transition-colors duration-200 hover:text-ink"
          aria-expanded={open}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Advanced settings
        </button>
      )}

      <div
        className={cn(
          "grid transition-all duration-300",
          open ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="grid gap-3 rounded-2xl border border-stroke bg-surface/80 p-4 sm:grid-cols-3">
            {FIELDS.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-faint">
                  {field.label}
                </span>
                <select
                  value={value[field.key]}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      [field.key]: event.target.value,
                    })
                  }
                  className="h-9 w-full rounded-lg border border-stroke bg-canvas px-2 text-xs text-ink outline-none focus:border-stroke-strong"
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
