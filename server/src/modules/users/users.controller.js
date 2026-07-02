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

export const getCurrentUser = async (req,res) => {
    try {
        const userId = req.userId
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
        })
        if(!user) {
            return res.status(404).json({message:"user does not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
         return res.status(500).json({message:`failed to get currentUser ${error}`})
    }
}

export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.prismaUserId },
    include: { subscriptions: true, badges: { include: { badge: true } } },
  });
  return successResponse(res, "User fetched", user);
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const body = parse(z.object({ name: z.string().min(1).optional(), imageUrl: z.string().url().optional() }), req.body);
  const user = await prisma.user.update({ where: { id: req.prismaUserId }, data: body });
  return successResponse(res, "Profile updated", user);
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.prismaUserId }, data: { isActive: false } });
  return successResponse(res, "Account deactivated");
});
