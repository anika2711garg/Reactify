"use client";

import React from "react";
import { X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { useApp } from "@/lib/app-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { error, clearError } = useApp();

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-canvas text-ink">
      <div className="app-glow absolute inset-0" />
      <div className="app-grid absolute inset-0 opacity-70" />
      <div className="app-noise absolute inset-0" />

      <Sidebar />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
        <MobileNav />
      </div>

      {error && (
        <div className="fixed bottom-20 left-1/2 z-50 w-[min(440px,calc(100%-2rem))] -translate-x-1/2 md:bottom-6">
          <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-[#1a1012]/95 px-4 py-3 text-sm text-[#ffc9cc] shadow-float backdrop-blur-md">
            <p className="flex-1 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={clearError}
              aria-label="Dismiss error"
              className="rounded-md p-1 text-[#ffc9cc] hover:bg-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
