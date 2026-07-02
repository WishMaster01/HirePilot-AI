import { callAIJson } from "./baseAI.service.js";
import { buildMentorChatPrompt } from "../../ai/prompts/mentor.prompt.js";

export const answerMentorAI = async ({ message, context }) => {
  const fallback = {
    answer:
      "Focus on one target role, close your top two skill gaps, update your resume with role keywords, and practice three focused interviews weekly.",
    suggestedActions: ["Update resume", "Practice DSA", "Start one portfolio project"],
  };

  const result = await callAIJson({
    prompt: buildMentorChatPrompt({ userProfile: context, userMessage: message }),
    fallback,
    schemaName: "mentorChat",
  });
  const data = result.data || fallback;
  result.data = {
    ...data,
    answer: data.answer || data.reply || fallback.answer,
  };
  return result;
};
