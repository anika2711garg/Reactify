"use client";

import React from "react";
import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      className={cn(
        "logo-mark relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[12px] shadow-[0_0_0_1px_rgba(168,85,247,0.28)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      <img
        src="/reactify-mark.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline font-semibold tracking-[-0.04em] text-ink", className)}>
      React
      <span className="relative mx-[0.01em] inline-flex h-[1em] w-[0.24em] items-end justify-center">
        <span className="logo-idot absolute top-[0.1em] h-[0.18em] w-[0.18em] rounded-[2px] bg-accent" />
        <span className="mb-[0.04em] h-[0.58em] w-[0.115em] rounded-[1px] bg-current" />
      </span>
      fy
    </span>
  );
}

export function BrandLockup({
  className,
  markSize = 36,
}: {
  className?: string;
  markSize?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <span className="hidden h-5 w-px bg-stroke sm:block" />
      <Wordmark className="hidden text-[17px] sm:inline-flex" />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return <LogoMark className={className} />;
}
