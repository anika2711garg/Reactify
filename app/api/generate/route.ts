import { NextRequest, NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/ai';

const SYSTEM_PROMPT = `
You are an expert Frontend Engineer specializing in **React, JavaScript, and Tailwind CSS**.
Your goal is to convert raw HTML sections (scraped from websites) into **clean, production-ready, beautiful React components**.

**STRICT REQUIREMENTS:**
1. **Output:** Return ONLY the React code (JavaScript/JSX). Do not include markdown code fences (\`\`\`). No TypeScript types.
2. **Tech Stack:**
   - React (Functional Components)
   - JavaScript (No TypeScript types/interfaces)
   - Tailwind CSS (for ALL styling)
   - Lucide React (for icons, if needed. Import from 'lucide-react')
   - **Do NOT** use react-icons (e.g., no FiSearch, FaHome). Use ONLY lucide-react.
3. **Design System & Visual Excellence (CRITICAL):**
   - **Modern & Premium:** The component MUST look premium, modern, and polished. Avoid generic "bootstrappy" looks.
   - **Colors:** Use refined color palettes (e.g., slate-900 for dark text, slate-500 for secondary, distinctive primary colors like indigo-600 or emerald-600).
   - **Spacing:** Use generous whitespace (py-12, py-24). Don't cram elements.
   - **Typography:** Use varying font weights (font-bold for headings, font-medium for accents) and tight leading (leading-tight) for large text.
   - **Effects:** Use subtle shadows (shadow-lg, shadow-xl), rounded corners (rounded-xl, rounded-2xl), and possibly backdrop-blur or gradients where appropriate.
   - **Micro-interactions:** Add hover states for all interactive elements (hover:scale-105, hover:text-blue-500, transition-all, duration-300).
4. **Interactive Elements:**
   - Buttons, Inputs, Links must look interactive.
   - Use correct cursor states and hover effects (e.g., hover:bg-blue-700, cursor-pointer).
5. **Responsiveness:**
   - Every component MUST be fully mobile-responsive.
   - Use md:, lg:, xl: prefixes to adapt layouts.
6. **Images:**
   - Use <img /> tags with the src provided in the HTML. 
   - Add meaningful alt text.
   - Add className="object-cover" or similar to prevent distortion.
7. **JSX Syntax:**
   - ALWAYS use className NOT class
   - ALWAYS use htmlFor NOT for
   - Self-close void elements: <img />, <input />, <br />
   - NO HTML comments (<!-- -->)
8. **Code Style:**
   - Keep props simple.
   - Clean, readable code.
9. **Structure:**
   - Single default export.
   - Clean, readable code.

**Avoid:**
- "Boxy" look with default borders everywhere.
- Plain blue standard links.
- Tiny clickable areas.
- Lack of negative space.

**INPUT:**
You will receive the raw HTML of a website section.

**OUTPUT FORMAT:**
A single React file (JavaScript/JSX) with one export default function component.
Remember: NO markdown fences, NO explanations, ONLY the code!
`;

export async function POST(req: NextRequest) {
  try {
    const { html, requirements, style } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY && !process.env.GOOGLE_API_KEY) {
      return NextResponse.json({ error: 'API Key is missing' }, { status: 500 });
    }

    // 20k chars is a reasonable upper limit for a section to ensure speed.
    const truncatedHtml = html.length > 20000 ? html.substring(0, 20000) + '...' : html;

    let styleInstruction = "";
    if (style) {
      styleInstruction = `
    **STYLE VARIANT:** "${style}"
    - If "Minimal": Use lots of whitespace, simple typography, subtle borders, no heavy shadows.
    - If "Modern": Use glassmorphism, gradients, rounded corners, soft large shadows.
    - If "Dense": Use compact spacing, smaller fonts, high information density, borders.
    - If "Brutalist": Use high contrast, thick borders, sharp corners, bold typography.
    `;
    }

    const userMessage = `
    Here is the HTML section to convert:
    ${truncatedHtml}

    ${styleInstruction}
    ${requirements ? `Additional User Requirements: ${requirements}` : ''}
    `;

    let code = await generateWithFallback([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ]);

    // Cleanup: Remove markdown fences
    code = code.replace(/```tsx?/g, '').replace(/```/g, '').trim();

    // Additional cleanup: Fix common HTML to JSX conversion issues
    code = code.replace(/\sclass=/g, ' className=');
    code = code.replace(/\sfor=/g, ' htmlFor=');
    code = code.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments

    return NextResponse.json({ code });

  } catch (error: any) {
    console.error('AI Generation Error:', error);

    let errorMessage = error.message || 'Failed to generate component';

    if (errorMessage.includes('401')) {
      errorMessage = 'Invalid API Key. Please check your .env.local file.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
