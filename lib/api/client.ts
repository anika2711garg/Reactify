import type { Section } from "@/lib/parse";
import type { ComponentTreeNode } from "@/lib/parser/jsx-tree";
import type { InputMode, StyleName } from "@/lib/types";

async function postJson<T>(path: string, body: unknown, fallback: string): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: (T & { error?: string; success?: boolean }) | null = null;
  try {
    data = (await res.json()) as T & { error?: string; success?: boolean };
  } catch {
    throw new Error(fallback);
  }

  if (!res.ok || data.error) {
    throw new Error(data.error || fallback);
  }

  return data;
}

export interface ScrapeResponse {
  success: true;
  url: string;
  sections: Section[];
  screenshot: string | null;
  warnings: string[];
}

export interface GenerateResponse {
  code: string;
  explanation?: string;
  dependencies: string[];
  warnings: string[];
  tree: ComponentTreeNode[];
  componentName: string | null;
}

export interface IterateResponse {
  code: string;
  explanation: string;
  affectedSections: string[];
  dependenciesAdded: string[];
  dependenciesRemoved: string[];
  dependencies: string[];
  warnings: string[];
  tree: ComponentTreeNode[];
}

export interface TreeResponse {
  tree: ComponentTreeNode[];
  componentName: string | null;
  warnings: string[];
}

export function scrapeWebsite(url: string) {
  return postJson<ScrapeResponse>("/api/scrape", { url }, "Failed to scrape that website");
}

export function generateComponent(input: {
  html?: string;
  screenshot?: string;
  style: StyleName;
  requirements: string;
  mode: InputMode;
}) {
  return postJson<GenerateResponse>("/api/generate", input, "Failed to generate component");
}

export function iterateComponent(input: {
  currentCode: string;
  instruction: string;
  selectedPath?: string | null;
  selectedName?: string;
}) {
  return postJson<IterateResponse>("/api/iterate", input, "Failed to update component");
}

export function analyzeTree(code: string) {
  return postJson<TreeResponse>("/api/tree", { code }, "Failed to analyze component tree");
}
