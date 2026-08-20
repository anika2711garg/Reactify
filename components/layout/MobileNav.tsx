"use client";

import React from "react";
import { Bookmark, Boxes, History, Plus, Settings } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";
import type { AppView } from "@/lib/types";

const ITEMS: { id: AppView | "new"; label: string; icon: React.ReactNode }[] = [
  { id: "new", label: "New", icon: <Plus className="h-4 w-4" /> },
  { id: "history", label: "History", icon: <History className="h-4 w-4" /> },
  { id: "workspace", label: "Work", icon: <Boxes className="h-4 w-4" /> },
  { id: "saved", label: "Saved", icon: <Bookmark className="h-4 w-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export function MobileNav() {
  const { view, setView, startNew, generatedCode } = useApp();

  return (
    <nav className="flex h-14 shrink-0 items-center justify-around border-t border-stroke bg-canvas/95 px-2 backdrop-blur-md md:hidden">
      {ITEMS.map((item) => {
        const active =
          item.id === "new" ? view === "home" : item.id === "workspace" ? view === "workspace" : view === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.id === "new") startNew();
              else if (item.id === "workspace") setView(generatedCode ? "workspace" : "history");
              else setView(item.id);
            }}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-2.5 py-1 text-[10px] transition-colors duration-200",
              active ? "text-ink" : "text-muted"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
