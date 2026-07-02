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
import { calculateApplicationStats, calculateSuccessProbability, detectWeakPlacementStage, generateWeeklyProgressMetrics } from "../../shared/algorithms/placementAnalytics.algorithm.js";

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

export const createPlacement = asyncHandler(async (req, res) => {
  const placement = await prisma.placementApplication.create({ data: { userId: req.prismaUserId, company: req.body.company, role: req.body.role, status: normalizePlacementStatus(req.body.status), notes: req.body.notes, successProbability: req.body.successProbability } });
  return successResponse(res, "Placement saved", placement, 201);
});

export const listPlacements = asyncHandler(async (req, res) => successResponse(res, "Placements fetched", await prisma.placementApplication.findMany({ where: userWhere(req), orderBy: { createdAt: "desc" } })));

export const getPlacement = asyncHandler(async (req, res) => successResponse(res, "Placement fetched", await assertOwned("placementApplication", req.params.id, req.prismaUserId)));

export const updatePlacement = asyncHandler(async (req, res) => { await assertOwned("placementApplication", req.params.id, req.prismaUserId); const data = { ...req.body }; if (data.status) data.status = normalizePlacementStatus(data.status); return successResponse(res, "Placement updated", await prisma.placementApplication.update({ where: { id: req.params.id }, data })); });

export const deletePlacement = asyncHandler(async (req, res) => { await assertOwned("placementApplication", req.params.id, req.prismaUserId); await prisma.placementApplication.delete({ where: { id: req.params.id } }); return successResponse(res, "Placement deleted"); });

export const placementReport = asyncHandler(async (req, res) => {
  const applications = await prisma.placementApplication.findMany({ where: userWhere(req) });
  const algorithmAnalysis = {
    stats: calculateApplicationStats(applications),
    successProbability: calculateSuccessProbability(applications),
    weakStage: detectWeakPlacementStage(applications),
    weeklyProgress: generateWeeklyProgressMetrics(applications),
  };
  const ai = await generatePlacementReportAI({ applications, algorithmAnalysis });
  await consumeCredits({ userId: req.prismaUserId, featureName: "PLACEMENT_REPORT", credits: CREDIT_COSTS.PLACEMENT_REPORT, tokensUsed: ai.tokensUsed });
  return successResponse(res, "Placement report generated", { aiAnalysis: ai.data, algorithmAnalysis });
});
