"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Section } from "@/lib/parse";
import {
  deleteHistoryItem,
  loadHistory,
  loadSettings,
  saveHistory,
  saveSettings,
  toggleSavedItem,
  upsertHistoryItem,
} from "@/lib/storage";
import type {
  AdvancedOptions,
  AppView,
  HistoryItem,
  InputMode,
  StyleName,
} from "@/lib/types";
import { DEFAULT_ADVANCED } from "@/lib/types";
import { buildRequirements, getDomain } from "@/lib/utils";

interface AppContextValue {
  view: AppView;
  setView: (view: AppView) => void;
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  url: string;
  setUrl: (url: string) => void;
  screenshot: string;
  uploadedImage: string;
  setUploadedImage: (src: string) => void;
  style: StyleName;
  setStyle: (style: StyleName) => void;
  advanced: AdvancedOptions;
  setAdvanced: (options: AdvancedOptions) => void;
  sections: Section[];
  selectedSection: Section | null;
  generatedCode: string;
  setGeneratedCode: (code: string) => void;
  currentId: string | null;
  history: HistoryItem[];
  isScraping: boolean;
  isGenerating: boolean;
  isIterating: boolean;
  generationStage: number;
  error: string;
  clearError: () => void;
  startNew: () => void;
  handleGenerate: () => Promise<void>;
  handleSelectSection: (section: Section) => Promise<void>;
  handleIterate: (instruction: string) => Promise<void>;
  openHistoryItem: (item: HistoryItem) => void;
  duplicateHistoryItem: (item: HistoryItem) => void;
  removeHistoryItem: (id: string) => void;
  toggleSaved: (id: string) => void;
  saveCurrent: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function createSyntheticSection(): Section {
  return {
    id: "screenshot-full",
    type: "hero",
    name: "Full interface",
    previewText: "Uploaded interface screenshot",
    html: `<section data-source="screenshot"><img alt="Uploaded interface screenshot" /><p>Reconstruct this uploaded interface as a complete production-ready React + Tailwind section. Preserve a realistic visual hierarchy with navigation, hero, and supporting content.</p></section>`,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<AppView>("home");
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [style, setStyle] = useState<StyleName>("Modern");
  const [advanced, setAdvancedState] = useState<AdvancedOptions>(DEFAULT_ADVANCED);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIterating, setIsIterating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    setHistory(loadHistory());
    setAdvancedState(loadSettings());
  }, []);

  useEffect(() => {
    if (!isScraping && !isGenerating) return;
    const id = window.setInterval(() => {
      setGenerationStage((current) => {
        const max = isGenerating ? 4 : 2;
        return current < max ? current + 1 : current;
      });
    }, 1400);
    return () => window.clearInterval(id);
  }, [isScraping, isGenerating]);

  const setAdvanced = useCallback((options: AdvancedOptions) => {
    setAdvancedState(options);
    saveSettings(options);
  }, []);

  const persistGeneration = useCallback(
    (code: string, section: Section, nextUrl: string, nextScreenshot: string, itemId?: string) => {
      const existing = itemId ? history.find((entry) => entry.id === itemId) : undefined;
      const id = itemId || `${Date.now()}`;
      const item: HistoryItem = {
        id,
        url: nextUrl,
        domain: getDomain(nextUrl) || section.name,
        thumbnail: nextScreenshot || existing?.thumbnail || "",
        style,
        createdAt: existing?.createdAt || Date.now(),
        updatedAt: Date.now(),
        code,
        html: section.html,
        sectionName: section.name,
        sectionType: section.type,
        componentCount: Math.max(1, sections.length || existing?.componentCount || 1),
        saved: existing?.saved ?? false,
      };
      setCurrentId(id);
      setHistory(upsertHistoryItem(item));
    },
    [history, sections.length, style]
  );

  const startNew = useCallback(() => {
    setView("home");
    setInputMode("url");
    setUrl("");
    setScreenshot("");
    setUploadedImage("");
    setSections([]);
    setSelectedSection(null);
    setGeneratedCode("");
    setCurrentId(null);
    setError("");
    setGenerationStage(0);
  }, []);

