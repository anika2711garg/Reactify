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

export function repairGeneratedJsx(src: string) {
  return src
    .replace(/\{(['"])([^'"\n]*\$\{[^}]+\}[^'"\n]*)\1\}/g, "{`$2`}")
    .replace(/(['"])([^'"\n]*\$\{[^}]+\}[^'"\n]*)\1/g, "`$2`");
}

export function stripTypescript(src: string) {
  return src
    .replace(/["']use client["'];?\s*/g, "")
    .replace(/interface\s+\w+\s*\{[\s\S]*?\}\s*/g, "")
    .replace(/type\s+\w+\s*=\s*[\s\S]*?;\s*/g, "")
    .replace(/\b(useState|useRef|useMemo|useCallback|useReducer|useContext)\s*<[^<>\n]+>/g, "$1")
    .replace(/\)\s*:\s*[\w.<>\[\]|&\s]+\s*\{/g, ") {")
    .replace(/(\(|,)\s*(\w+)\s*:\s*(string|number|boolean|any|void|undefined|null|React\.\w+|[\w.]+\[\])(?=\s*[,)=])/g, "$1 $2")
    .replace(/\s+as\s+(const|[\w.]+)/g, "")
    .replace(/(\w+)!(\.)/g, "$1$2");
}

export function sanitizeGeneratedCode(raw: string) {
  return stripTypescript(
    repairGeneratedJsx(
      raw
        .replace(/```[\w]*\n?/g, "")
        .replace(/\sclass=/g, " className=")
        .replace(/\sfor=/g, " htmlFor=")
        .replace(/<!--[\s\S]*?-->/g, "")
    )
  ).trim();
}

export function looksTruncated(code: string) {
  if (!code.trim()) return true;
  if (/className=["'][^"'\n]*$/m.test(code)) return true;
  if (/<(header|div|span|button|nav|a|section|footer|main|ul|li|img|form|input)\b[^>]*$/im.test(code)) {
    return true;
  }
  const trimmed = code.trim();
  if (!/[}\)];\s*$/.test(trimmed)) return true;
  if (!/export\s+default|function\s+\w+|const\s+\w+\s*=/.test(code)) return true;
  return false;
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
  if (/503|502|500|high demand|overloaded|service unavailable/i.test(message)) {
    return "The AI service is busy. Reactify will retry the other provider automatically — try Generate again.";
  }
  if (/timeout|timed out|ETIMEDOUT/i.test(message)) {
    return "The request timed out. Try a smaller page or retry.";
  }
  if (/GoogleGenerativeAI|generativelanguage|api\.groq|ECONNREFUSED|stack/i.test(message)) {
    return fallback;
  }
  return message.slice(0, 220);
}
