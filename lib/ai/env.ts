import fs from "fs";
import path from "path";

const GROQ_ALIASES = ["GROQ_API_KEY", "NEXT_PUBLIC_GROQ_API_KEY"] as const;

const GOOGLE_ALIASES = [
  "GOOGLE_API_KEY",
  "GEMINI_API_KEY",
  "NEXT_PUBLIC_GOOGLE_API_KEY",
  "NEXT_PUBLIC_GEMINI_API_KEY",
] as const;

let filesLoaded = false;

function clean(value: string | undefined) {
  return (value || "").trim().replace(/^["']|["']$/g, "");
}

function parseEnvFile(contents: string) {
  const values: Record<string, string> = {};

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = clean(line.slice(eq + 1));
    if (key && value) values[key] = value;
  }

  return values;
}

function envCandidates() {
  const cwd = process.cwd();
  return [
    path.join(cwd, ".env.local"),
    path.join(cwd, ".env"),
    path.join(cwd, "..", ".env.local"),
    path.join(cwd, "..", ".env"),
  ];
}

function loadEnvFiles() {
  const missing = !firstAlias(GROQ_ALIASES) || !firstAlias(GOOGLE_ALIASES);
  if (filesLoaded && !missing) return;
  filesLoaded = true;

  for (const file of envCandidates()) {
    try {
      if (!fs.existsSync(file)) continue;
      const parsed = parseEnvFile(fs.readFileSync(file, "utf8"));
      for (const [key, value] of Object.entries(parsed)) {
        if (!clean(process.env[key]) && value) {
          process.env[key] = value;
        }
      }
    } catch {
      // Ignore unreadable env files and keep checking other locations.
    }
  }
}

function firstAlias(names: readonly string[]) {
  for (const name of names) {
    const value = clean(process.env[name]);
    if (value) return value;
  }
  return "";
}

export function getAiKeys() {
  loadEnvFiles();
  return {
    groqKey: firstAlias(GROQ_ALIASES),
    googleKey: firstAlias(GOOGLE_ALIASES),
  };
}

export function hasAiKeys() {
  const { groqKey, googleKey } = getAiKeys();
  return Boolean(groqKey || googleKey);
}

export function hasGoogleKey() {
  return Boolean(getAiKeys().googleKey);
}
