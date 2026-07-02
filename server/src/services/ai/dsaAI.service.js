import { callAIJson } from "./baseAI.service.js";
import { buildDSAAssessmentPrompt, buildDSAFeedbackPrompt } from "../../ai/prompts/dsa.prompt.js";
import { buildCodeReviewPrompt } from "../../ai/prompts/codeReview.prompt.js";

export const assessDsaAI = async ({ topic, answers }) => {
  const fallback = {
    topic,
    score: answers ? 76 : 58,
    strengths: ["Understands basic patterns"],
    weaknesses: ["Practice edge cases", "Improve time complexity analysis"],
  };

  const result = await callAIJson({
    prompt: buildDSAAssessmentPrompt({ solvedTopics: topic || answers }),
    fallback,
    schemaName: "dsaAssessment",
  });
  const data = result.data || fallback;
  result.data = {
    ...data,
    topic: data.topic || topic || "DSA",
    score: data.score ?? data.dsaScore ?? fallback.score,
    strengths: data.strengths || data.strongTopics || fallback.strengths,
    weaknesses: data.weaknesses || data.weakTopics || fallback.weaknesses,
  };
  return result;
};

export const reviewCodeAI = async ({ code, language }) => {
  const fallback = {
    score: code && code.length > 40 ? 78 : 45,
    review: {
      correctness: "Review edge cases before submission.",
      complexity: "State time and space complexity clearly.",
      readability: "Use meaningful variable names and smaller helper functions.",
      language,
    },
  };

  const result = await callAIJson({
    prompt: code?.length > 200
      ? buildCodeReviewPrompt({ code, language, projectContext: "DSA solution review" })
      : buildDSAFeedbackPrompt({ code, language }),
    fallback,
    schemaName: "codeReview",
  });
  const data = result.data || fallback;
  result.data = {
    ...data,
    score: data.score ?? data.codeQualityScore ?? data.dsaScore ?? fallback.score,
    review: data.review || {
      correctness: data.solutionFeedback || data.summary,
      complexity: [data.timeComplexity, data.spaceComplexity].filter(Boolean).join(" / "),
      readability: data.bestPracticeSuggestions || data.optimizedApproach,
      bugs: data.bugs || [],
      securityIssues: data.securityIssues || [],
      performanceIssues: data.performanceIssues || [],
      language,
    },
  };
  return result;
};
