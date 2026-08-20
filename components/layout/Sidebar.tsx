"use client";

import React from "react";
import { Bookmark, Boxes, History, Plus, Settings, User } from "lucide-react";
import { motion } from "framer-motion";
import { IconButton } from "@/components/ui/IconButton";
import { LogoMark } from "@/components/layout/Logo";
import { useApp } from "@/lib/app-context";
import type { AppView } from "@/lib/types";

const NAV: { id: AppView | "new"; label: string; icon: React.ReactNode }[] = [
  { id: "new", label: "New generation", icon: <Plus className="h-4 w-4" /> },
  { id: "history", label: "History", icon: <History className="h-4 w-4" /> },
  { id: "saved", label: "Saved", icon: <Bookmark className="h-4 w-4" /> },
  { id: "workspace", label: "Components", icon: <Boxes className="h-4 w-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export function Sidebar() {
  const { view, setView, startNew, generatedCode } = useApp();

  return (
    <aside className="hidden h-full w-[76px] shrink-0 flex-col border-r border-stroke bg-canvas/80 md:flex">
      <div className="flex h-14 items-center justify-center">
        <motion.button
          type="button"
          onClick={startNew}
          aria-label="Reactify home"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-[12px]"
        >
          <LogoMark size={40} />
        </motion.button>
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1.5 pt-2">
        {NAV.map((item, index) => {
          const active =
            item.id === "new"
              ? view === "home"
              : item.id === "workspace"
                ? view === "workspace"
                : view === item.id;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * index, duration: 0.35 }}
            >
              <IconButton
                label={item.label}
                active={active}
                onClick={() => {
                  if (item.id === "new") startNew();
                  else if (item.id === "workspace") setView(generatedCode ? "workspace" : "home");
                  else setView(item.id);
                }}
              >
                {item.icon}
              </IconButton>
            </motion.div>
          );
        })}
      </nav>

      <div className="flex items-center justify-center pb-4">
        <IconButton label="Account" side="right" onClick={() => setView("settings")}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-wash text-[10px] font-semibold text-ink">
            <User className="h-3.5 w-3.5" />
          </span>
        </IconButton>
      </div>
    </aside>
  );
}
