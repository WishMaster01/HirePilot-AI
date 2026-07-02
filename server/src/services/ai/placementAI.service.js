import { callAIJson } from "./baseAI.service.js";
import { buildPlacementReportPrompt } from "../../ai/prompts/placementTracker.prompt.js";

export const generatePlacementReportAI = async ({ applications }) => {
  const total = applications?.length || 0;
  const fallback = {
    successProbability: Math.min(92, 45 + total * 8),
    weeklyProgress: {
      applied: total,
      recommendation: "Apply consistently, improve resume keywords, and practice targeted mock interviews.",
    },
    risks: ["Low follow-up rate", "Missing company-specific preparation"],
  };

  const result = await callAIJson({
    prompt: buildPlacementReportPrompt(applications),
    fallback,
    schemaName: "placementReport",
  });
  const data = result.data || fallback;
  result.data = {
    ...data,
    weeklyProgress: data.weeklyProgress || {
      report: data.weeklyProgressReport,
      stats: data.applicationStats || {},
      nextWeekPlan: data.nextWeekPlan || [],
    },
    risks: data.risks || data.weakStages || [],
  };
  return result;
};