  const generateFromSection = useCallback(
    async (
      section: Section,
      nextUrl: string,
      nextScreenshot: string,
      itemId?: string
    ) => {
      setIsGenerating(true);
      setGenerationStage((current) => Math.max(current, 3));
      setSelectedSection(section);
      setError("");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html: section.html,
            style,
            requirements: buildRequirements(
              "Ensure it is fully responsive and uses modern design.",
              advanced
            ),
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        setGeneratedCode(data.code);
        persistGeneration(data.code, section, nextUrl, nextScreenshot, itemId);
        setView("workspace");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
        setView("workspace");
      } finally {
        setIsGenerating(false);
        setGenerationStage(4);
      }
    },
    [advanced, persistGeneration, style]
  );

  const handleGenerate = useCallback(async () => {
    setError("");
    setGeneratedCode("");
    setSelectedSection(null);
    setGenerationStage(0);

    if (inputMode === "screenshot") {
      if (!uploadedImage) {
        setError("Drop or upload a screenshot first.");
        return;
      }
      const section = createSyntheticSection();
      setScreenshot(uploadedImage);
      setSections([section]);
      setView("workspace");
      await generateFromSection(section, url || "screenshot://upload", uploadedImage);
      return;
    }

    if (!url.startsWith("http")) {
      setError("Enter a valid public URL beginning with https://");
      return;
    }

    setIsScraping(true);
    setView("workspace");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Scraping failed");

      const nextSections: Section[] = data.sections || [];
      const nextScreenshot: string = data.screenshot || "";
      setSections(nextSections);
      setScreenshot(nextScreenshot);

      const preferred =
        nextSections.find((section) => section.type === "hero") ||
        nextSections.find((section) => section.type === "header") ||
        nextSections[0];

      if (preferred) {
        await generateFromSection(preferred, url, nextScreenshot);
      } else if (nextScreenshot) {
        const fallback = createSyntheticSection();
        setSections([fallback]);
        await generateFromSection(fallback, url, nextScreenshot);
      } else {
        setError("No sections were detected. Try another URL or upload a screenshot.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setView("home");
    } finally {
      setIsScraping(false);
    }
  }, [generateFromSection, inputMode, uploadedImage, url]);

  const handleSelectSection = useCallback(
    async (section: Section) => {
      const reuseId = selectedSection?.id === section.id ? currentId || undefined : undefined;
      await generateFromSection(section, url, screenshot || uploadedImage, reuseId);
    },
    [currentId, generateFromSection, screenshot, selectedSection?.id, uploadedImage, url]
  );

  const handleIterate = useCallback(
    async (instruction: string) => {
      if (!generatedCode.trim() || !instruction.trim()) return;
      setIsIterating(true);
      setError("");
      try {
        const res = await fetch("/api/iterate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentCode: generatedCode, instruction }),
        });
        const data = await res.json();
        if (!data.code) throw new Error(data.error || "Failed to update component");
        setGeneratedCode(data.code);
        if (selectedSection) {
          persistGeneration(data.code, selectedSection, url, screenshot || uploadedImage, currentId || undefined);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Refinement failed");
      } finally {
        setIsIterating(false);
      }
    },
    [currentId, generatedCode, persistGeneration, screenshot, selectedSection, uploadedImage, url]
  );

  const openHistoryItem = useCallback((item: HistoryItem) => {
    setCurrentId(item.id);
    setUrl(item.url);
    setScreenshot(item.thumbnail);
    setGeneratedCode(item.code);
    setStyle(item.style);
    setSelectedSection({
      id: item.id,
      type: item.sectionType,
      name: item.sectionName,
      previewText: item.sectionName,
      html: item.html,
    });
    setSections(
      item.html
        ? [
            {
              id: item.id,
              type: item.sectionType,
              name: item.sectionName,
              previewText: item.sectionName,
              html: item.html,
            },
          ]
        : []
    );
    setView("workspace");
  }, []);

  const duplicateHistoryItem = useCallback((item: HistoryItem) => {
    const copy: HistoryItem = {
      ...item,
      id: `${Date.now()}`,
      domain: `${item.domain} copy`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      saved: false,
    };
    setHistory(upsertHistoryItem(copy));
    openHistoryItem(copy);
  }, [openHistoryItem]);

  const removeHistoryItem = useCallback((id: string) => {
    setHistory(deleteHistoryItem(id));
    if (currentId === id) startNew();
  }, [currentId, startNew]);

  const toggleSaved = useCallback((id: string) => {
    setHistory(toggleSavedItem(id));
  }, []);

  const saveCurrent = useCallback(() => {
    if (!currentId) return;
    const items = loadHistory().map((item) =>
      item.id === currentId ? { ...item, saved: true, updatedAt: Date.now() } : item
    );
    saveHistory(items);
    setHistory(items);
  }, [currentId]);

  const value = useMemo<AppContextValue>(
    () => ({
      view,
      setView,
      inputMode,
      setInputMode,
      url,
      setUrl,
      screenshot,
      uploadedImage,
      setUploadedImage,
      style,
      setStyle,
      advanced,
      setAdvanced,
      sections,
      selectedSection,
      generatedCode,
      setGeneratedCode,
      currentId,
      history,
      isScraping,
      isGenerating,
      isIterating,
      generationStage,
      error,
      clearError: () => setError(""),
      startNew,
      handleGenerate,
      handleSelectSection,
      handleIterate,
      openHistoryItem,
      duplicateHistoryItem,
      removeHistoryItem,
      toggleSaved,
      saveCurrent,
    }),
    [
      advanced,
      currentId,
      duplicateHistoryItem,
      error,
      generatedCode,
      generationStage,
      handleGenerate,
      handleIterate,
      handleSelectSection,
      history,
      inputMode,
      isGenerating,
      isIterating,
      isScraping,
      openHistoryItem,
      removeHistoryItem,
      saveCurrent,
      screenshot,
      sections,
      selectedSection,
      setAdvanced,
      startNew,
      style,
      toggleSaved,
      uploadedImage,
      url,
      view,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
