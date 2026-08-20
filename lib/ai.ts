import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAiKeys } from "@/lib/ai/env";

export const MODEL_GROQ = "llama-3.3-70b-versatile";
export const MODEL_GEMINI = "gemini-2.5-flash";

const GROQ_MODELS = [
  process.env.GROQ_MODEL,
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
].filter((model): model is string => Boolean(model));

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
].filter((model): model is string => Boolean(model));

function unique(models: string[]) {
  return [...new Set(models)];
}

function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function tryModels<T>(label: string, models: string[], run: (model: string) => Promise<T>) {
  let lastError: unknown;

  for (const model of unique(models)) {
    try {
      console.log(`Attempting ${label} with ${model}...`);
      return await run(model);
    } catch (error) {
      lastError = error;
      console.warn(`${label} ${model} failed: ${errorText(error)}`);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`${label} generation failed`);
}

function groqClient(apiKey: string) {
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

function geminiClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

async function generateWithGroq(messages: any[], temperature: number, apiKey: string) {
  const client = groqClient(apiKey);
  return tryModels("Groq", GROQ_MODELS, async (model) => {
    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: 8192,
    });
    return completion.choices[0]?.message?.content || "";
  });
}

async function generateWithGemini(prompt: string, temperature: number, apiKey: string) {
  const client = geminiClient(apiKey);
  return tryModels("Gemini", GEMINI_MODELS, async (modelName) => {
    const model = client.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: 8192,
      },
    });
    return result.response.text();
  });
}

async function generateWithGeminiImage(
  prompt: string,
  mimeType: string,
  base64: string,
  temperature: number,
  apiKey: string
) {
  const client = geminiClient(apiKey);
  return tryModels("Gemini vision", GEMINI_MODELS, async (modelName) => {
    const model = client.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, { inlineData: { mimeType, data: base64 } }],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: 8192,
      },
    });
    return result.response.text();
  });
}

function geminiPromptFromMessages(messages: any[]) {
  const systemMessage = messages.find((m: any) => m.role === "system")?.content || "";
  const userMessage = messages.find((m: any) => m.role === "user")?.content || "";
  return `${systemMessage}\n\nUSER REQUEST:\n${userMessage}`;
}

export async function generateWithFallback(messages: any[], temperature: number = 0.2) {
  const { groqKey, googleKey } = getAiKeys();
  console.log(`API Config: Groq=${Boolean(groqKey)}, Google=${Boolean(googleKey)}`);

  if (!groqKey && !googleKey) {
    throw new Error("NO_AI_KEYS");
  }

  const providers: Array<"groq" | "gemini"> = [];
  if (groqKey) providers.push("groq");
  if (googleKey) providers.push("gemini");

  let lastError: unknown;

  for (let index = 0; index < providers.length; index += 1) {
    const provider = providers[index];
    const next = providers[index + 1];

    try {
      if (provider === "groq" && groqKey) {
        return await generateWithGroq(messages, temperature, groqKey);
      }
      if (provider === "gemini" && googleKey) {
        return await generateWithGemini(geminiPromptFromMessages(messages), temperature, googleKey);
      }
    } catch (error) {
      lastError = error;
      if (next) {
        console.warn(`${provider} failed. Switching to ${next}...`);
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("All AI providers failed");
}

export async function generateFromImage(
  prompt: string,
  mimeType: string,
  base64: string,
  temperature: number = 0.2
) {
  const { groqKey, googleKey } = getAiKeys();
  console.log(`API Config: Groq=${Boolean(groqKey)}, Google=${Boolean(googleKey)}`);

  if (googleKey) {
    try {
      return await generateWithGeminiImage(prompt, mimeType, base64, temperature, googleKey);
    } catch (error) {
      if (!groqKey) throw error;
      console.warn("Gemini vision failed. Switching to Groq...");
    }
  }

  if (groqKey) {
    return generateWithGroq(
      [
        {
          role: "system",
          content: "You write production-ready React + Tailwind components. Return only code.",
        },
        {
          role: "user",
          content: `${prompt}\n\nThe screenshot could not be sent to Gemini. Recreate a polished, realistic interface from the prompt and any HTML hints.`,
        },
      ],
      temperature,
      groqKey
    );
  }

  throw new Error("NO_AI_KEYS");
}
