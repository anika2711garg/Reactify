"use client";

import React from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  compact?: boolean;
  side?: "top" | "right" | "bottom" | "left";
}

export function IconButton({
  label,
  active,
  compact,
  side = "right",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <Tooltip content={label} side={side}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        className={cn(
          "relative flex items-center justify-center rounded-[12px] text-muted transition-all duration-200",
          compact ? "h-8 w-8" : "h-10 w-10",
          "hover:bg-wash hover:text-ink active:scale-[0.96]",
          "focus-visible:outline-none",
          active && "bg-accent-dim text-ink shadow-[inset_0_0_0_1px_rgba(124,92,255,0.45)]",
          className
        )}
        {...props}
      >
        {active && (
          <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-accent" />
        )}
        {children}
      </button>
    </Tooltip>
  );
}
