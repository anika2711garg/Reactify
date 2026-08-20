export interface GenerationResponse {
  code: string;
  explanation?: string;
  dependencies: string[];
  warnings: string[];
}

export interface RefinementResponse {
  code: string;
  explanation: string;
  affectedSections: string[];
  dependenciesAdded: string[];
  dependenciesRemoved: string[];
}

const KNOWN_DEPENDENCIES = new Set(["react", "react-dom", "lucide-react", "tailwindcss", "clsx", "tailwind-merge"]);

export function sanitizeGeneratedCode(raw: string) {
  return raw
    .replace(/```[\w]*\n?/g, "")
    .replace(/\sclass=/g, " className=")
    .replace(/\sfor=/g, " htmlFor=")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
}

export function extractDependencies(code: string) {
  const matches = [...code.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((match) => match[1]);
  const unique = Array.from(new Set(matches));
  if (unique.length === 0) return ["react", "lucide-react", "tailwindcss"];
  return unique;
}

export function classifyDependencies(dependencies: string[]) {
  return {
    existing: dependencies.filter((item) => KNOWN_DEPENDENCIES.has(item) || item.startsWith("react")),
    missing: dependencies.filter((item) => !KNOWN_DEPENDENCIES.has(item) && !item.startsWith("react")),
  };
}

export function publicErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  if (/NO_AI_KEYS|not configured|no valid api keys/i.test(message)) {
    return "AI keys were not loaded. Add GROQ_API_KEY or GOOGLE_API_KEY to .env.local in the Reactify folder and restart the server.";
  }
  if (/NO_GEMINI_KEY|needs a gemini key/i.test(message)) {
    return "Screenshot generation needs GOOGLE_API_KEY in .env.local. Restart the server after adding it.";
  }
  if (/api[_-]?key|secret|token|unauthorized|401/i.test(message)) {
    return "The AI service rejected the request. Check server API keys.";
  }
  if (/404/i.test(message) && /not found|decommissioned|no longer available|unknown model/i.test(message)) {
    return "The configured AI model is unavailable. Try again or check server model settings.";
  }
  if (/timeout|timed out|ETIMEDOUT/i.test(message)) {
    return "The request timed out. Try a smaller page or retry.";
  }
  return message.slice(0, 220);
}
