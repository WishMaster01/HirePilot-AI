export const aiConfig = {
  provider: process.env.AI_PROVIDER || "gemini",
  geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  openRouterModel: process.env.OPENROUTER_MODEL || "deepseek/deepseek-r1:free",
};
