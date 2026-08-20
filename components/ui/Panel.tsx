"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export function Panel({ children, className, padded = false }: PanelProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[16px] border border-stroke bg-surface shadow-panel",
        padded && "p-4",
        className
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 items-center justify-between border-b border-stroke px-3",
        className
      )}
    >
      {children}
    </div>
  );
}
