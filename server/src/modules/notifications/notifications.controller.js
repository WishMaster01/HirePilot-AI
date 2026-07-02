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
import { rankNotifications } from "../../shared/algorithms/notificationPriority.algorithm.js";

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

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({ where: userWhere(req), orderBy: { createdAt: "desc" } });
  return successResponse(res, "Notifications fetched", rankNotifications(notifications));
});

export const markNotificationRead = asyncHandler(async (req, res) => { const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.prismaUserId } }); if (!notification) throw Object.assign(new Error("Notification not found"), { statusCode: 404 }); return successResponse(res, "Notification marked read", await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } })); });

export const deleteNotification = asyncHandler(async (req, res) => { const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.prismaUserId } }); if (!notification) throw Object.assign(new Error("Notification not found"), { statusCode: 404 }); await prisma.notification.delete({ where: { id: req.params.id } }); return successResponse(res, "Notification deleted"); });
