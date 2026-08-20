"use client";

import React, { useRef, useState } from "react";
import { Columns2, ExternalLink, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { LivePreview } from "@/components/preview/LivePreview";
import { useApp } from "@/lib/app-context";
import type { PreviewCompare, Viewport } from "@/lib/types";

const VIEWPORTS: { id: Viewport; width: string; icon: React.ReactNode; label: string }[] = [
  { id: "desktop", width: "100%", icon: <Monitor className="h-4 w-4" />, label: "Desktop" },
  { id: "tablet", width: "768px", icon: <Tablet className="h-4 w-4" />, label: "Tablet" },
  { id: "mobile", width: "390px", icon: <Smartphone className="h-4 w-4" />, label: "Mobile" },
];

export function PreviewCanvas() {
  const { generatedCode, screenshot, uploadedImage, isGenerating, isIterating, url } = useApp();
  const source = screenshot || uploadedImage;
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [compare, setCompare] = useState<PreviewCompare>("generated");
  const [split, setSplit] = useState(50);
  const [revision, setRevision] = useState(0);
  const dragRef = useRef<HTMLDivElement>(null);

  const frameWidth = VIEWPORTS.find((item) => item.id === viewport)?.width || "100%";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 items-center justify-between px-2">
        <div className="flex items-center gap-1 rounded-xl border border-stroke bg-surface p-1">
          {VIEWPORTS.map((item) => (
            <IconButton
              key={item.id}
              label={item.label}
              side="bottom"
              compact
              active={viewport === item.id}
              onClick={() => setViewport(item.id)}
            >
              {item.icon}
            </IconButton>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <IconButton label="Refresh preview" side="bottom" compact onClick={() => setRevision((value) => value + 1)}>
            <RefreshCw className="h-4 w-4" />
          </IconButton>
          <IconButton
            label="Open original"
            side="bottom"
            compact
            onClick={() => {
              if (url.startsWith("http")) {
                window.open(url, "_blank", "noreferrer");
                return;
              }
              if (source) window.open(source, "_blank", "noreferrer");
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </IconButton>
          <IconButton
            label="Compare original"
            side="bottom"
            compact
            active={compare !== "generated"}
            onClick={() => setCompare((value) => (value === "compare" ? "generated" : "compare"))}
          >
            <Columns2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center p-3 md:p-5">
        <div
          className="relative flex h-full max-h-full flex-col overflow-hidden rounded-[16px] border border-stroke bg-surface-raised shadow-float transition-[width] duration-300 ease-out"
          style={{ width: frameWidth, maxWidth: "100%" }}
        >
          <div className="flex h-9 items-center gap-2 border-b border-stroke px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <div className="ml-2 h-5 flex-1 rounded-md bg-white/5 text-center text-[10px] leading-5 text-faint">
              Generated preview
            </div>
          </div>

          <div ref={dragRef} className="relative min-h-0 flex-1 bg-white">
            {generatedCode ? (
              <LivePreview key={revision} code={generatedCode} />
            ) : (
              <div className="flex h-full items-center justify-center bg-canvas text-sm text-muted">
                Select a section to generate
              </div>
            )}

            {compare === "compare" && source && (
              <>
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
                >
                  <img src={source} alt="Original" className="h-full w-full object-cover object-top" />
                </div>
                <div
                  className="absolute top-0 z-10 h-full w-px cursor-ew-resize bg-accent"
                  style={{ left: `${split}%` }}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    const move = (moveEvent: MouseEvent) => {
                      if (!dragRef.current) return;
                      const bounds = dragRef.current.getBoundingClientRect();
                      const next = ((moveEvent.clientX - bounds.left) / bounds.width) * 100;
                      setSplit(Math.min(86, Math.max(14, next)));
                    };
                    const up = () => {
                      window.removeEventListener("mousemove", move);
                      window.removeEventListener("mouseup", up);
                    };
                    window.addEventListener("mousemove", move);
                    window.addEventListener("mouseup", up);
                  }}
                >
                  <span className="absolute left-1/2 top-1/2 h-8 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-canvas" />
                </div>
              </>
            )}

            {(isGenerating || isIterating) && (
              <div className="absolute inset-0 bg-canvas/20">
                <div className="absolute inset-x-0 top-0 h-full w-1/3 shimmer" />
                <div className="absolute inset-6 rounded-xl border border-accent/40" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
