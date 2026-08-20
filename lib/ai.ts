import OpenAI from "openai";
import { getAiKeys } from "@/lib/ai/env";

export const MODEL_GROQ = "openai/gpt-oss-20b";
export const MODEL_GEMINI = "gemini-3.6-flash";

const DEAD_MODELS = new Set([
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "llama-3.1-8b-instant",
  "llama-3.1-70b-versatile",
]);

const GROQ_MODELS = [
  process.env.GROQ_MODEL,
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.3-70b-versatile",
].filter((model): model is string => Boolean(model) && !DEAD_MODELS.has(model));

const GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
].filter((model): model is string => Boolean(model) && !DEAD_MODELS.has(model));

function unique(models: string[]) {
  return [...new Set(models)];
}

function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function isTransient(error: unknown) {
  return /503|502|429|high demand|overloaded|unavailable|try again/i.test(errorText(error));
}

async function tryModels<T>(label: string, models: string[], run: (model: string) => Promise<T>) {
  let lastError: unknown;

  for (const model of unique(models)) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        console.log(`Attempting ${label} with ${model}...`);
        return await run(model);
      } catch (error) {
        lastError = error;
        console.warn(`${label} ${model} failed: ${errorText(error)}`);
        if (isTransient(error) && attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }
        break;
      }
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

async function geminiGenerate(
  apiKey: string,
  modelName: string,
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>,
  temperature: number
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature, maxOutputTokens: 8192 },
      }),
    }
  );
  const data = (await response.json()) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini ${modelName} failed (${response.status})`);
  }
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("") || "";
  if (!text) throw new Error(`Gemini ${modelName} returned empty text`);
  return text;
}

async function generateWithGemini(prompt: string, temperature: number, apiKey: string) {
  return tryModels("Gemini", GEMINI_MODELS, (modelName) =>
    geminiGenerate(apiKey, modelName, [{ text: prompt }], temperature)
  );
}

async function generateWithGeminiImage(
  prompt: string,
  mimeType: string,
  base64: string,
  temperature: number,
  apiKey: string
) {
  return tryModels("Gemini vision", GEMINI_MODELS, (modelName) =>
    geminiGenerate(
      apiKey,
      modelName,
      [{ text: prompt }, { inlineData: { mimeType, data: base64 } }],
      temperature
    )
  );
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
      throw toFinalAiError(error);
    }
  }

  throw toFinalAiError(lastError);
}

function toFinalAiError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/404|not found|no longer available|does not exist|unknown model|decommissioned/i.test(message)) {
    return new Error("ALL_MODELS_UNAVAILABLE");
  }
  return error instanceof Error ? error : new Error(message || "All AI providers failed");
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
      if (!groqKey) throw toFinalAiError(error);
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
