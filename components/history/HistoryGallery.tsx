"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { HistoryCard } from "@/components/history/HistoryCard";
import { useApp } from "@/lib/app-context";
import type { StyleName } from "@/lib/types";

const FILTERS: Array<"All" | StyleName> = ["All", "Minimal", "Modern", "Dense", "Brutalist"];

export function HistoryGallery({ savedOnly = false }: { savedOnly?: boolean }) {
  const { history, openHistoryItem, duplicateHistoryItem, removeHistoryItem } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | StyleName>("All");

  const items = useMemo(() => {
    return history.filter((item) => {
      if (savedOnly && !item.saved) return false;
      if (filter !== "All" && item.style !== filter) return false;
      const haystack = `${item.domain} ${item.url} ${item.sectionName}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [filter, history, query, savedOnly]);

  return (
    <div className="h-full overflow-auto px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-faint">Library</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {savedOnly ? "Saved components" : "Generation history"}
            </h1>
          </div>
          <div className="flex flex-1 flex-col gap-3 md:max-w-xl md:flex-row md:items-center md:justify-end">
            <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-stroke bg-surface px-3">
              <Search className="h-4 w-4 text-faint" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search domain, section, or URL"
                className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
              />
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs ${
                    filter === item ? "illuminated text-ink" : "border border-stroke text-muted hover:text-ink"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-stroke px-6 py-16 text-center text-sm text-muted">
            {savedOnly ? "Nothing saved yet. Open a generation and keep it." : "No generations yet. Start from a URL or screenshot."}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onOpen={() => openHistoryItem(item)}
                onDuplicate={() => duplicateHistoryItem(item)}
                onDelete={() => removeHistoryItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
