import { generateWithFallback } from "@/lib/ai";
import { looksTruncated, sanitizeGeneratedCode } from "@/lib/ai/contract";
import { analyzeJsx } from "@/lib/parser/jsx-tree";

const REPAIR_PROMPT = `
You repair incomplete React + Tailwind components.
Return ONLY complete valid JavaScript JSX. No markdown. No TypeScript.
Finish every tag, quote, and className. Keep one default export.
If the file was cut off, complete it as a polished, self-contained component.
`;

function hasParseProblems(code: string) {
  return analyzeJsx(code).warnings.some((warning) =>
    /parse|unexpected|token|unterminated|expected/i.test(warning)
  );
}

export async function ensureCompleteCode(code: string) {
  const cleaned = sanitizeGeneratedCode(code);
  if (!looksTruncated(cleaned) && !hasParseProblems(cleaned)) {
    return cleaned;
  }

  const raw = await generateWithFallback([
    { role: "system", content: REPAIR_PROMPT },
    {
      role: "user",
      content: `This component is truncated or invalid. Return the full finished file.\n\n${cleaned}`,
    },
  ]);

  return sanitizeGeneratedCode(raw) || cleaned;
}
