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
import { calculateCommunicationScore, calculatePauseScore, calculateWordsPerMinute, countFillerWords } from "../../shared/algorithms/videoMetrics.algorithm.js";

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

export const createVideoAnalysis = asyncHandler(async (req, res) => {
  const body = parse(z.object({ interviewId: z.string() }), req.body);
  const interview = await assertOwned("interview", body.interviewId, req.prismaUserId);
  const ai = await analyzeVideoAI({ interviewId: body.interviewId, metadata: req.body });
  const wpm = calculateWordsPerMinute(req.body.transcript || "", Number(req.body.durationSeconds) || 60);
  const fillerCount = countFillerWords(req.body.transcript || "");
  const pauseScore = calculatePauseScore(req.body.pauses || []);
  const algorithmAnalysis = {
    wpm,
    fillerCount,
    pauseScore,
    communicationScore: calculateCommunicationScore({ wpm, fillerCount, pauseScore, confidenceSignals: ai.data.confidence || 60 }),
  };
  await consumeCredits({ userId: req.prismaUserId, featureName: "VIDEO_ANALYSIS", credits: CREDIT_COSTS.VIDEO_ANALYSIS, tokensUsed: ai.tokensUsed });
  const analysis = await prisma.videoAnalysis.upsert({
    where: { interviewId: interview.id },
    update: { ...ai.data, communicationSkills: ai.data.communicationSkills || algorithmAnalysis.communicationScore, report: { aiAnalysis: ai.data, algorithmAnalysis }, fileUrl: req.file?.path },
    create: { ...ai.data, communicationSkills: ai.data.communicationSkills || algorithmAnalysis.communicationScore, report: { aiAnalysis: ai.data, algorithmAnalysis }, userId: req.prismaUserId, interviewId: interview.id, fileUrl: req.file?.path },
  });
  return successResponse(res, "Video analysis saved", { ...analysis, algorithmAnalysis }, 201);
});

export const getVideoAnalysis = asyncHandler(async (req, res) => successResponse(res, "Video analysis fetched", await prisma.videoAnalysis.findFirst({ where: { interviewId: req.params.interviewId, userId: req.prismaUserId } })));
