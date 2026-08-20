import type { AdvancedOptions, HistoryItem } from "@/lib/types";
import { DEFAULT_ADVANCED } from "@/lib/types";

const HISTORY_KEY = "reactify.history";
const SAVED_LEGACY_KEY = "savedComponents";
const SETTINGS_KEY = "reactify.settings";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function migrateLegacy(items: HistoryItem[]): HistoryItem[] {
  if (typeof window === "undefined") return items;
  const legacy = safeParse<{ id: string; name: string; code: string; date: string }[]>(
    localStorage.getItem(SAVED_LEGACY_KEY),
    []
  );

  if (!legacy.length) return items;

  const existingIds = new Set(items.map((item) => item.id));
  const migrated: HistoryItem[] = legacy
    .filter((item) => !existingIds.has(`legacy-${item.id}`))
    .map((item) => ({
      id: `legacy-${item.id}`,
      url: "",
      domain: item.name || "Saved component",
      thumbnail: "",
      style: "Modern",
      createdAt: Date.parse(item.date) || Date.now(),
      updatedAt: Date.parse(item.date) || Date.now(),
      code: item.code,
      html: "",
      sectionName: item.name,
      sectionType: "component",
      componentCount: 1,
      saved: true,
    }));

  return [...migrated, ...items];
}

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const items = safeParse<HistoryItem[]>(localStorage.getItem(HISTORY_KEY), []);
  const merged = migrateLegacy(items);
  if (merged.length !== items.length) {
    saveHistory(merged);
  }
  return merged.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveHistory(items: HistoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 60)));
}

export function upsertHistoryItem(item: HistoryItem) {
  const items = loadHistory().filter((entry) => entry.id !== item.id);
  items.unshift(item);
  saveHistory(items);
  return items;
}

export function deleteHistoryItem(id: string) {
  const items = loadHistory().filter((entry) => entry.id !== id);
  saveHistory(items);
  return items;
}

export function toggleSavedItem(id: string) {
  const items = loadHistory().map((entry) =>
    entry.id === id ? { ...entry, saved: !entry.saved, updatedAt: Date.now() } : entry
  );
  saveHistory(items);
  return items;
}

export function loadSettings(): AdvancedOptions {
  if (typeof window === "undefined") return DEFAULT_ADVANCED;
  return { ...DEFAULT_ADVANCED, ...safeParse(localStorage.getItem(SETTINGS_KEY), {}) };
}

export function saveSettings(settings: AdvancedOptions) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
