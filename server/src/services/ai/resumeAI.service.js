import { callAIJson, clampScore, listFromText } from "./baseAI.service.js";
import {
  buildKeywordOptimizationPrompt,
  buildResumeAnalysisPrompt,
  buildResumeRewritePrompt,
} from "../../ai/prompts/resume.prompt.js";

const missingFrom = (content, target) => {
  const resumeSet = new Set(String(content || "").toLowerCase().split(/\W+/).filter(Boolean));
  return listFromText(String(target || "").toLowerCase().replace(/\s+/g, ",")).filter((word) => !resumeSet.has(word)).slice(0, 10);
};

export const analyzeResumeAI = async ({ content, targetKeywords }) => {
  const missingKeywords = missingFrom(content, targetKeywords);
  const fallback = {
    score: clampScore(92 - missingKeywords.length * 5),
    missingSkills: missingKeywords.slice(0, 5),
    missingKeywords,
    missingProjects: ["Add one measurable project with business impact"],
    certifications: ["Role-specific certification if relevant"],
    suggestions: ["Use action verbs", "Add metrics", "Match job description keywords"],
  };

  const result = await callAIJson({
    prompt: buildResumeAnalysisPrompt(content, targetKeywords),
    fallback,
    schemaName: "resumeAnalysis",
  });
  const data = result.data || fallback;
  result.data = {
    ...data,
    score: data.score ?? data.resumeScore ?? data.atsScore ?? fallback.score,
    certifications: data.certifications || data.missingCertifications || fallback.certifications,
    suggestions: data.suggestions || data.actionPlan || data.weaknesses || fallback.suggestions,
    rewrittenContent: data.rewrittenContent || data.improvedSummary,
  };
  return result;
};

export const rewriteResumeAI = async ({ content }) => {
  const fallback = {
    rewrittenContent: `Impact-focused rewrite:\n${content || "Add resume content"}\n\nUse measurable outcomes, role keywords, and concise bullet points.`,
    score: 82,
    suggestions: ["Start bullets with action verbs", "Quantify impact", "Move strongest projects higher"],
  };

  const result = await callAIJson({
    prompt: buildResumeRewritePrompt(content, "target role"),
    fallback,
    schemaName: "resumeRewrite",
  });
  const data = result.data || fallback;
  result.data = {
    ...data,
    score: data.score ?? data.resumeScore ?? data.atsScore ?? fallback.score,
    rewrittenContent: data.rewrittenContent || data.improvedSummary || fallback.rewrittenContent,
    suggestions: data.suggestions || data.bulletImprovements || data.actionPlan || fallback.suggestions,
  };
  return result;
};

export const optimizeKeywordsAI = async ({ content, targetKeywords }) => {
  const missingKeywords = missingFrom(content, targetKeywords);
  const fallback = {
    score: clampScore(88 - missingKeywords.length * 4),
    missingKeywords,
    suggestions: missingKeywords.map((keyword) => `Add '${keyword}' naturally in skills, project, or experience sections.`),
  };

  const result = await callAIJson({
    prompt: buildKeywordOptimizationPrompt(content, targetKeywords),
    fallback,
    schemaName: "keywordOptimization",
  });
  const data = result.data || fallback;
  result.data = {
    ...data,
    score: data.score ?? data.resumeScore ?? data.atsScore ?? fallback.score,
    suggestions: data.suggestions || data.actionPlan || fallback.suggestions,
  };
  return result;
};
