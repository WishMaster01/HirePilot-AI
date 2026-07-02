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
import { calculateCareerScore, calculateEmployabilityScore } from "../../shared/algorithms/weightedScoring.algorithm.js";

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

export const createCareerProfile = asyncHandler(async (req, res) => {
  const body = parse(
    z.object({
      education: z.string().optional(),
      techStack: z.array(z.string()).default([]),
      projects: z.array(z.string()).default([]),
      experience: z.string().optional(),
      interests: z.array(z.string()).default([]),
    }),
    req.body
  );
  const profile = await prisma.careerProfile.upsert({
    where: { userId: req.prismaUserId },
    update: body,
    create: { ...body, userId: req.prismaUserId },
  });
  return successResponse(res, "Career profile saved", profile, 201);
});

export const getCareerProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.careerProfile.findUnique({ where: { userId: req.prismaUserId } });
  return successResponse(res, "Career profile fetched", profile);
});

export const updateCareerProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.careerProfile.update({
    where: { userId: req.prismaUserId },
    data: req.body,
  });
  return successResponse(res, "Career profile updated", profile);
});

export const analyzeCareerProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.careerProfile.findUnique({ where: { userId: req.prismaUserId } });
  const sourceProfile = profile || req.body;
  const algorithmAnalysis = {
    careerScore: calculateCareerScore(sourceProfile),
    employabilityScore: calculateEmployabilityScore(sourceProfile),
  };
  const ai = await analyzeCareerProfileAI(sourceProfile);
  await consumeCredits({
    userId: req.prismaUserId,
    featureName: "CAREER_PROFILE_ANALYZE",
    credits: CREDIT_COSTS.CAREER_PROFILE_ANALYZE,
    tokensUsed: ai.tokensUsed,
  });
  const updated = await prisma.careerProfile.upsert({
    where: { userId: req.prismaUserId },
    update: {
      careerScore: ai.data.careerScore ?? algorithmAnalysis.careerScore,
      strengthScore: ai.data.strengthScore,
      weaknessAnalysis: ai.data.weaknessAnalysis,
      employabilityScore: ai.data.employabilityScore ?? algorithmAnalysis.employabilityScore,
      readinessScore: ai.data.readinessScore,
      analysis: { aiAnalysis: ai.data, algorithmAnalysis },
    },
    create: {
      userId: req.prismaUserId,
      techStack: [],
      projects: [],
      interests: [],
      careerScore: ai.data.careerScore ?? algorithmAnalysis.careerScore,
      strengthScore: ai.data.strengthScore,
      weaknessAnalysis: ai.data.weaknessAnalysis,
      employabilityScore: ai.data.employabilityScore ?? algorithmAnalysis.employabilityScore,
      readinessScore: ai.data.readinessScore,
      analysis: { aiAnalysis: ai.data, algorithmAnalysis },
    },
  });
  return successResponse(res, "Career profile analyzed", { ...updated, algorithmAnalysis });
});
