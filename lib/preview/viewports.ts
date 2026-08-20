export type ViewportPreset =
  | "mobile"
  | "large-mobile"
  | "tablet"
  | "laptop"
  | "desktop"
  | "full"
  | "custom";

export interface ViewportOption {
  id: ViewportPreset;
  label: string;
  width: number | null;
}

export const VIEWPORT_PRESETS: ViewportOption[] = [
  { id: "mobile", label: "Mobile", width: 375 },
  { id: "large-mobile", label: "Large Mobile", width: 430 },
  { id: "tablet", label: "Tablet", width: 768 },
  { id: "laptop", label: "Laptop", width: 1024 },
  { id: "desktop", label: "Desktop", width: 1440 },
  { id: "full", label: "Full Width", width: null },
];

export function presetWidth(preset: ViewportPreset, customWidth: number, availableWidth: number) {
  if (preset === "custom") return Math.min(customWidth, availableWidth);
  if (preset === "full") return availableWidth;
  const match = VIEWPORT_PRESETS.find((item) => item.id === preset);
  return Math.min(match?.width || availableWidth, availableWidth);
}

export function presetFromWidth(width: number, availableWidth: number): ViewportPreset {
  if (width >= availableWidth - 8) return "full";
  const exact = VIEWPORT_PRESETS.find((item) => item.width === width);
  return exact?.id || "custom";
}
