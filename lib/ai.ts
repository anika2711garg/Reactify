import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Keys
const groqKey = (process.env.GROQ_API_KEY || '').trim().replace(/^["']|["']$/g, '');
const googleKey = (process.env.GOOGLE_API_KEY || '').trim().replace(/^["']|["']$/g, '');

// Log availability (safe) - keeping debugging for now
console.log(`API Config: Groq=${!!groqKey}, Google=${!!googleKey}`);

// Groq Client (OpenAI standard)
const groq = new OpenAI({
    apiKey: groqKey || 'dummy',
    baseURL: 'https://api.groq.com/openai/v1',
});

// Gemini Client (Native SDK)
// Initialize only if key exists to prevent errors during init
const genAI = googleKey ? new GoogleGenerativeAI(googleKey) : null;

export const MODEL_GROQ = 'llama-3.3-70b-versatile';
export const MODEL_GEMINI = 'gemini-1.5-flash';

export async function generateWithFallback(messages: any[], temperature: number = 0.2) {
    // 1. Try Groq (Preferred for Llama 3)
    if (groqKey) {
        try {
            console.log('Attempting generation with Groq (Llama 3)...');
            const completion = await groq.chat.completions.create({
                model: MODEL_GROQ,
                messages,
                temperature,
                max_tokens: 8192,
            });
            return completion.choices[0]?.message?.content || '';
        } catch (error: any) {
            console.warn('Groq failed:', error.message);

            // If strictly rate limited or server error, switch.
            if (!googleKey || !genAI) throw error; // No backup
            console.log('Falling back to Google Gemini (Native SDK)...');
        }
    }

    // 2. Try Google Gemini (Native SDK)
    if (googleKey && genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: MODEL_GEMINI });

            // Map keys
            const systemMessage = messages.find((m: any) => m.role === 'system')?.content || '';
            const userMessage = messages.find((m: any) => m.role === 'user')?.content || '';

            // Combine for simple generation
            // Note: Gemini 1.5 supports system instructions in config, but prompting in body is robust.
            const prompt = `${systemMessage}\n\nUSER REQUEST:\n${userMessage}`;

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: temperature,
                    maxOutputTokens: 8192,
                }
            });

            return result.response.text();
        } catch (error: any) {
            console.error('Gemini Native SDK failed:', error.message);
            throw error; // Both failed
        }
    }

    throw new Error('No valid API keys configured (GROQ_API_KEY or GOOGLE_API_KEY)');
}
