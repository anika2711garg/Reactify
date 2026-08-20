"use client";

import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export function SourcePanel() {
  const { screenshot, uploadedImage, sections, selectedSection, handleSelectSection, isGenerating } = useApp();
  const source = screenshot || uploadedImage;
  const [zoom, setZoom] = useState(1);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader>
        <span className="text-xs font-medium text-ink">Source</span>
        <div className="flex items-center gap-1">
          <IconButton label="Zoom out" side="bottom" onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}>
            <Minus className="h-3.5 w-3.5" />
          </IconButton>
          <span className="w-10 text-center text-[11px] text-muted">{Math.round(zoom * 100)}%</span>
          <IconButton label="Zoom in" side="bottom" onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>
            <Plus className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </PanelHeader>

      <div className="min-h-0 flex-1 overflow-auto bg-canvas p-3">
        <div className="relative mx-auto origin-top" style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%` }}>
          {source ? (
            <img src={source} alt="Original interface" className="w-full rounded-lg border border-stroke" />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-stroke text-sm text-muted">
              Capture appears after generation starts
            </div>
          )}

          {sections.map((section, index) => {
            const active = selectedSection?.id === section.id || hovered === section.id;
            return (
              <button
                key={section.id}
                type="button"
                disabled={isGenerating}
                onMouseEnter={() => setHovered(section.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleSelectSection(section)}
                className={cn(
                  "absolute left-[6%] right-[6%] overflow-hidden rounded-lg border text-left transition-all duration-300",
                  active
                    ? "border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(124,92,255,0.35)]"
                    : "border-transparent bg-transparent hover:border-stroke-strong hover:bg-wash"
                )}
                style={{
                  top: `${8 + index * Math.max(12, 70 / Math.max(sections.length, 1))}%`,
                  height: `${Math.max(10, 68 / Math.max(sections.length, 1))}%`,
                }}
              >
                <span className="m-2 inline-flex rounded-md bg-canvas/80 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-accent-soft">
                  {section.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
