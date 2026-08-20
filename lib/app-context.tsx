"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { rankSections, type Section } from "@/lib/parse";
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
import {
  EMPTY_REVISIONS,
  revisionReducer,
  type Revision,
} from "@/lib/history/revisions";
import type { ViewportPreset } from "@/lib/preview/viewports";
import { applyLocalInstruction } from "@/lib/ai/local-refine";
import { analyzeTree, generateComponent, iterateComponent, scrapeWebsite } from "@/lib/api/client";
import { analyzeJsx, findTreeNode, type ComponentTreeNode } from "@/lib/parser/jsx-tree";

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
  commitCode: (code: string, label: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  revisions: Revision[];
  revisionIndex: number;
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;
  componentTree: ComponentTreeNode[];
  treeWarnings: string[];
  viewportPreset: ViewportPreset;
  setViewportPreset: (preset: ViewportPreset) => void;
  viewportWidth: number;
  setViewportWidth: (width: number) => void;
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
  backToPicker: () => void;
  handleIterate: (instruction: string, options?: { autoCommit?: boolean }) => Promise<void>;
  pendingChange: { instruction: string; previousCode: string } | null;
  keepPendingChange: () => void;
  discardPendingChange: () => void;
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
  const [revisionState, dispatchRevision] = useReducer(revisionReducer, EMPTY_REVISIONS);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [viewportPreset, setViewportPreset] = useState<ViewportPreset>("desktop");
  const [viewportWidth, setViewportWidth] = useState(1440);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIterating, setIsIterating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [error, setError] = useState("");
  const [serverTree, setServerTree] = useState<ComponentTreeNode[]>([]);
  const [pendingChange, setPendingChange] = useState<{
    instruction: string;
    previousCode: string;
  } | null>(null);

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
    dispatchRevision({ type: "reset" });
    setServerTree([]);
    setSelectedElementId(null);
    setCurrentId(null);
    setError("");
    setGenerationStage(0);
    setPendingChange(null);
  }, []);

  const generateFromSection = useCallback(
    async (
      section: Section,
      nextUrl: string,
      nextScreenshot: string,
      itemId?: string,
      mode: InputMode = inputMode
    ) => {
      setIsGenerating(true);
      setGenerationStage((current) => Math.max(current, 3));
      setSelectedSection(section);
      setError("");

      try {
        const data = await generateComponent({
          html: section.html,
          screenshot: nextScreenshot || undefined,
          style,
          requirements: buildRequirements(
            "Ensure it is fully responsive and uses modern design.",
            advanced
          ),
          mode,
        });
        if (!data.code) throw new Error("The model returned empty code. Try again.");

        setGeneratedCode(data.code);
        if (data.tree?.length) setServerTree(data.tree);
        setPendingChange(null);
        dispatchRevision({ type: "commit", code: data.code, label: "Initial generation" });
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
    [advanced, inputMode, persistGeneration, style]
  );

  const handleGenerate = useCallback(async () => {
    setError("");
    setGeneratedCode("");
    setSelectedSection(null);
    setGenerationStage(0);
    setPendingChange(null);

    if (inputMode === "screenshot") {
      if (!uploadedImage) {
        setError("Drop, upload, or paste a screenshot first.");
        return;
      }
      const section = createSyntheticSection();
      setScreenshot(uploadedImage);
      setSections([section]);
      setView("workspace");
      await generateFromSection(section, "", uploadedImage, undefined, "screenshot");
      return;
    }

    if (!url.startsWith("http")) {
      setError("Enter a valid public URL beginning with https://");
      return;
    }

    setIsScraping(true);
    setView("workspace");

    try {
      const data = await scrapeWebsite(url);
      const nextSections: Section[] = rankSections(data.sections || []);
      const nextScreenshot: string = data.screenshot || "";
      setSections(nextSections);
      setScreenshot(nextScreenshot);

      if (nextSections.length) {
        setView("workspace");
      } else if (nextScreenshot) {
        const fallback = createSyntheticSection();
        setSections([fallback]);
        setView("workspace");
      } else {
        setError("No sections were detected. Try another URL or upload a screenshot.");
        setView("home");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setView("home");
    } finally {
      setIsScraping(false);
    }
  }, [generateFromSection, inputMode, uploadedImage, url]);

  const backToPicker = useCallback(() => {
    setGeneratedCode("");
    dispatchRevision({ type: "reset" });
    setSelectedSection(null);
    setSelectedElementId(null);
    setError("");
    setPendingChange(null);
  }, []);

  const handleSelectSection = useCallback(
    async (section: Section) => {
      const reuseId = selectedSection?.id === section.id ? currentId || undefined : undefined;
      const image = screenshot || uploadedImage;
      await generateFromSection(section, url, image, reuseId, inputMode);
    },
    [currentId, generateFromSection, inputMode, screenshot, selectedSection?.id, uploadedImage, url]
  );

  const persistCurrent = useCallback(
    (code: string, label: string) => {
      dispatchRevision({ type: "commit", code, label: label.slice(0, 80) });
      if (selectedSection) {
        persistGeneration(code, selectedSection, url, screenshot || uploadedImage, currentId || undefined);
      }
    },
    [currentId, persistGeneration, screenshot, selectedSection, uploadedImage, url]
  );

  const keepPendingChange = useCallback(() => {
    if (!pendingChange) return;
    persistCurrent(generatedCode, pendingChange.instruction);
    setPendingChange(null);
  }, [generatedCode, pendingChange, persistCurrent]);

  const discardPendingChange = useCallback(() => {
    if (!pendingChange) return;
    setGeneratedCode(pendingChange.previousCode);
    setPendingChange(null);
  }, [pendingChange]);

  const handleIterate = useCallback(
    async (instruction: string, options?: { autoCommit?: boolean }) => {
      if (!instruction.trim()) return;
      if (!generatedCode.trim()) {
        setError("Generate a section first, then ask for changes.");
        return;
      }

      let baseline = generatedCode;
      if (pendingChange) {
        persistCurrent(generatedCode, pendingChange.instruction);
        setPendingChange(null);
        baseline = generatedCode;
      }

      const acceptChange = (code: string) => {
        setGeneratedCode(code);
        if (options?.autoCommit) {
          persistCurrent(code, instruction);
          setPendingChange(null);
          return;
        }
        setPendingChange({ instruction: instruction.trim(), previousCode: baseline });
      };

      const local = applyLocalInstruction(baseline, instruction);
      if (local) {
        acceptChange(local);
        return;
      }

      setIsIterating(true);
      setError("");
      try {
        const localTree = analyzeJsx(baseline).tree;
        const data = await iterateComponent({
          currentCode: baseline,
          instruction,
          selectedPath: selectedElementId,
          selectedName: selectedElementId
            ? findTreeNode(localTree, selectedElementId)?.name
            : undefined,
          screenshot: screenshot || uploadedImage || undefined,
        });
        if (!data.code) throw new Error("Failed to update component");
        if (data.tree?.length) setServerTree(data.tree);
        acceptChange(data.code);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Refinement failed");
      } finally {
        setIsIterating(false);
      }
    },
    [generatedCode, pendingChange, persistCurrent, screenshot, selectedElementId, uploadedImage]
  );

  const openHistoryItem = useCallback((item: HistoryItem) => {
    setCurrentId(item.id);
    setUrl(item.url);
    setScreenshot(item.thumbnail);
    setGeneratedCode(item.code);
    dispatchRevision({
      type: "reset",
      revision: {
        id: item.id,
        code: item.code,
        label: "Restored from history",
        createdAt: item.updatedAt,
      },
    });
    setSelectedElementId(null);
    setPendingChange(null);
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

  const commitCode = useCallback((code: string, label: string) => {
    setGeneratedCode(code);
    dispatchRevision({ type: "commit", code, label });
    void analyzeTree(code)
      .then((data) => {
        if (data.tree?.length) setServerTree(data.tree);
      })
      .catch(() => undefined);
  }, []);

  const undo = useCallback(() => {
    if (pendingChange) {
      setGeneratedCode(pendingChange.previousCode);
      setPendingChange(null);
      return;
    }
    const previous = revisionState.items[revisionState.index - 1];
    if (!previous) return;
    dispatchRevision({ type: "undo" });
    setGeneratedCode(previous.code);
  }, [pendingChange, revisionState.index, revisionState.items]);

  const redo = useCallback(() => {
    const next = revisionState.items[revisionState.index + 1];
    if (!next) return;
    dispatchRevision({ type: "redo" });
    setGeneratedCode(next.code);
  }, [revisionState.index, revisionState.items]);

  const treeAnalysis = useMemo(() => {
    const local = analyzeJsx(generatedCode);
    if (local.tree.length) return local;
    return { ...local, tree: serverTree };
  }, [generatedCode, serverTree]);

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
      commitCode,
      undo,
      redo,
      canUndo: Boolean(pendingChange) || revisionState.index > 0,
      canRedo: revisionState.index >= 0 && revisionState.index < revisionState.items.length - 1,
      revisions: revisionState.items,
      revisionIndex: revisionState.index,
      selectedElementId,
      setSelectedElementId,
      componentTree: treeAnalysis.tree,
      treeWarnings: treeAnalysis.warnings,
      viewportPreset,
      setViewportPreset,
      viewportWidth,
      setViewportWidth,
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
      backToPicker,
      handleIterate,
      pendingChange,
      keepPendingChange,
      discardPendingChange,
      openHistoryItem,
      duplicateHistoryItem,
      removeHistoryItem,
      toggleSaved,
      saveCurrent,
    }),
    [
      advanced,
      commitCode,
      currentId,
      duplicateHistoryItem,
      error,
      generatedCode,
      generationStage,
      backToPicker,
      handleGenerate,
      handleIterate,
      handleSelectSection,
      keepPendingChange,
      discardPendingChange,
      pendingChange,
      history,
      inputMode,
      isGenerating,
      isIterating,
      isScraping,
      openHistoryItem,
      redo,
      removeHistoryItem,
      revisionState.index,
      revisionState.items,
      saveCurrent,
      screenshot,
      sections,
      selectedElementId,
      selectedSection,
      setAdvanced,
      startNew,
      style,
      toggleSaved,
      treeAnalysis.tree,
      treeAnalysis.warnings,
      undo,
      uploadedImage,
      url,
      view,
      viewportPreset,
      viewportWidth,
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
