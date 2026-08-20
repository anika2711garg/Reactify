"use client";

import React from "react";
import { Mail } from "lucide-react";
import { Wordmark } from "@/components/layout/Logo";

export function SiteFooter() {
  return (
    <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-stroke px-3 py-2.5 md:px-5">
      <p className="hidden items-center gap-2 text-[11px] text-faint sm:flex">
        <Wordmark className="text-[12px] text-muted" />
        <span>turns interfaces into React.</span>
      </p>
      <a
        href="mailto:anika7work@gmail.com"
        className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors duration-200 hover:text-ink"
      >
        <Mail className="h-3.5 w-3.5 text-accent" />
        <span className="hidden sm:inline">For any queries: </span>
        anika7work@gmail.com
      </a>
    </footer>
  );
}
