import { NextRequest, NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/ai';

const SYSTEM_PROMPT = `
You are an expert Frontend Engineer and React Refactoring specialist.
Your goal is to MODIFY existing React code based on user instructions.

**STRICT REQUIREMENTS:**
1. **Output:** Return ONLY the updated React code (JavaScript/JSX). No markdown fences. No TypeScript.
2. **Instruction Following:**
   - **PRIORITY #1:** You MUST follow the user's instruction. If they say "make it green", MAKE IT GREEN.
   - If the instruction contradicts the existing design, favor the instruction.
   - If the user asks for a style change (color, spacing, layout), apply it boldly and correctly using Tailwind classes (e.g., bg-green-500, text-green-900).
   - **Do NOT** explain your changes. Just return code.
3. **Code Quality:**
   - PRESERVE existing functionality unless asked to change it.
   - Maintain the same tech stack (React + Tailwind + Lucide).
   - **Do NOT** use react-icons (e.g., no FiSearch, FaHome). Use ONLY lucide-react.
   - Ensure the code is complete, valid, and production-ready.
   - Do NOT introduce syntax errors.
   - Use 'export default function GeneratedComponent' or similar consistent naming.

**INPUT:**
- Current Code
- User Instruction

**OUTPUT:**
- The fully updated component code. Only code.
`;

export async function POST(req: NextRequest) {
    try {
        const { currentCode, instruction } = await req.json();

        if (!currentCode || !instruction) {
            return NextResponse.json({ error: 'Current code and instruction are required' }, { status: 400 });
        }

        if (!process.env.GROQ_API_KEY && !process.env.GOOGLE_API_KEY) {
            return NextResponse.json({ error: 'API Key is missing' }, { status: 500 });
        }

        const userMessage = `
    EXISTING CODE:
    ${currentCode}

    USER INSTRUCTION:
    ${instruction}
    `;

        let code = await generateWithFallback([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMessage }
        ]);

        code = code.replace(/```tsx?/g, '').replace(/```/g, '').trim();

        return NextResponse.json({ code });

    } catch (error: any) {
        console.error('AI Iteration Error:', error);

        let errorMessage = error.message || 'Failed to iterate component';
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
