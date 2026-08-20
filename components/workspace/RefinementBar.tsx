"use client";

import React, { useState } from "react";
import { CommandInput } from "@/components/ui/CommandInput";
import { useApp } from "@/lib/app-context";

const SUGGESTIONS = [
  "Make it more minimal",
  "Improve mobile layout",
  "Add subtle animations",
  "Match original more closely",
  "Increase spacing",
];

export function RefinementBar() {
  const { handleIterate, isIterating, generatedCode } = useApp();
  const [value, setValue] = useState("");

  const submit = (instruction = value) => {
    if (!instruction.trim()) return;
    handleIterate(instruction);
    setValue("");
  };

  return (
    <div className="rounded-[16px] border border-stroke bg-surface/90 p-3 shadow-panel backdrop-blur-md">
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
      <CommandInput
        value={value}
        onChange={setValue}
        onSubmit={() => submit()}
        disabled={isIterating || !generatedCode}
        loading={isIterating}
      />
    </div>
  );
}
