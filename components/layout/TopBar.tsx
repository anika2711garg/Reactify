"use client";

import React, { useState } from "react";
import { Bookmark, ChevronRight, Github, MoreHorizontal, Zap } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useApp } from "@/lib/app-context";
import { getDomain } from "@/lib/utils";

export function TopBar() {
  const { view, url, history, startNew, setView, saveCurrent, currentId } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

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

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-stroke px-3 md:px-5">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
        <button
          type="button"
          onClick={startNew}
          className="text-muted transition-colors duration-200 hover:text-ink"
        >
          Reactify
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-faint" />
        <span className="truncate text-ink">{crumb}</span>
      </nav>

      <div className="flex items-center gap-1.5">
        <div className="mr-1 hidden items-center gap-1.5 rounded-lg border border-stroke px-2.5 py-1 text-[11px] text-muted sm:flex">
          <Zap className="h-3 w-3 text-accent-soft" />
          <span>{history.length} generations</span>
        </div>

        {view === "workspace" && currentId && (
          <IconButton label="Save to library" side="bottom" onClick={saveCurrent}>
            <Bookmark className="h-4 w-4" />
          </IconButton>
        )}

        <IconButton
          label="GitHub"
          side="bottom"
          onClick={() => window.open("https://github.com", "_blank", "noreferrer")}
        >
          <Github className="h-4 w-4" />
        </IconButton>

        <div className="relative">
          <IconButton label="Controls" side="bottom" onClick={() => setMenuOpen((open) => !open)}>
            <MoreHorizontal className="h-4 w-4" />
          </IconButton>
          {menuOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-xl border border-stroke bg-surface-raised py-1 shadow-float">
              <button
                type="button"
                className="flex w-full px-3 py-2 text-left text-xs text-ink hover:bg-white/5"
                onClick={() => {
                  setView("settings");
                  setMenuOpen(false);
                }}
              >
                Appearance & settings
              </button>
              <button
                type="button"
                className="flex w-full px-3 py-2 text-left text-xs text-ink hover:bg-white/5"
                onClick={() => {
                  startNew();
                  setMenuOpen(false);
                }}
              >
                New generation
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
