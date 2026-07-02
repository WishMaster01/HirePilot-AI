import { callAIJson, clampScore, listFromText } from "./baseAI.service.js";
import { buildJobMatchingPrompt } from "../../ai/prompts/jobMatching.prompt.js";

export const analyzeJobMatchAI = async ({ resumeText, targetRoles = [] }) => {
  const skills = listFromText(resumeText);
  const roles = targetRoles.length ? targetRoles : ["Frontend Developer Intern", "Graduate SDE", "Full Stack Developer"];
  const fallback = {
    matches: roles.map((role, index) => ({
      role,
      company: null,
      jobType: index === 0 ? "Internship" : "Graduate Role",
      matchPercentage: clampScore(58 + skills.length * 2 - index * 6),
      extractedSkills: skills.slice(0, 12),
      missingSkills: ["Testing", "System design", "Cloud deployment"].slice(index, index + 2),
      suggestions: ["Build one role-specific project", "Add keywords from the job description"],
    })),
  };

  const result = await callAIJson({
    prompt: buildJobMatchingPrompt({ targetRoles }, resumeText, roles.map((role) => ({ title: role, company: "" }))),
    fallback,
    schemaName: "jobMatching",
  });
  const data = result.data || fallback;
  result.data = {
    ...data,
    matches: data.matches || (data.matchedJobs || []).map((job) => ({
      role: job.title,
      company: job.company,
      jobType: "Recommended Role",
      matchPercentage: job.matchPercentage,
      extractedSkills: job.matchedSkills || [],
      missingSkills: job.missingSkills || [],
      suggestions: { reason: job.reason, improvementPlan: data.improvementPlan || [] },
    })) || fallback.matches,
  };
  return result;
};
