import axios from "axios";

export const callOpenRouterProvider = async (prompt) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL || "deepseek/deepseek-r1:free",
        messages: [
          {
            role: "system",
            content: "You are HirePilot AI. Return strict JSON only. Do not use markdown.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.OPENROUTER_SITE_URL || process.env.FRONTEND_URL || "http://localhost:5173",
          "X-Title": process.env.OPENROUTER_APP_NAME || "HirePilot AI",
        },
        timeout: 45000,
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content || !content.trim()) {
      throw new Error("OpenRouter returned an empty response.");
    }

    return content;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || error.message || "OpenRouter API error.");
  }
};

export default callOpenRouterProvider;
