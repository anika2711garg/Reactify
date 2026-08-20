import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/ai";
import { extractDependencies, publicErrorMessage, sanitizeGeneratedCode } from "@/lib/ai/contract";
import { analyzeJsx } from "@/lib/parser/jsx-tree";

const SYSTEM_PROMPT = `
You are an expert Frontend Engineer and React Refactoring specialist.
Your goal is to MODIFY existing React code based on user instructions.

**STRICT REQUIREMENTS:**
1. Return ONLY the updated React code (JavaScript/JSX). No markdown fences. No TypeScript.
2. Follow the user's instruction as PRIORITY #1.
3. Preserve existing functionality unless asked to change it.
4. Maintain React + Tailwind + lucide-react.
5. If the user asks to change one element, keep unrelated sections intact.
6. Use semantic tags so the component tree stays meaningful.
7. Use 'export default function GeneratedComponent' or similar consistent naming.

**INPUT:**
- Current Code
- User Instruction
- Optional selected element path/name

**OUTPUT:**
The fully updated component code. Only code.
`;

export async function POST(req: NextRequest) {
  try {
    const { currentCode, instruction, selectedPath, selectedName } = await req.json();

    if (!currentCode || !instruction) {
      return NextResponse.json({ error: "Current code and instruction are required" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY && !process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: "AI service is not configured on the server." }, { status: 500 });
    }

    const focus = selectedPath
      ? `Focus the change on the element at data-rf-path="${selectedPath}"${selectedName ? ` (${selectedName})` : ""}. Keep other sections stable.`
      : "";

    const userMessage = `
    EXISTING CODE:
    ${currentCode}

    USER INSTRUCTION:
    ${instruction}

    ${focus}
    `;

    const raw = await generateWithFallback([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ]);

    const code = sanitizeGeneratedCode(raw);
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
