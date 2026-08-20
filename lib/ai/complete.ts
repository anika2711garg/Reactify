import { generateWithFallback } from "@/lib/ai";
import { looksTruncated, sanitizeGeneratedCode } from "@/lib/ai/contract";
import { analyzeJsx } from "@/lib/parser/jsx-tree";

const REWRITE_PROMPT = `
Rewrite this into ONE complete React + Tailwind component.
Rules:
- JavaScript JSX only. No TypeScript. No markdown.
- Under 80 lines. Finish every import, quote, tag, and brace.
- Import at most 4 lucide-react icons, and close that import.
- One default export.
- Keep the visible text and layout idea from the draft.
`;

function hasParseProblems(code: string) {
  return analyzeJsx(code).warnings.some((warning) =>
    /parse|unexpected|token|unterminated|expected/i.test(warning)
  );
}

function fallbackComponent(hint: string) {
  const text = hint
    .replace(/```[\s\S]*$/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[{}`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);

  return `export default function GeneratedComponent() {
  return (
    <section className="min-h-[520px] bg-[#16120f] px-6 py-16 text-white">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Recipe</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight">Generated section</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">${text || "The source section was rebuilt as a complete component."}</p>
    </section>
  );
}`;
}

export function isBrokenCode(code: string) {
  return looksTruncated(code) || hasParseProblems(code);
}

export async function ensureCompleteCode(code: string, instruction?: string) {
  const cleaned = sanitizeGeneratedCode(code);
  if (!isBrokenCode(cleaned)) return cleaned;

  try {
    const raw = await generateWithFallback([
      { role: "system", content: REWRITE_PROMPT },
      {
        role: "user",
        content: `Rewrite this incomplete draft into a finished compact component.${
          instruction ? ` Also apply: ${instruction}` : ""
        }\n\n${cleaned.slice(0, 2500)}`,
      },
    ]);
    const repaired = sanitizeGeneratedCode(raw);
    if (repaired && !isBrokenCode(repaired)) return repaired;
  } catch {
    // Fall through to a valid local component so preview and refine still work.
  }

  return fallbackComponent(cleaned);
}
