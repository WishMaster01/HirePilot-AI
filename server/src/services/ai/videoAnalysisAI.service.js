import { callAIJson } from "./baseAI.service.js";
import { buildVideoAnalysisPrompt } from "../../ai/prompts/videoAnalysis.prompt.js";

export const analyzeVideoAI = async ({ interviewId, metadata }) => {
  const fallback = {
    eyeContact: 76,
    speakingSpeed: 82,
    confidence: 74,
    facialExpression: 70,
    fillerWords: 64,
    communicationSkills: 80,
    professionalismScore: 84,
    report: {
      strengths: ["Professional tone", "Good pacing"],
      improvements: ["Reduce filler words", "Maintain camera framing"],
      metadata,
    },
  };

  const result = await callAIJson({
    prompt: buildVideoAnalysisPrompt(metadata?.transcript || "", { interviewId, ...metadata }),
    fallback,
    schemaName: "videoAnalysis",
  });
  const data = result.data || fallback;
  result.data = {
    eyeContact: data.eyeContact ?? data.eyeContactScore ?? fallback.eyeContact,
    speakingSpeed: data.speakingSpeed ?? data.speakingSpeedScore ?? fallback.speakingSpeed,
    confidence: data.confidence ?? data.confidenceScore ?? fallback.confidence,
    facialExpression: data.facialExpression ?? data.facialExpressionScore ?? fallback.facialExpression,
    fillerWords: Array.isArray(data.fillerWords) ? data.fillerWords.length : data.fillerWords ?? fallback.fillerWords,
    communicationSkills: data.communicationSkills ?? data.communicationScore ?? fallback.communicationSkills,
    professionalismScore: data.professionalismScore ?? fallback.professionalismScore,
    report: data.report || {
      speakingSpeedFeedback: data.speakingSpeedFeedback,
      eyeContactFeedback: data.eyeContactFeedback,
      facialExpressionFeedback: data.facialExpressionFeedback,
      strengths: data.strengths || [],
      improvements: data.improvements || [],
      practicePlan: data.practicePlan || [],
      fillerWords: data.fillerWords || [],
    },
  };
  return result;
};
