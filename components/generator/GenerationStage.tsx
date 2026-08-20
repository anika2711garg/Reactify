"use client";

import React from "react";
import { Check } from "lucide-react";
import { GENERATION_STAGES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GenerationStageProps {
  stage: number;
  screenshot?: string;
  sectionLabels?: string[];
}

export function GenerationStage({ stage, screenshot, sectionLabels = [] }: GenerationStageProps) {
  const labels = sectionLabels.length ? sectionLabels : ["Navbar", "Hero", "Features", "Pricing", "Footer"];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-[16px] border border-stroke bg-surface p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">Pipeline</p>
        <ol className="mt-5 space-y-3">
          {GENERATION_STAGES.map((label, index) => {
            const done = index < stage;
            const current = index === stage;
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border text-[11px]",
                    done && "border-success/40 bg-success/10 text-success",
                    current && "border-accent/50 bg-accent-dim text-ink pulse-soft",
                    !done && !current && "border-stroke text-faint"
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className={cn("text-sm", current ? "text-ink" : "text-muted")}>{label}</span>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="relative overflow-hidden rounded-[16px] border border-stroke bg-surface">
        {screenshot ? (
          <img src={screenshot} alt="Captured interface" className="h-full w-full object-cover object-top opacity-70" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent)]" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-canvas/10 via-transparent to-canvas/50" />
        <div className="scan-line pointer-events-none absolute inset-x-8 h-24 bg-gradient-to-b from-transparent via-accent/25 to-transparent" />

        {labels.slice(0, Math.min(labels.length, stage + 2)).map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="box-in absolute left-[8%] right-[8%] rounded-lg border border-accent/40 bg-accent/5"
            style={{
              top: `${12 + index * 16}%`,
              height: index === 1 ? "18%" : "12%",
              animationDelay: `${index * 80}ms`,
            }}
          >
            <span className="absolute left-2 top-2 rounded-md bg-canvas/80 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-accent-soft">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
