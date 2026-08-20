"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { CommandInput } from "@/components/ui/CommandInput";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/lib/app-context";

const SUGGESTIONS = [
  "Make it more minimal",
  "Improve mobile layout",
  "Add subtle animations",
  "Match original more closely",
  "Increase spacing",
];

export function RefinementBar() {
  const {
    handleIterate,
    isIterating,
    generatedCode,
    pendingChange,
    keepPendingChange,
    discardPendingChange,
  } = useApp();
  const [value, setValue] = useState("");

  const submit = (instruction = value) => {
    if (!instruction.trim()) return;
    handleIterate(instruction);
    setValue("");
  };

  return (
    <div className="rounded-[16px] border border-stroke bg-surface/90 p-3 shadow-panel backdrop-blur-md">
      {pendingChange ? (
        <div className="mb-3 flex flex-col gap-2 rounded-[12px] border border-accent/30 bg-accent-dim px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-[12px] leading-5 text-ink">
            Previewing <span className="font-medium">{pendingChange.instruction}</span>. Keep this
            change?
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={discardPendingChange}>
              <X className="h-3.5 w-3.5" />
              Discard
            </Button>
            <Button type="button" size="sm" onClick={keepPendingChange}>
              <Check className="h-3.5 w-3.5" />
              Keep
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isIterating || !generatedCode}
              onClick={() => submit(suggestion)}
              className="rounded-lg border border-stroke px-2.5 py-1 text-[11px] text-muted transition-colors duration-200 hover:border-stroke-strong hover:text-ink disabled:opacity-40"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      <CommandInput
        value={value}
        onChange={setValue}
        onSubmit={() => submit()}
        disabled={!generatedCode}
        loading={isIterating}
        placeholder={
          isIterating
            ? "Updating preview…"
            : pendingChange
              ? "Change stays until you Keep or Discard"
              : undefined
        }
      />
    </div>
  );
}
