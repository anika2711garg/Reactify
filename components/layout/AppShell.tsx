"use client";

import React from "react";
import { X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useApp } from "@/lib/app-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { error, clearError } = useApp();

  return (
    <div className="relative flex h-dvh w-full overflow-hidden bg-canvas text-ink">
      <div className="app-glow absolute inset-0" />
      <div className="app-grid absolute inset-0 opacity-80" />
      <div className="app-noise absolute inset-0" />

      <Sidebar />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
        <SiteFooter />
        <MobileNav />
      </div>

      {error && (
        <div className="fixed bottom-24 left-1/2 z-50 w-[min(440px,calc(100%-2rem))] -translate-x-1/2 md:bottom-8">
          <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-surface px-4 py-3 text-sm text-danger shadow-float">
            <p className="flex-1 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={clearError}
              aria-label="Dismiss error"
              className="rounded-md p-1 hover:bg-wash"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
