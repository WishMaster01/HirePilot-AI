import axios from "axios";

export const callGeminiProvider = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  try {
    const response = await axios.post(
      url,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: `${prompt}\n\nReturn strict JSON only. Do not use markdown.` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 45000,
      }
    );

    const content = response?.data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join("");
    if (!content || !content.trim()) {
      throw new Error("Gemini returned an empty response.");
    }

    return content;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || error.message || "Gemini API error.");
  }
};

export default callGeminiProvider;
