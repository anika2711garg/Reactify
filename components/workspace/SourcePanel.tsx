"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export function SourcePanel() {
  const { sections, selectedSection, handleSelectSection, isGenerating, screenshot, uploadedImage } = useApp();
  const source = screenshot || uploadedImage;

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader>
        <span className="text-xs font-medium text-ink">Page parts</span>
        <span className="text-[11px] text-faint">{sections.length}</span>
      </PanelHeader>

      <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
        {sections.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-stroke text-sm text-muted">
            Sections appear after the page is read.
          </div>
        ) : (
          sections.map((section) => {
            const active = selectedSection?.id === section.id;
            return (
              <button
                key={section.id}
                type="button"
                disabled={isGenerating}
                onClick={() => handleSelectSection(section)}
                className={cn(
                  "w-full rounded-xl border p-3 text-left transition-colors duration-200",
                  active ? "illuminated" : "border-stroke bg-canvas hover:border-stroke-strong hover:bg-wash"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-accent-soft">{section.type}</span>
                  <Sparkles className="h-3.5 w-3.5 text-faint" />
                </div>
                <p className="mt-1 text-sm font-medium text-ink">{section.name}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{section.previewText}</p>
              </button>
            );
          })
        )}

        {source && (
          <img src={source} alt="Captured page" className="mt-2 w-full rounded-lg border border-stroke object-cover" />
        )}
      </div>
    </Panel>
  );
}
