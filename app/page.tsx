"use client";

import { AnimatePresence, motion } from "framer-motion";
import Safelist from "@/components/Safelist";
import { HomeState } from "@/components/generator/HomeState";
import { HistoryGallery } from "@/components/history/HistoryGallery";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { Workspace } from "@/components/workspace/Workspace";
import { AppProvider, useApp } from "@/lib/app-context";
import { ThemeProvider } from "@/lib/theme";

function RoutedView() {
  const { view } = useApp();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="h-full"
      >
        {view === "workspace" && <Workspace />}
        {view === "history" && <HistoryGallery />}
        {view === "saved" && <HistoryGallery savedOnly />}
        {view === "settings" && <SettingsPanel />}
        {view === "home" && <HomeState />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppShell>
          <RoutedView />
        </AppShell>
        <div className="hidden">
          <Safelist />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}
