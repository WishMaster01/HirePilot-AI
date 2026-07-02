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
import { aggregateAIUsageByFeature, aggregateUsersByPlan, calculateDashboardKPIs, calculateRevenueMetrics, detectAbnormalAIUsage } from "../../shared/algorithms/adminAnalytics.algorithm.js";

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

export const adminUsers = asyncHandler(async (req, res) => successResponse(res, "Users fetched", await prisma.user.findMany({ orderBy: { createdAt: "desc" } })));

export const adminAnalytics = asyncHandler(async (req, res) => {
  const [userCount, interviews, resumes, aiRequests, revenue, subscriptions, users, payments, aiUsage] = await Promise.all([
    prisma.user.count(),
    prisma.interview.count(),
    prisma.resumeAnalysis.count(),
    prisma.aICreditUsage.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.subscription.groupBy({ by: ["plan"], _count: true }),
    prisma.user.findMany({ include: { subscriptions: true, creditUsage: true, interviews: true } }),
    prisma.payment.findMany(),
    prisma.aICreditUsage.findMany(),
  ]);
  const algorithmAnalysis = {
    usersByPlan: aggregateUsersByPlan(users),
    aiUsageByFeature: aggregateAIUsageByFeature(aiUsage),
    revenueMetrics: calculateRevenueMetrics(payments),
    abnormalAIUsage: detectAbnormalAIUsage(aiUsage),
    kpis: calculateDashboardKPIs({ users, payments, aiUsage, subscriptions }),
  };
  return successResponse(res, "Analytics fetched", { users: userCount, interviews, resumesAnalyzed: resumes, aiRequests, revenue: revenue._sum.amount || 0, subscriptions, algorithmAnalysis });
});

export const adminInterviews = asyncHandler(async (req, res) => successResponse(res, "Admin interviews fetched", await prisma.interview.findMany({ include: { user: true, feedback: true }, orderBy: { createdAt: "desc" } })));

export const adminReports = asyncHandler(async (req, res) => successResponse(res, "Admin reports fetched", await prisma.aICreditUsage.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } })));

export const adminUpdateUserRole = asyncHandler(async (req, res) => successResponse(res, "User role updated", await prisma.user.update({ where: { id: req.params.id }, data: { role: req.body.role } })));

export const adminDeleteUser = asyncHandler(async (req, res) => { await prisma.user.delete({ where: { id: req.params.id } }); return successResponse(res, "User deleted"); });
