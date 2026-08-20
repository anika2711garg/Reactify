"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  const uid = useId().replace(/:/g, "");

  return (
    <span
      className={cn("logo-mark relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id={`${uid}-g`} x1="6" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E9D5FF" />
            <stop offset="0.45" stopColor="#C084FC" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <path
          className="logo-bracket"
          d="M13 10 L6 24 L13 38"
          stroke={`url(#${uid}-g)`}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="logo-bracket logo-bracket-r"
          d="M35 10 L42 24 L35 38"
          stroke={`url(#${uid}-g)`}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="logo-bolt"
          d="M26 7.5 L16 23.5 H23.2 L19.2 40.5 L33.8 20.8 H26.6 L30.4 7.5 Z"
          fill={`url(#${uid}-g)`}
        />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-[-0.045em] text-ink", className)}>
      Reactify
    </span>
  );
}

export function BrandLockup({
  className,
  markSize = 32,
}: {
  className?: string;
  markSize?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} />
      <Wordmark className="text-[17px]" />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return <LogoMark className={className} />;
}
