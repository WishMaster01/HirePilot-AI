import { z } from "zod";
import prisma from "../../config/prisma.js";
import asyncHandler from "../../shared/asyncHandler.js";
import { successResponse } from "../../shared/apiResponse.js";
import { CREDIT_COSTS, consumeCredits } from "../../services/credit.service.js";
import { analyzeCareerProfileAI } from "../../services/ai/careerProfileAI.service.js";
import { analyzeResumeAI, optimizeKeywordsAI, rewriteResumeAI } from "../../services/ai/resumeAI.service.js";
import { analyzeJobMatchAI } from "../../services/ai/jobMatchAI.service.js";
import { generateInterviewFeedbackAI, generateInterviewQuestionsAI } from "../../services/ai/interviewAI.service.js";
import { analyzeVideoAI } from "../../services/ai/videoAnalysisAI.service.js";
import { generateRoadmapAI } from "../../services/ai/roadmapAI.service.js";
import { assessDsaAI, reviewCodeAI } from "../../services/ai/dsaAI.service.js";
import { analyzeProjectAI } from "../../services/ai/projectAnalyzerAI.service.js";
import { analyzeLinkedInAI } from "../../services/ai/linkedInAI.service.js";
import { generatePlacementReportAI } from "../../services/ai/placementAI.service.js";
import { answerMentorAI } from "../../services/ai/mentorAI.service.js";
import { findMissingLinkedInKeywords } from "../../shared/algorithms/keywordMatching.algorithm.js";
import { calculateLinkedInScore } from "../../shared/algorithms/weightedScoring.algorithm.js";

const idSchema = z.object({ id: z.string().min(1) });
const parse = (schema, value) => schema.parse(value);
const userWhere = (req) => ({ userId: req.prismaUserId });
const normalizePlacementStatus = (status = "APPLIED") => String(status).toUpperCase().replaceAll(" ", "_");

const assertOwned = async (model, id, userId, include) => {
  const record = await prisma[model].findFirst({
    where: { id, userId },
    include,
  });
  if (!record) {
    const error = new Error("Resource not found");
    error.statusCode = 404;
    throw error;
  }
  return record;
};

export const analyzeLinkedIn = asyncHandler(async (req, res) => {
  const ai = await analyzeLinkedInAI(req.body);
  const profileText = [req.body.headline, req.body.about, req.body.profileText].filter(Boolean).join(" ");
  const keywords = req.body.keywords || req.body.targetRoleKeywords || ai.data.keywords || [];
  const algorithmAnalysis = {
    linkedInScore: calculateLinkedInScore(profileText, keywords),
    missingKeywords: findMissingLinkedInKeywords(profileText, keywords),
  };
  await consumeCredits({ userId: req.prismaUserId, featureName: "LINKEDIN_ANALYSIS", credits: CREDIT_COSTS.LINKEDIN_ANALYSIS, tokensUsed: ai.tokensUsed });
  const analysis = await prisma.linkedInAnalysis.create({ data: { userId: req.prismaUserId, profileUrl: req.body.profileUrl, ...ai.data, recruiterVisibilityScore: ai.data.recruiterVisibilityScore || algorithmAnalysis.linkedInScore, suggestions: { ...(ai.data.suggestions || {}), algorithmAnalysis } } });
  return successResponse(res, "LinkedIn analyzed", { ...analysis, algorithmAnalysis }, 201);
});

export const listLinkedInAnalyses = asyncHandler(async (req, res) => successResponse(res, "LinkedIn analyses fetched", await prisma.linkedInAnalysis.findMany({ where: userWhere(req), orderBy: { createdAt: "desc" } })));

export const getLinkedInAnalysis = asyncHandler(async (req, res) => successResponse(res, "LinkedIn analysis fetched", await assertOwned("linkedInAnalysis", req.params.id, req.prismaUserId)));
