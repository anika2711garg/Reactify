"use client";

import React, { useRef } from "react";
import { Globe, ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export function InputCommand() {
  const {
    inputMode,
    setInputMode,
    url,
    setUrl,
    uploadedImage,
    setUploadedImage,
    handleGenerate,
    isScraping,
    isGenerating,
  } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = isScraping || isGenerating;

  const onFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setUploadedImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="glass-panel rounded-[18px] p-2">
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <Tabs
            value={inputMode}
            onChange={setInputMode}
            tabs={[
              { id: "url", label: "URL", icon: <Globe className="h-3.5 w-3.5" /> },
              { id: "screenshot", label: "Screenshot", icon: <ImagePlus className="h-3.5 w-3.5" /> },
            ]}
          />
          <span className="hidden text-[11px] text-faint sm:inline">Website → analysis → React</span>
        </div>

        {inputMode === "url" ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex h-14 min-w-0 flex-1 items-center gap-3 rounded-[14px] bg-canvas px-4">
              <Globe className="h-4 w-4 shrink-0 text-faint" />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleGenerate();
                }}
                placeholder="https://linear.app"
                disabled={busy}
                className="h-full w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => {
                    setUrl("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear URL"
                  className="rounded-md p-1 text-faint hover:bg-white/5 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <GenerateButton busy={busy} disabled={!url} onClick={handleGenerate} />
          </div>
        ) : (
          <div className="space-y-2">
            {uploadedImage ? (
              <div className="relative overflow-hidden rounded-[14px] bg-canvas">
                <img src={uploadedImage} alt="Uploaded interface" className="max-h-64 w-full object-contain" />
                <div className="absolute right-3 top-3 flex gap-2">
                  <label className="rounded-lg border border-stroke bg-surface/90 px-2.5 py-1 text-xs text-ink hover:bg-surface-hover">
                    Replace
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => onFile(event.target.files?.[0])}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setUploadedImage("")}
                    className="rounded-lg border border-stroke bg-surface/90 px-2.5 py-1 text-xs text-ink hover:bg-surface-hover"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  onFile(event.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "flex h-36 cursor-pointer flex-col items-center justify-center rounded-[14px] border border-dashed border-stroke bg-canvas text-center transition-colors duration-200",
                  "hover:border-stroke-strong hover:bg-white/[0.02]"
                )}
              >
                <ImagePlus className="mb-2 h-5 w-5 text-muted" />
                <span className="text-sm text-ink">Drop a screenshot</span>
                <span className="mt-1 text-xs text-faint">PNG or JPG of any interface</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => onFile(event.target.files?.[0])}
                />
              </label>
            )}
            <div className="flex justify-end">
              <GenerateButton busy={busy} disabled={!uploadedImage} onClick={handleGenerate} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GenerateButton({
  busy,
  disabled,
  onClick,
}: {
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-accent px-6 text-sm font-semibold text-white shadow-[0_14px_36px_-16px_rgba(124,92,255,0.95)] transition-all duration-200 hover:bg-[#8b6dff] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {busy ? "Working" : "Generate"}
    </button>
  );
}
