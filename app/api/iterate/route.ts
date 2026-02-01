import { NextRequest, NextResponse } from 'next/server';
import genAI, { MODEL_NAME } from '@/lib/ai';

const SYSTEM_PROMPT = `
You are an expert Frontend Engineer and React Refactoring specialist.
Your goal is to MODIFY existing React code based on user instructions.

**STRICT REQUIREMENTS:**
1. **Output:** Return ONLY the updated TypeScript code. No markdown fences.
2. **Behavior:**
   - Apply the user's change request (e.g., "Change background to blue", "Add more padding").
   - PRESERVE existing functionality and structure unless asked to change it.
   - Do NOT rewrite the entire component from scratch if only a small change is needed, but ensure the resulting code is complete and valid.
   - Maintain the same tech stack (React + Tailwind + Lucide).
3. **Robustness:**
   - If the user asks for something impossible, try to do the closest reasonable thing or ignore if strictly impossible (but usually just do it).
   - Ensure clear, readable code.

**INPUT:**
- Current Code
- User Instruction

**OUTPUT:**
- The fully updated component code.
`;

export async function POST(req: NextRequest) {
    try {
        const { currentCode, instruction } = await req.json();

        if (!currentCode || !instruction) {
            return NextResponse.json({ error: 'Current code and instruction are required' }, { status: 400 });
        }

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json({ error: 'Google API Key is missing' }, { status: 500 });
        }

        const userMessage = `
    EXISTING CODE:
    ${currentCode}

    USER INSTRUCTION:
    ${instruction}
    `;

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            systemInstruction: SYSTEM_PROMPT
        });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        let code = response.text();

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
