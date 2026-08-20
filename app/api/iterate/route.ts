import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/ai";
import { hasAiKeys } from "@/lib/ai/env";
import { extractDependencies, publicErrorMessage, sanitizeGeneratedCode } from "@/lib/ai/contract";
import { ensureCompleteCode, isBrokenCode } from "@/lib/ai/complete";
import { analyzeJsx } from "@/lib/parser/jsx-tree";

const SYSTEM_PROMPT = `
You are an expert Frontend Engineer and React Refactoring specialist.
Your goal is to MODIFY existing React code based on user instructions.

**STRICT REQUIREMENTS:**
1. Return ONLY a COMPLETE updated React file (JavaScript/JSX). No markdown. No TypeScript.
2. Follow the user's instruction as PRIORITY #1.
3. If the current code is truncated or invalid, first finish a valid compact component, then apply the instruction.
4. Keep the file under 80 lines. Close every import, quote, tag, and brace.
5. Maintain React + Tailwind + lucide-react. At most 4 icon imports.
6. If the user asks to change color, apply Tailwind text color classes (for example text-red-500) to the relevant text.
7. Use 'export default function GeneratedComponent' or similar consistent naming.

**OUTPUT:**
The fully updated complete component code. Only code.
`;

export async function POST(req: NextRequest) {
  try {
    const { currentCode, instruction, selectedPath, selectedName } = await req.json();

    if (!currentCode || !instruction) {
      return NextResponse.json({ error: "Current code and instruction are required" }, { status: 400 });
    }

    if (!hasAiKeys()) {
      return NextResponse.json(
        { error: publicErrorMessage(new Error("NO_AI_KEYS"), "AI service is not configured.") },
        { status: 500 }
      );
    }

    const focus = selectedPath
      ? `Focus the change on the element at data-rf-path="${selectedPath}"${selectedName ? ` (${selectedName})` : ""}. Keep other sections stable.`
      : "";

    const userMessage = `
    EXISTING CODE:
    ${currentCode}

    USER INSTRUCTION:
    ${instruction}
    ${isBrokenCode(currentCode) ? "The existing code is incomplete. Rewrite a complete valid component first, then apply the instruction." : ""}

    ${focus}
    `;

    const raw = await generateWithFallback([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ]);

    const code = await ensureCompleteCode(sanitizeGeneratedCode(raw), instruction);
    if (!code) {
      return NextResponse.json({ error: "The model returned empty code. Try again." }, { status: 502 });
    }
    const before = extractDependencies(currentCode);
    const after = extractDependencies(code);
    const analysis = analyzeJsx(code);

    return NextResponse.json({
      code,
      explanation: instruction,
      affectedSections: selectedName ? [selectedName] : analysis.tree.slice(0, 4).map((node) => node.name),
      dependenciesAdded: after.filter((item) => !before.includes(item)),
      dependenciesRemoved: before.filter((item) => !after.includes(item)),
      dependencies: after,
      warnings: analysis.warnings,
      tree: analysis.tree,
    });
  } catch (error) {
    return NextResponse.json(
      { error: publicErrorMessage(error, "Failed to iterate component") },
      { status: 500 }
    );
  }
}
