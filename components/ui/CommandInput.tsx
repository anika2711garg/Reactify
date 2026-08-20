"use client";

import React from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function CommandInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask Reactify to change anything…",
  disabled,
  loading,
  className,
}: CommandInputProps) {
  return (
    <form
      className={cn(
        "flex items-center gap-3 rounded-[14px] border border-stroke bg-surface-raised px-3 py-2 transition-colors duration-200 focus-within:border-stroke-strong",
        className
      )}
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled && value.trim()) onSubmit();
      }}
    >
      <Sparkles className={cn("h-4 w-4 shrink-0 text-accent-soft", loading && "pulse-soft")} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-9 w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send refinement"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white transition-all duration-200 hover:bg-[#8b6dff] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </form>
  );
}
