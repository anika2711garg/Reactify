"use client";

import React, { useId, useState } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

const sideClass = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
};

export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-[80] whitespace-nowrap rounded-lg border border-stroke bg-[#12121A] px-2.5 py-1 text-[11px] font-medium text-ink shadow-float transition-all duration-200",
          sideClass[side],
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-0.5"
        )}
      >
        {content}
      </span>
    </span>
  );
}
