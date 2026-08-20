import { NextRequest, NextResponse } from "next/server";
import { generateFromImage, generateWithFallback } from "@/lib/ai";
import { hasAiKeys } from "@/lib/ai/env";
import { extractDependencies, publicErrorMessage, sanitizeGeneratedCode } from "@/lib/ai/contract";
import { ensureCompleteCode } from "@/lib/ai/complete";
import { parseDataUrl } from "@/lib/images/compress";
import { analyzeJsx } from "@/lib/parser/jsx-tree";

export const maxDuration = 60;

const SYSTEM_PROMPT = `
You are an expert Frontend Engineer specializing in **React, JavaScript, and Tailwind CSS**.
Your goal is to convert raw HTML sections or UI screenshots into **clean, production-ready, beautiful React components**.

**STRICT REQUIREMENTS:**
1. **Output:** Return ONLY the React code (JavaScript/JSX). Do not include markdown code fences. No TypeScript types.
2. **Tech Stack:**
   - React (Functional Components)
   - JavaScript (No TypeScript types/interfaces)
   - Tailwind CSS (for ALL styling)
   - Lucide React (for icons, if needed. Import from 'lucide-react')
   - **Do NOT** use react-icons. Use ONLY lucide-react.
3. **Design System & Visual Excellence (CRITICAL):**
   - The component MUST look premium, modern, and polished.
   - Closely match layout, spacing, typography, and color from the source.
   - Use subtle shadows, rounded corners, and hover states.
4. **Responsiveness:**
   - Every component MUST be fully mobile-responsive.
   - Use sm:, md:, lg:, and xl: prefixes.
5. **JSX Syntax:**
   - ALWAYS use className NOT class
   - ALWAYS use htmlFor NOT for
   - Self-close void elements
   - Single default export
   - Meaningful semantic tags (header, nav, main, section, footer)
   - NEVER stop mid-attribute. Every className must have a closing quote.
   - Prefer a complete smaller component over a truncated large one.
   - Recreate ONLY the provided section. Do not rebuild the whole site mega-menu.
   - Keep the file under 80 lines and finish every tag.
   - Import at most 4 lucide icons and close the import.
6. **Images:**
   - Recreate visual structure with Tailwind. Use placeholder images only when necessary.

**OUTPUT FORMAT:**
A single React file with one export default function component.
NO markdown fences, NO explanations, ONLY the code!
`;

function styleInstruction(style?: string) {
  if (!style) return "";
  return `
    **STYLE VARIANT:** "${style}"
    - If "Minimal": Use lots of whitespace, simple typography, subtle borders, no heavy shadows.
    - If "Modern": Use glassmorphism, gradients, rounded corners, soft large shadows.
    - If "Dense": Use compact spacing, smaller fonts, high information density, borders.
    - If "Brutalist": Use high contrast, thick borders, sharp corners, bold typography.
  `;
}

export async function POST(req: NextRequest) {
  try {
    const { html, requirements, style, screenshot, mode } = await req.json();
    const hasHtml = typeof html === "string" && html.trim().length > 0;
    const preferImage = mode === "screenshot" || !hasHtml;
    const image = preferImage && typeof screenshot === "string" ? parseDataUrl(screenshot) : null;

    if (!hasHtml && !image) {
      return NextResponse.json({ error: "HTML content or a screenshot is required" }, { status: 400 });
    }

    if (!hasAiKeys()) {
      return NextResponse.json(
        { error: publicErrorMessage(new Error("NO_AI_KEYS"), "AI service is not configured.") },
        { status: 500 }
      );
    }

    const extras = `
    ${styleInstruction(style)}
    ${requirements ? `Additional User Requirements: ${requirements}` : ""}
    `;

    let raw = "";

    if (image) {
      const prompt = `${SYSTEM_PROMPT}

Reconstruct this screenshot as a complete production-ready React + Tailwind component.
Match the visual hierarchy, colors, spacing, and typography as closely as possible.
${hasHtml ? `Optional structural hints:\n${html.slice(0, 4000)}` : ""}
${extras}`;
      raw = await generateFromImage(prompt, image.mimeType, image.base64);
    } else {
      const truncatedHtml = html.length > 4000 ? html.substring(0, 4000) + "..." : html;
      raw = await generateWithFallback([
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Here is the HTML section to convert:\n${truncatedHtml}\n${extras}`,
        },
      ]);
    }

    const code = await ensureCompleteCode(sanitizeGeneratedCode(raw));
    if (!code) {
      return NextResponse.json({ error: "The model returned empty code. Try again." }, { status: 502 });
    }

    const analysis = analyzeJsx(code);
    const dependencies = extractDependencies(code);

    return NextResponse.json({
      code,
      explanation: image
        ? "Reconstructed the uploaded screenshot as a React + Tailwind component."
        : "Converted the captured interface into a responsive React + Tailwind component.",
      dependencies,
      warnings: analysis.warnings,
      tree: analysis.tree,
      componentName: analysis.componentName,
    });
  } catch (error) {
    return NextResponse.json(
      { error: publicErrorMessage(error, "Failed to generate component") },
      { status: 500 }
    );
  }
}
