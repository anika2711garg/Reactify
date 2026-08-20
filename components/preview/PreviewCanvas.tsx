"use client";

import React, { useEffect, useRef, useState } from "react";
import { Columns2, ExternalLink, Monitor, RefreshCw, Smartphone, Tablet } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { LivePreview } from "@/components/preview/LivePreview";
import { useApp } from "@/lib/app-context";
import { presetFromWidth, presetWidth, VIEWPORT_PRESETS } from "@/lib/preview/viewports";
import type { PreviewCompare } from "@/lib/types";

const ICONS: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="h-4 w-4" />,
  "large-mobile": <Smartphone className="h-4 w-4" />,
  tablet: <Tablet className="h-4 w-4" />,
  laptop: <Monitor className="h-4 w-4" />,
  desktop: <Monitor className="h-4 w-4" />,
  full: <Monitor className="h-4 w-4" />,
};

export function PreviewCanvas() {
  const {
    generatedCode,
    screenshot,
    uploadedImage,
    isGenerating,
    isIterating,
    url,
    selectedElementId,
    setSelectedElementId,
    viewportPreset,
    setViewportPreset,
    viewportWidth,
    setViewportWidth,
  } = useApp();
  const source = screenshot || uploadedImage;
  const [compare, setCompare] = useState<PreviewCompare>("generated");
  const [split, setSplit] = useState(50);
  const [revision, setRevision] = useState(0);
  const [available, setAvailable] = useState(1200);
  const [customInput, setCustomInput] = useState(String(viewportWidth));
  const shellRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = shellRef.current;
    if (!node) return;
    const update = () => setAvailable(Math.max(320, Math.floor(node.clientWidth - 24)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const frameWidth = presetWidth(viewportPreset, viewportWidth, available);

  useEffect(() => {
    setCustomInput(String(Math.round(frameWidth)));
  }, [frameWidth]);

  const applyWidth = (width: number) => {
    const next = Math.max(280, Math.min(width, available));
    setViewportWidth(next);
    setViewportPreset(presetFromWidth(next, available));
  };

  const startFrameResize = (event: React.MouseEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = frameWidth;
    const move = (moveEvent: MouseEvent) => {
      applyWidth(startWidth + (moveEvent.clientX - startX));
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const activeLabel =
    viewportPreset === "custom"
      ? "Custom"
      : VIEWPORT_PRESETS.find((item) => item.id === viewportPreset)?.label || "Viewport";

  return (
    <div ref={shellRef} className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-stroke bg-surface p-1">
          {VIEWPORT_PRESETS.map((item) => (
            <IconButton
              key={item.id}
              label={`${item.label}${item.width ? ` ${item.width}px` : ""}`}
              side="bottom"
              compact
              active={viewportPreset === item.id}
              onClick={() => {
                setViewportPreset(item.id);
                if (item.width) setViewportWidth(item.width);
              }}
            >
              {ICONS[item.id]}
            </IconButton>
          ))}
          <label className="ml-1 flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] text-muted">
            <span>W</span>
            <input
              type="number"
              min={280}
              max={available}
              value={customInput}
              aria-label="Custom viewport width"
              onChange={(event) => setCustomInput(event.target.value)}
              onBlur={() => applyWidth(Number(customInput) || frameWidth)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyWidth(Number(customInput) || frameWidth);
              }}
              className="w-14 bg-transparent text-ink outline-none"
            />
            <span>px</span>
          </label>
        </div>

        <div className="flex items-center gap-1">
          <span className="mr-1 rounded-md border border-stroke px-2 py-1 text-[11px] text-muted">
            {Math.round(frameWidth)}px · {activeLabel}
          </span>
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
          className="relative flex h-full max-h-full flex-col overflow-hidden rounded-[16px] border border-stroke bg-surface-raised shadow-float"
          style={{ width: frameWidth, maxWidth: "100%" }}
        >
          <div className="flex h-9 items-center gap-2 border-b border-stroke px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <div className="ml-2 h-5 flex-1 rounded-md bg-wash text-center text-[10px] leading-5 text-faint">
              {Math.round(frameWidth)}px preview
            </div>
          </div>

          <div ref={dragRef} className="relative min-h-0 flex-1 bg-white">
            {generatedCode ? (
              <LivePreview
                key={`${revision}-${generatedCode.length}-${generatedCode.slice(0, 40)}`}
                code={generatedCode}
                selectedPath={selectedElementId}
                onSelectPath={setSelectedElementId}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-canvas text-sm text-muted">
                Select a section to generate
              </div>
            )}

            {compare === "compare" && source && (
              <>
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
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

          <button
            type="button"
            aria-label="Resize preview width"
            onMouseDown={startFrameResize}
            className="absolute right-0 top-9 bottom-0 z-20 w-2 cursor-ew-resize hover:bg-accent/30"
          />
        </div>
      </div>
    </div>
  );
}
