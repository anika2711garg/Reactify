"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bookmark, ChevronRight, Github, MoreHorizontal, Zap } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Wordmark } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useApp } from "@/lib/app-context";
import { getDomain } from "@/lib/utils";

export function TopBar() {
  const { view, url, history, startNew, setView, saveCurrent, currentId } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const crumb =
    view === "history"
      ? "History"
      : view === "saved"
        ? "Saved"
        : view === "settings"
          ? "Settings"
          : view === "workspace" && url
            ? getDomain(url)
            : "New generation";

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-stroke px-3 md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={startNew}
          aria-label="Reactify home"
          className="rounded-lg transition-opacity duration-200 hover:opacity-80"
        >
          <Wordmark className="text-[18px]" />
        </button>
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm lg:flex">
          <ChevronRight className="h-3.5 w-3.5 text-faint" />
          <span className="truncate text-muted">{crumb}</span>
        </nav>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="mr-1 hidden items-center gap-1.5 rounded-lg border border-stroke bg-surface px-2.5 py-1 text-[11px] text-muted sm:flex">
          <Zap className="h-3 w-3 text-accent" />
          <span>{history.length} generations</span>
        </div>

        {view === "workspace" && currentId && (
          <IconButton label="Save to library" side="bottom" compact onClick={saveCurrent}>
            <Bookmark className="h-4 w-4" />
          </IconButton>
        )}

        <ThemeToggle />

        <IconButton
          label="Open GitHub"
          side="bottom"
          compact
          onClick={() => window.open("https://github.com/anika2711garg/Reactify", "_blank", "noreferrer")}
        >
          <Github className="h-4 w-4" />
        </IconButton>

        <div className="relative" ref={menuRef}>
          <IconButton label="Controls" side="bottom" compact onClick={() => setMenuOpen((open) => !open)}>
            <MoreHorizontal className="h-4 w-4" />
          </IconButton>
          {menuOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-xl border border-stroke bg-surface-raised py-1 shadow-float">
              <button
                type="button"
                className="flex w-full px-3 py-2 text-left text-xs text-ink hover:bg-wash"
                onClick={() => {
                  setView("settings");
                  setMenuOpen(false);
                }}
              >
                Appearance & settings
              </button>
              <button
                type="button"
                className="flex w-full px-3 py-2 text-left text-xs text-ink hover:bg-wash"
                onClick={() => {
                  startNew();
                  setMenuOpen(false);
                }}
              >
                New generation
              </button>
              <a
                href="mailto:anika7work@gmail.com"
                className="flex w-full px-3 py-2 text-left text-xs text-ink hover:bg-wash"
                onClick={() => setMenuOpen(false)}
              >
                Email support
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
