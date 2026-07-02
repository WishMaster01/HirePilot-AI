import { callAIJson } from "./baseAI.service.js";
import { buildLinkedInAnalysisPrompt } from "../../ai/prompts/linkedin.prompt.js";

export const analyzeLinkedInAI = async ({ profileUrl, profileText }) => {
  const fallback = {
    headline: "Full Stack Developer | React, Node.js, AI SaaS Products",
    about: "I build production-ready career-tech and AI SaaS products with user-focused design.",
    skills: ["React", "Node.js", "PostgreSQL", "AI SaaS"],
    keywords: ["Full Stack", "Career Tech", "AI", "Dashboard"],
    recruiterVisibilityScore: 78,
    suggestions: ["Add featured projects", "Use target role keywords", "Quantify project impact"],
  };

  const result = await callAIJson({
    prompt: buildLinkedInAnalysisPrompt(profileText || profileUrl, "target role"),
    fallback,
    schemaName: "linkedInAnalysis",
  });
  const data = result.data || fallback;
  result.data = {
    headline: data.headline || fallback.headline,
    about: data.about || data.aboutSection || fallback.about,
    skills: data.skills || fallback.skills,
    keywords: data.keywords || fallback.keywords,
    recruiterVisibilityScore: data.recruiterVisibilityScore ?? fallback.recruiterVisibilityScore,
    suggestions: data.suggestions || data.improvements || fallback.suggestions,
  };
  return result;
};
