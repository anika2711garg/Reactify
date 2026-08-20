import React from "react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-[12px] bg-accent-dim shadow-[inset_0_0_0_1px_rgba(124,92,255,0.35)]",
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-accent-soft" fill="currentColor">
        <path d="M13.2 2.1 4.4 13.4c-.25.32-.02.8.38.8h6.16l-1.14 7.4c-.08.5.55.82.88.45l8.8-11.3c.25-.32.02-.8-.38-.8h-6.16l1.14-7.4c.08-.5-.55-.82-.88-.45Z" />
      </svg>
    </div>
  );
}
