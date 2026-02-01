import { NextRequest, NextResponse } from 'next/server';
import genAI, { MODEL_NAME } from '@/lib/ai';

const SYSTEM_PROMPT = `
You are an expert Frontend Engineer specializing in **React, TypeScript, and Tailwind CSS**.
Your goal is to convert raw HTML sections (scraped from websites) into **clean, production-ready, beautiful React components**.

**STRICT REQUIREMENTS:**
1. **Output:** Return ONLY the TypeScript code for the component. Do not include markdown code fences (\`\`\`) or explanations. Just the code.
2. **Tech Stack:**
   - React (Functional Components)
   - TypeScript (Interfaces for props)
   - Tailwind CSS (for ALL styling)
   - Lucide React (for icons, if needed. Import from 'lucide-react')
3. **Design System:**
   - Use standard Tailwind utility classes.
   - Match the *visual vibe* of the input HTML but improve it (better spacing, typography, modern feel).
   - Ensure specific colors are replaced with Tailwind's nearest distinct colors or arbitrary values (e.g., \`bg-[#1a2b3c]\`) if critical, but prefer standard palette (e.g., \`bg-slate-900\`) for maintainability.
4. **Interactive Elements:**
   - Buttons, Inputs, Links must look interactive.
   - Use correct cursor states and hover effects (e.g., \`hover:bg-opacity-90\`).
5. **Responsiveness:**
   - Every component MUST be fully mobile-responsive.
   - Use \`md:\`, \`lg:\` prefixes to adapt layouts.
6. **Images:**
   - Use \`<img />\` tags with the \`src\` provided in the HTML. 
   - Add \`alt\` text.
   - Add \`className="object-cover"\` or similar to prevent distortion.
7. **Accessibility:**
   - Use semantic tags (<section>, <article>, <h1>, etc.).

**INPUT:**
You will receive the raw HTML of a website section.

**OUTPUT FORMAT:**
A single file export default function component.
Example:
import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-white py-20">
      ...
    </section>
  )
}
`;

export async function POST(req: NextRequest) {
    try {
        const { html, requirements } = await req.json();

        if (!html) {
            return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
        }

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json({ error: 'Google API Key is missing' }, { status: 500 });
        }

        // Truncate HTML if it's too massive to save tokens, but keep enough for structure.
        // 50k chars is a reasonable upper limit for a section.
        const truncatedHtml = html.length > 50000 ? html.substring(0, 50000) + '...' : html;

        const userMessage = `
    Here is the HTML section to convert:
    ${truncatedHtml}

    ${requirements ? `Additional User Requirements: ${requirements}` : ''}
    `;

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: SYSTEM_PROMPT
        });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        let code = response.text();

        // Cleanup: Remove markdown fences if the model ignored the system prompt
        code = code.replace(/```tsx?/g, '').replace(/```/g, '').trim();

        return NextResponse.json({ code });

    } catch (error) {
        console.error('AI Generation Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to generate component' },
            { status: 500 }
        );
    }
}
