"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={
        compact
          ? "relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[10px] text-muted transition-colors duration-200 hover:bg-wash hover:text-ink"
          : "relative flex h-10 items-center gap-2 overflow-hidden rounded-full border border-stroke bg-surface px-2.5 text-xs text-muted transition-colors duration-200 hover:border-stroke-strong hover:text-ink"
      }
    >
      <motion.span
        key={theme}
        initial={{ y: 8, opacity: 0, rotate: -20 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-1.5"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {!compact && <span>{isDark ? "Light" : "Dark"}</span>}
      </motion.span>
    </button>
  );
}
