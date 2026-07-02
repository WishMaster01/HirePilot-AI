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
import { calculateUserLevel, calculateXP, unlockBadges } from "../../shared/algorithms/gamification.algorithm.js";

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

export const gamificationStats = asyncHandler(async (req, res) => {
  const [badges, usage] = await Promise.all([prisma.userBadge.findMany({ where: userWhere(req), include: { badge: true } }), prisma.aICreditUsage.count({ where: userWhere(req) })]);
  const activityXP = usage * calculateXP({ type: "mentor" });
  const badgeXP = badges.reduce((sum, item) => sum + item.badge.xp, 0);
  const xp = badgeXP + activityXP;
  const algorithmAnalysis = { unlockedBadgeKeys: unlockBadges({ interviews: usage, resumeScore: 0, dsaSolved: 0, streak: 0 }) };
  return successResponse(res, "Gamification stats fetched", { xp, level: calculateUserLevel(xp), badges, algorithmAnalysis });
});

export const listBadges = asyncHandler(async (req, res) => successResponse(res, "Badges fetched", await prisma.badge.findMany()));

export const awardBadge = asyncHandler(async (req, res) => {
  const badge = await prisma.badge.upsert({ where: { key: req.body.key }, update: {}, create: { key: req.body.key, name: req.body.name || req.body.key, description: req.body.description, xp: req.body.xp || 50 } });
  return successResponse(res, "Badge awarded", await prisma.userBadge.upsert({ where: { userId_badgeId: { userId: req.prismaUserId, badgeId: badge.id } }, update: {}, create: { userId: req.prismaUserId, badgeId: badge.id } }));
});
