import { callAIJson } from "./baseAI.service.js";
import { buildProjectAnalyzerPrompt } from "../../ai/prompts/projectAnalyzer.prompt.js";

export const analyzeProjectAI = async ({ githubUrl }) => {
  const fallback = {
    projectScore: 82,
    architectureReview: { summary: "Clear project structure; add tests, API docs, and deployment notes." },
    resumeValueScore: 88,
    suggestions: ["Add README screenshots", "Document architecture", "Add CI pipeline"],
    interviewQuestions: [
      "How is your project structured?",
      "How do you handle errors and authentication?",
      "How would you scale this project?",
    ],
  };

  const result = await callAIJson({
    prompt: buildProjectAnalyzerPrompt({ githubUrl }),
    fallback,
    schemaName: "projectAnalyzer",
  });
  const data = result.data || fallback;
  result.data = {
    projectScore: data.projectScore ?? fallback.projectScore,
    architectureReview: data.architectureReview || {
      architectureScore: data.architectureScore,
      productionReadinessScore: data.productionReadinessScore,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      securityIssues: data.securityIssues || [],
    },
    resumeValueScore: data.resumeValueScore ?? fallback.resumeValueScore,
    suggestions: data.suggestions || {
      missingFeatures: data.missingFeatures || [],
      scalabilitySuggestions: data.scalabilitySuggestions || [],
      improvementRoadmap: data.improvementRoadmap || [],
      resumeDescription: data.resumeDescription,
    },
    interviewQuestions: data.interviewQuestions || fallback.interviewQuestions,
  };
  return result;
};
