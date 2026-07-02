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
import { rankRelevantUserContext, selectTopKContext } from "../../shared/algorithms/ranking.algorithm.js";

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

export const mentorChat = asyncHandler(async (req, res) => {
  const rankedContext = rankRelevantUserContext(req.body.message || "", req.body.contextItems || []);
  const selectedContext = selectTopKContext(rankedContext, 5);
  const ai = await answerMentorAI({ ...req.body, selectedContext });
  await consumeCredits({ userId: req.prismaUserId, featureName: "MENTOR_CHAT", credits: CREDIT_COSTS.MENTOR_CHAT, tokensUsed: ai.tokensUsed });
  const session = req.body.sessionId
    ? await assertOwned("mentorChatSession", req.body.sessionId, req.prismaUserId)
    : await prisma.mentorChatSession.create({ data: { userId: req.prismaUserId, title: req.body.message?.slice(0, 60) || "Career mentor chat" } });
  await prisma.mentorChatMessage.createMany({ data: [{ sessionId: session.id, role: "user", content: req.body.message }, { sessionId: session.id, role: "assistant", content: ai.data.answer, metadata: { ...ai.data, algorithmAnalysis: { selectedContext } } }] });
  return successResponse(res, "Mentor response generated", { sessionId: session.id, ...ai.data, algorithmAnalysis: { selectedContext } });
});

export const listMentorSessions = asyncHandler(async (req, res) => successResponse(res, "Mentor sessions fetched", await prisma.mentorChatSession.findMany({ where: userWhere(req), include: { messages: true }, orderBy: { updatedAt: "desc" } })));

export const getMentorSession = asyncHandler(async (req, res) => successResponse(res, "Mentor session fetched", await assertOwned("mentorChatSession", req.params.id, req.prismaUserId, { messages: true })));

export const deleteMentorSession = asyncHandler(async (req, res) => { await assertOwned("mentorChatSession", req.params.id, req.prismaUserId); await prisma.mentorChatSession.delete({ where: { id: req.params.id } }); return successResponse(res, "Mentor session deleted"); });
