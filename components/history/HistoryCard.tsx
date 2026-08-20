"use client";

import React from "react";
import { Copy, Trash2 } from "lucide-react";
import type { HistoryItem } from "@/lib/types";
import { formatDate, formatRelativeTime } from "@/lib/utils";

interface HistoryCardProps {
  item: HistoryItem;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function HistoryCard({ item, onOpen, onDuplicate, onDelete }: HistoryCardProps) {
  return (
    <article className="group overflow-hidden rounded-[16px] border border-stroke bg-surface transition-all duration-300 hover:border-stroke-strong hover:bg-surface-hover">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-[16/10] overflow-hidden bg-canvas">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.domain} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-faint">No capture</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent opacity-80" />
          <span className="absolute left-3 top-3 rounded-md border border-stroke bg-canvas/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted">
            {item.style}
          </span>
        </div>
        <div className="p-4">
          <h3 className="truncate text-sm font-medium text-ink">{item.domain}</h3>
          <p className="mt-1 text-xs text-muted">
            {formatDate(item.createdAt)} · {item.componentCount} component{item.componentCount === 1 ? "" : "s"}
          </p>
          <p className="mt-1 text-[11px] text-faint">Edited {formatRelativeTime(item.updatedAt)}</p>
        </div>
      </button>

      <div className="flex items-center justify-end gap-1 border-t border-stroke px-3 py-2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          onClick={onOpen}
          className="rounded-lg px-2 py-1 text-[11px] text-ink hover:bg-wash"
        >
          Open
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-lg p-1.5 text-muted hover:bg-wash hover:text-ink"
          aria-label="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}
