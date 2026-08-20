import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAiKeys } from "@/lib/ai/env";

export const MODEL_GROQ = "llama-3.3-70b-versatile";
export const MODEL_GEMINI = "gemini-2.5-flash";

const GROQ_MODELS = [
  process.env.GROQ_MODEL,
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
].filter((model): model is string => Boolean(model));

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
].filter((model): model is string => Boolean(model));

function unique(models: string[]) {
  return [...new Set(models)];
}

function errorText(error: unknown) {
  if (error instanceof Error) return `${error.message} ${JSON.stringify((error as { error?: unknown }).error ?? "")}`;
  return String(error);
}

function isUnavailableModel(error: unknown) {
  return /404|not found|decommissioned|no longer available|does not exist|model_not_found|unknown model/i.test(
    errorText(error)
  );
}

function isProviderExhausted(error: unknown) {
  return /429|rate limit|quota|resource.?exhausted|insufficient|credits|billing|too many requests|limit exceeded|capacity/i.test(
    errorText(error)
  );
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
  let lastError: unknown;

  for (const model of unique(GROQ_MODELS)) {
    try {
      console.log(`Attempting generation with Groq (${model})...`);
      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: 8192,
      });
      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      lastError = error;
      if (isProviderExhausted(error)) {
        console.warn("Groq quota or rate limit reached. Switching provider...");
        throw error;
      }
      if (isUnavailableModel(error)) {
        console.warn(`Groq model unavailable: ${model}`);
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Groq generation failed");
}

async function generateWithGemini(prompt: string, temperature: number, apiKey: string) {
  const client = geminiClient(apiKey);
  let lastError: unknown;

  for (const modelName of unique(GEMINI_MODELS)) {
    try {
      console.log(`Attempting generation with Gemini (${modelName})...`);
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: 8192,
        },
      });
      return result.response.text();
    } catch (error) {
      lastError = error;
      if (isProviderExhausted(error)) {
        console.warn("Gemini quota or rate limit reached. Switching provider...");
        throw error;
      }
      if (isUnavailableModel(error)) {
        console.warn(`Gemini model unavailable: ${modelName}`);
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Gemini generation failed");
}

async function generateWithGeminiImage(
  prompt: string,
  mimeType: string,
  base64: string,
  temperature: number,
  apiKey: string
) {
  const client = geminiClient(apiKey);
  let lastError: unknown;

  for (const modelName of unique(GEMINI_MODELS)) {
    try {
      console.log(`Attempting screenshot generation with Gemini (${modelName})...`);
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
    } catch (error) {
      lastError = error;
      if (isProviderExhausted(error)) {
        console.warn("Gemini vision quota or rate limit reached.");
        throw error;
      }
      if (isUnavailableModel(error)) {
        console.warn(`Gemini vision model unavailable: ${modelName}`);
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Gemini screenshot generation failed");
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
      const reason = error instanceof Error ? error.message : String(error);
      if (next) {
        console.warn(`${provider} failed (${reason}). Switching to ${next}...`);
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
  const { googleKey } = getAiKeys();
  console.log(`API Config: Groq=skipped, Google=${Boolean(googleKey)}`);

  if (!googleKey) {
    throw new Error("NO_GEMINI_KEY");
  }

  return generateWithGeminiImage(prompt, mimeType, base64, temperature, googleKey);
}
