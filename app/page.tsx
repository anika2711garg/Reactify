"use client";

import Safelist from "@/components/Safelist";
import { HomeState } from "@/components/generator/HomeState";
import { HistoryGallery } from "@/components/history/HistoryGallery";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { Workspace } from "@/components/workspace/Workspace";
import { AppProvider, useApp } from "@/lib/app-context";

function RoutedView() {
  const { view } = useApp();

  if (view === "workspace") return <Workspace />;
  if (view === "history") return <HistoryGallery />;
  if (view === "saved") return <HistoryGallery savedOnly />;
  if (view === "settings") return <SettingsPanel />;
  return <HomeState />;
}

export default function Home() {
  return (
    <AppProvider>
      <AppShell>
        <RoutedView />
      </AppShell>
      <div className="hidden">
        <Safelist />
      </div>
    </AppProvider>
  );
}
