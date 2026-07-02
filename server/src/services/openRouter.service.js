import { callAIProvider } from "../ai/aiService.js"

export const askAi = async (messages) => {
    try {
        if(!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.");
        }
        const prompt = messages
            .map((message) => `${message.role || "user"}: ${message.content || ""}`)
            .join("\n\n");
        const content = await callAIProvider({ prompt });

        if (!content || !content.trim()) {
      throw new Error("AI returned empty response.");
    }

    return content
    } catch (error) {
            console.error("AI Provider Error:", error.message);
    throw new Error("AI Provider Error");

    }
}
