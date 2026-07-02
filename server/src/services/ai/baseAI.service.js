import { generateAIResponse } from "../../ai/aiService.js";

export const callAIJson = async ({ system, user, prompt, fallback, schemaName, provider }) => {
  const aiPrompt = prompt || `${system || "Generate a structured AI response."}\n\nInput:\n${typeof user === "string" ? user : JSON.stringify(user || {}, null, 2)}\n\nReturn JSON only.`;
  const result = await generateAIResponse({ provider, prompt: aiPrompt, schemaName });

  if (!result.success) {
    return {
      data: fallback,
      raw: null,
      tokensUsed: undefined,
      provider: "fallback",
      error: result.error,
    };
  }

  return {
    data: result.data,
    raw: result.raw,
    tokensUsed: undefined,
    provider: provider || process.env.AI_PROVIDER || "gemini",
  };
};

export const clampScore = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

export const listFromText = (value) =>
  String(value || "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
