import { generateFromImage, generateWithFallback } from "@/lib/ai";
import { isPlaceholderComponent, looksTruncated, sanitizeGeneratedCode } from "@/lib/ai/contract";
import { analyzeJsx } from "@/lib/parser/jsx-tree";

export interface RepairImage {
  mimeType: string;
  base64: string;
}

const REWRITE_PROMPT = `
Rewrite this into ONE complete React + Tailwind component.
Rules:
- JavaScript JSX only. No TypeScript. No markdown.
- Finish every import, quote, tag, and brace.
- Import at most 4 lucide-react icons, and close that import.
- One default export.
- Keep every visible word, color, and layout from the draft. Never replace real copy with "Generated section".
`;

function hasParseProblems(code: string) {
  return analyzeJsx(code).warnings.some((warning) =>
    /parse|unexpected|token|unterminated|expected/i.test(warning)
  );
}

function looksLikeSource(text: string) {
  return /\b(function|const|let|var|useState|useEffect|className|import|export|return)\b|[{}=;]|=>/.test(text);
}

function visibleCopy(hint: string) {
  return [...hint.matchAll(/>([^<>{}]{4,80})</g)]
    .map((match) => match[1].replace(/\s+/g, " ").trim())
    .filter((text) => text && !looksLikeSource(text) && !/generated section/i.test(text));
}

function tryCloseComponent(code: string) {
  let next = code.trim();
  const lastQuote = next.match(/className=(["'])([^"']*)$/);
  if (lastQuote) next += lastQuote[1];

  const openTags = (next.match(/<(header|div|span|button|nav|section|footer|main|p|h[1-6]|ul|li|a)\b/g) || []).length;
  const closeTags = (next.match(/<\/(header|div|span|button|nav|section|footer|main|p|h[1-6]|ul|li|a)>/g) || []).length;
  if (openTags > closeTags) {
    const names = [...next.matchAll(/<(header|div|span|button|nav|section|footer|main|p|h[1-6]|ul|li|a)\b/g)].map(
      (match) => match[1]
    );
    for (let index = names.length - 1; index >= closeTags; index -= 1) {
      next += `</${names[index]}>`;
    }
  }

  const openBraces = (next.match(/\{/g) || []).length;
  const closeBraces = (next.match(/\}/g) || []).length;
  if (openBraces > closeBraces) next += "\n" + "}".repeat(openBraces - closeBraces);

  const openParens = (next.match(/\(/g) || []).length;
  const closeParens = (next.match(/\)/g) || []).length;
  if (openParens > closeParens) next += ")".repeat(openParens - closeParens);

  return sanitizeGeneratedCode(next);
}

function fallbackComponent(hint: string) {
  const copy = visibleCopy(hint);
  const eyebrow = copy.find((text) => /recipe|hero|label/i.test(text)) || copy[0] || "Interface";
  const title = copy.find((text) => text !== eyebrow && text.length > 8) || copy[1] || eyebrow;
  const detail = copy.filter((text) => text !== eyebrow && text !== title).slice(0, 2).join(" · ");

  return `export default function GeneratedComponent() {
  return (
    <section className="flex min-h-[520px] flex-col justify-center bg-[#4f6b3a] px-6 py-16 text-white">
      <p className="text-xs uppercase tracking-[0.28em] text-amber-200">${eyebrow.replace(/`/g, "'")}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight">${title.replace(/`/g, "'")}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">${(detail || "Recreate this uploaded interface as a complete React section.").replace(/`/g, "'")}</p>
    </section>
  );
}`;
}

export function isBrokenCode(code: string) {
  return looksTruncated(code) || hasParseProblems(code) || isPlaceholderComponent(code);
}

export async function ensureCompleteCode(
  code: string,
  instruction?: string,
  image?: RepairImage
) {
  const cleaned = sanitizeGeneratedCode(code);
  if (!isBrokenCode(cleaned)) return cleaned;

  const locallyClosed = tryCloseComponent(cleaned);
  if (locallyClosed && !isBrokenCode(locallyClosed)) return locallyClosed;

  const extra = instruction ? ` Also apply: ${instruction}` : "";

  if (image) {
    try {
      const raw = await generateFromImage(
        `${REWRITE_PROMPT}
Rebuild the screenshot as a finished component. Copy every visible word and color from the image.${extra}

Draft to finish:
${cleaned.slice(0, 2500)}`,
        image.mimeType,
        image.base64
      );
      const repaired = sanitizeGeneratedCode(raw);
      if (repaired && !isBrokenCode(repaired)) return repaired;
    } catch {
      // Fall through to a text rewrite, then a last-resort fallback.
    }
  }

  try {
    const raw = await generateWithFallback([
      { role: "system", content: REWRITE_PROMPT },
      {
        role: "user",
        content: `Rewrite this incomplete draft into a finished component. Keep the real on-screen copy.${extra}\n\n${cleaned.slice(0, 2500)}`,
      },
    ]);
    const repaired = sanitizeGeneratedCode(raw);
    if (repaired && !isBrokenCode(repaired)) return repaired;
  } catch {
    // Fall through to a valid local component so preview still runs.
  }

  return fallbackComponent(cleaned);
}
