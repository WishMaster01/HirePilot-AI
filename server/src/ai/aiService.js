import { callGeminiProvider } from "./providers/gemini.provider.js";
import { callOpenRouterProvider } from "./providers/openrouter.provider.js";

const stripCodeFences = (text = "") =>
  String(text)
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

const extractJsonCandidate = (text = "") => {
  const cleaned = stripCodeFences(text);
  if (cleaned.startsWith("{") || cleaned.startsWith("[")) {
    return cleaned;
  }

  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    return cleaned.slice(objectStart, objectEnd + 1);
  }

  const arrayStart = cleaned.indexOf("[");
  const arrayEnd = cleaned.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    return cleaned.slice(arrayStart, arrayEnd + 1);
  }

  return cleaned;
};

export const safeJsonParse = (rawText) => {
  try {
    return JSON.parse(extractJsonCandidate(rawText));
  } catch (error) {
    const parseError = new Error("AI response was not valid JSON.");
    parseError.cause = error;
    throw parseError;
  }
};

const buildRepairPrompt = ({ rawText, schemaName }) => `
You are repairing an AI response for HirePilot AI.
Return only valid JSON. Do not use markdown. Do not add explanations.
Schema name: ${schemaName || "unknown"}

Broken response:
${rawText}
`;

export const callAIProvider = async ({ provider, prompt }) => {
  const selectedProvider = String(provider || process.env.AI_PROVIDER || "gemini").toLowerCase();

  if (selectedProvider === "openrouter") {
    return callOpenRouterProvider(prompt);
  }

  if (selectedProvider === "gemini") {
    return callGeminiProvider(prompt);
  }

  throw new Error(`Unsupported AI provider: ${selectedProvider}`);
};

export const generateAIResponse = async ({ provider, prompt, schemaName } = {}) => {
  try {
    if (!prompt || !String(prompt).trim()) {
      throw new Error("AI prompt is required.");
    }

    const raw = await callAIProvider({ provider, prompt });

    try {
      return {
        success: true,
        data: safeJsonParse(raw),
        raw,
      };
    } catch {
      const repairPrompt = buildRepairPrompt({ rawText: raw, schemaName });
      const repairedRaw = await callAIProvider({ provider, prompt: repairPrompt });
      return {
        success: true,
        data: safeJsonParse(repairedRaw),
        raw: repairedRaw,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "AI generation failed",
      error: error.message || "Unknown AI error",
    };
  }
};
