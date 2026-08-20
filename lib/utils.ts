import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url || "Untitled";
  }
}

export function formatRelativeTime(timestamp: number) {
  const delta = Date.now() - timestamp;
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function buildRequirements(
  extra: string,
  options: {
    framework: string;
    responsive: string;
    granularity: string;
  }
) {
  const parts = [
    extra,
    `Framework: ${options.framework === "next" ? "Next.js App Router + Tailwind CSS" : "React + Tailwind CSS"}.`,
    options.responsive === "desktop-first"
      ? "Use a desktop-first responsive strategy with thoughtful mobile breakpoints."
      : options.responsive === "fluid"
        ? "Prefer fluid, container-driven layouts over hard device breakpoints."
        : "Use a mobile-first responsive strategy.",
    options.granularity === "page"
      ? "Generate a complete page-level composition rather than a tiny fragment."
      : options.granularity === "atomic"
        ? "Keep the component tightly scoped and atomic."
        : "Generate a complete, self-contained section component.",
  ];

  return parts.filter(Boolean).join(" ");
}

export function extractDependencies(code: string) {
  const matches = [...code.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const unique = Array.from(new Set(matches));
  if (unique.length === 0) {
    return ["react", "lucide-react", "tailwindcss"];
  }
  return unique;
}
