"use client";

import React from "react";
import { Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="flex shrink-0 items-center justify-center border-t border-stroke bg-surface/70 px-3 py-2.5 backdrop-blur-sm md:px-5">
      <a
        href="mailto:anika7work@gmail.com"
        className="inline-flex items-center gap-2 text-xs text-muted transition-colors duration-200 hover:text-ink"
      >
        <Mail className="h-3.5 w-3.5 text-accent" />
        For any queries: anika7work@gmail.com
      </a>
    </footer>
  );
}
