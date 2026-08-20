"use client";

import React, { useEffect, useRef, useState } from "react";
import { ClipboardPaste, Globe, ImagePlus, Loader2, Sparkles, X } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { fileToCompressedDataUrl } from "@/lib/images/compress";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

function imageFromClipboard(data: DataTransfer | null) {
  if (!data) return undefined;
  const item = Array.from(data.items || []).find((entry) => entry.type.startsWith("image/"));
  if (item) return item.getAsFile() || undefined;
  return Array.from(data.files || []).find((file) => file.type.startsWith("image/"));
}

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
  const dropRef = useRef<HTMLDivElement>(null);
  const [pasteHint, setPasteHint] = useState("");
  const busy = isScraping || isGenerating;

  const onFile = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPasteHint("");
    try {
      setUploadedImage(await fileToCompressedDataUrl(file));
    } catch {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(String(reader.result || ""));
      reader.readAsDataURL(file);
    }
  };

  const pasteFromEvent = (event: ClipboardEvent | React.ClipboardEvent) => {
    const file = imageFromClipboard(event.clipboardData);
    if (!file) return false;
    event.preventDefault();
    if (inputMode !== "screenshot") setInputMode("screenshot");
    void onFile(file);
    return true;
  };

  const pasteFromClipboard = async () => {
    setInputMode("screenshot");
    try {
      if (navigator.clipboard?.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const type = item.types.find((value) => value.startsWith("image/"));
          if (!type) continue;
          const blob = await item.getType(type);
          await onFile(new File([blob], "pasted-screenshot.png", { type: blob.type || "image/png" }));
          return;
        }
      }
      setPasteHint("No image in the clipboard. Copy a screenshot, then press Ctrl+V or ⌘V.");
      dropRef.current?.focus();
    } catch {
      setPasteHint("Press Ctrl+V or ⌘V to paste a screenshot here.");
      dropRef.current?.focus();
    }
  };

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || Boolean(target?.isContentEditable);
      if (typing && inputMode === "url") return;
      pasteFromEvent(event);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [inputMode]);

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
                  className="rounded-md p-1 text-faint hover:bg-wash hover:text-ink"
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
                  <button
                    type="button"
                    onClick={() => void pasteFromClipboard()}
                    className="rounded-lg border border-stroke bg-surface/90 px-2.5 py-1 text-xs text-ink hover:bg-surface-hover"
                  >
                    Paste
                  </button>
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
              <div
                ref={dropRef}
                tabIndex={0}
                onPaste={pasteFromEvent}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  onFile(event.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "flex h-40 flex-col items-center justify-center rounded-[14px] border border-dashed border-stroke bg-canvas px-4 text-center outline-none transition-colors duration-200",
                  "hover:border-stroke-strong hover:bg-white/[0.02] focus:border-stroke-strong"
                )}
              >
                <ImagePlus className="mb-2 h-5 w-5 text-muted" />
                <span className="text-sm text-ink">Drop, upload, or paste a screenshot</span>
                <span className="mt-1 text-xs text-faint">PNG or JPG — click, drop, or press Ctrl+V / ⌘V</span>
                <div className="mt-3 flex items-center gap-2">
                  <label className="cursor-pointer rounded-lg border border-stroke px-2.5 py-1 text-xs text-ink hover:border-stroke-strong hover:bg-wash">
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => onFile(event.target.files?.[0])}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void pasteFromClipboard()}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stroke px-2.5 py-1 text-xs text-ink hover:border-stroke-strong hover:bg-wash"
                  >
                    <ClipboardPaste className="h-3.5 w-3.5" />
                    Paste
                  </button>
                </div>
                {pasteHint && <p className="mt-2 text-[11px] text-muted">{pasteHint}</p>}
              </div>
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
      className="generate-shine inline-flex h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-accent px-6 text-sm font-semibold text-white shadow-[0_14px_36px_-16px_rgba(168,85,247,0.95)] transition-all duration-200 hover:bg-[#8b6dff] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {busy ? "Working" : "Generate"}
    </button>
  );
}
