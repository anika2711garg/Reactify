"use client";

import React from "react";
import { STYLE_OPTIONS, type StyleName } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StyleSelectorProps {
  value: StyleName;
  onChange: (style: StyleName) => void;
}

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {STYLE_OPTIONS.map((option) => {
        const selected = option.name === value;
        return (
          <button
            key={option.name}
            type="button"
            onClick={() => onChange(option.name)}
            title={option.description}
            className={cn(
              "min-w-[92px] rounded-[12px] border px-3.5 py-2 text-sm transition-all duration-300",
              selected
                ? "illuminated text-ink"
                : "border-stroke bg-transparent text-muted hover:border-stroke-strong hover:text-ink"
            )}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}
