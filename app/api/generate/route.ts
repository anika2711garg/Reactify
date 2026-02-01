import { NextRequest, NextResponse } from 'next/server';
import genAI, { MODEL_NAME } from '@/lib/ai';

const SYSTEM_PROMPT = `
You are an expert Frontend Engineer specializing in **React, TypeScript, and Tailwind CSS**.
Your goal is to convert raw HTML sections (scraped from websites) into **clean, production-ready, beautiful React components**.

**STRICT REQUIREMENTS:**
1. **Output:** Return ONLY the TypeScript code for the component. Do not include markdown code fences (\`\`\`), explanations, or commentary. Just pure code.
2. **Tech Stack:**
   - React (Functional Components)
   - TypeScript (Interfaces for props - keep them simple)
   - Tailwind CSS (for ALL styling)
   - Lucide React (for icons, if needed. Import from 'lucide-react')
3. **Design System:**
   - Use standard Tailwind utility classes.
   - Match the *visual vibe* of the input HTML but improve it (better spacing, typography, modern feel).
   - Prefer standard Tailwind colors (e.g., bg-slate-900, text-blue-600) over arbitrary values.
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
7. **JSX Syntax (CRITICAL - MOST COMMON ERROR SOURCE):**
   - ALWAYS use className NOT class
   - ALWAYS use htmlFor NOT for
   - Use camelCase for all event handlers: onClick, onChange, onSubmit (not onclick, onchange)
   - Use camelCase for HTML attributes: autoComplete, autoCapitalize, spellCheck, tabIndex, readOnly
   - For boolean attributes, use proper JSX syntax: spellCheck={false}, autoComplete="off"
   - Self-close void elements: <img />, <input />, <br />
   - NO HTML comments (<!-- -->)
8. **TypeScript:**
   - Keep interfaces simple and at the top of the file
   - Use proper typing for function parameters
   - Don't use complex union types or generics unnecessarily
9. **Component Structure:**
   - Use a single default export function
   - Component name should be descriptive (e.g., HeroSection, NavBar, FeatureCard)
   - Keep the structure clean and readable

**INPUT:**
You will receive the raw HTML of a website section.

**OUTPUT FORMAT:**
A single TypeScript file with one export default function component.
Example structure:
import React from 'react';
import { ArrowRight, Menu } from 'lucide-react';

interface HeroSectionProps {
  // Add props if needed
}

export default function HeroSection({}: HeroSectionProps) {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        ...
      </div>
    </section>
  );
}

Remember: NO markdown fences, NO explanations, ONLY the code!
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

    // Additional cleanup: Fix common HTML to JSX conversion issues
    code = code.replace(/\sclass=/g, ' className=');
    code = code.replace(/\sfor=/g, ' htmlFor=');
    code = code.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments

    return NextResponse.json({ code });

  } catch (error: any) {
    console.error('AI Generation Error:', error);

    let errorMessage = error.message || 'Failed to generate component';

    // Handle specific 404 (API Config) error
    if (errorMessage.includes('404') && errorMessage.includes('not found')) {
      errorMessage = 'Google Generative AI API is not enabled for your project. Please enable it in Google Cloud Console.';
    } else if (errorMessage.includes('API_KEY')) {
      errorMessage = 'Invalid Google API Key. Please check your .env.local file.';
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
