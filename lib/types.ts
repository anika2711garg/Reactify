import type { Section } from "@/lib/parse";

export type AppView = "home" | "workspace" | "history" | "saved" | "settings";
export type InputMode = "url" | "screenshot";
export type StyleName = "Minimal" | "Modern" | "Dense" | "Brutalist";
export type { ViewportPreset } from "@/lib/preview/viewports";
export type Viewport = import("@/lib/preview/viewports").ViewportPreset;
export type PreviewCompare = "generated" | "original" | "compare";
export type WorkspacePane = "source" | "preview" | "code";
export type CodeTab = "component" | "styles" | "dependencies";

export interface AdvancedOptions {
  framework: "react-tailwind" | "next";
  responsive: "mobile-first" | "desktop-first" | "fluid";
  granularity: "section" | "page" | "atomic";
}

export interface HistoryItem {
  id: string;
  url: string;
  domain: string;
  thumbnail: string;
  style: StyleName;
  createdAt: number;
  updatedAt: number;
  code: string;
  html: string;
  sectionName: string;
  sectionType: string;
  componentCount: number;
  saved: boolean;
}

export interface AppSnapshot {
  view: AppView;
  inputMode: InputMode;
  url: string;
  screenshot: string;
  uploadedImage: string;
  style: StyleName;
  advanced: AdvancedOptions;
  sections: Section[];
  selectedSection: Section | null;
  generatedCode: string;
  currentId: string | null;
}

export const STYLE_OPTIONS: { name: StyleName; description: string }[] = [
  { name: "Minimal", description: "Quiet surfaces, generous space, restrained type" },
  { name: "Modern", description: "Soft elevation, refined radius, measured contrast" },
  { name: "Dense", description: "Compact rhythm for information-heavy interfaces" },
  { name: "Brutalist", description: "Hard edges, high contrast, unapologetic type" },
];

export const DEFAULT_ADVANCED: AdvancedOptions = {
  framework: "react-tailwind",
  responsive: "mobile-first",
  granularity: "section",
};

export const GENERATION_STAGES = [
  "Capturing website",
  "Detecting sections",
  "Understanding visual system",
  "Generating React",
  "Optimizing responsiveness",
] as const;
