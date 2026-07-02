import { callAIJson, clampScore, listFromText } from "./baseAI.service.js";
import { buildCareerProfileAnalysisPrompt } from "../../ai/prompts/careerProfile.prompt.js";

export const analyzeCareerProfileAI = async (profile) => {
  const skills = listFromText([...(profile.techStack || []), ...(profile.interests || [])].join(","));
  const projectCount = Array.isArray(profile.projects) ? profile.projects.length : 0;
  const fallback = {
    careerScore: clampScore(48 + skills.length * 5 + projectCount * 8),
    strengthScore: clampScore(52 + skills.length * 4),
    employabilityScore: clampScore(45 + projectCount * 10 + skills.length * 3),
    readinessScore: clampScore(42 + skills.length * 4 + projectCount * 6),
    weaknessAnalysis: {
      gaps: ["Add quantified impact", "Add stronger DSA proof", "Add deployment evidence"],
      priority: "Build one role-specific project and update resume keywords.",
    },
  };

  const result = await callAIJson({
    prompt: buildCareerProfileAnalysisPrompt(profile),
    fallback,
    schemaName: "careerProfileAnalysis",
  });
  const data = result.data || fallback;
  result.data = {
    ...data,
    weaknessAnalysis: data.weaknessAnalysis || {
      weakAreas: data.weakAreas || [],
      missingSkills: data.missingSkills || [],
      nextSteps: data.nextSteps || [],
    },
  };
  return result;
};
