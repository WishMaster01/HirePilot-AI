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
import { calculateDSAScore, classifyComplexity, detectWeakTopics } from "../../shared/algorithms/dsaProgress.algorithm.js";

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

export const listCodingProblems = asyncHandler(async (req, res) => successResponse(res, "Coding problems fetched", await prisma.codingProblem.findMany({ orderBy: { createdAt: "desc" } })));

export const getCodingProblem = asyncHandler(async (req, res) => successResponse(res, "Coding problem fetched", await prisma.codingProblem.findUnique({ where: { id: req.params.id } })));

export const createDsaAssessment = asyncHandler(async (req, res) => {
  const ai = await assessDsaAI(req.body);
  const algorithmAnalysis = {
    dsaScore: calculateDSAScore(req.body.submissions || [{ score: ai.data.score }]),
    weakTopics: detectWeakTopics(req.body.topicStats || { [req.body.topic || ai.data.topic || "general"]: ai.data.score }),
  };
  await consumeCredits({ userId: req.prismaUserId, featureName: "DSA_ASSESSMENT", credits: CREDIT_COSTS.DSA_ASSESSMENT, tokensUsed: ai.tokensUsed });
  const assessment = await prisma.dSAAssessment.create({ data: { userId: req.prismaUserId, topic: ai.data.topic || req.body.topic, score: ai.data.score || algorithmAnalysis.dsaScore, strengths: ai.data.strengths || [], weaknesses: ai.data.weaknesses || algorithmAnalysis.weakTopics, raw: { aiAnalysis: ai.data, algorithmAnalysis } } });
  return successResponse(res, "DSA assessment saved", assessment, 201);
});

export const createCodingSubmission = asyncHandler(async (req, res) => successResponse(res, "Coding submission saved", await prisma.codingSubmission.create({ data: { userId: req.prismaUserId, problemId: req.body.problemId, code: req.body.code, language: req.body.language || "javascript" } }), 201));

export const listCodingSubmissions = asyncHandler(async (req, res) => successResponse(res, "Coding submissions fetched", await prisma.codingSubmission.findMany({ where: userWhere(req), include: { problem: true }, orderBy: { createdAt: "desc" } })));

export const reviewCodingSubmission = asyncHandler(async (req, res) => {
  const submission = await assertOwned("codingSubmission", req.params.id, req.prismaUserId);
  const ai = await reviewCodeAI(submission);
  const algorithmAnalysis = { complexity: classifyComplexity(submission.code) };
  await consumeCredits({ userId: req.prismaUserId, featureName: "DSA_REVIEW", credits: CREDIT_COSTS.DSA_REVIEW, tokensUsed: ai.tokensUsed });
  return successResponse(res, "Coding submission reviewed", await prisma.codingSubmission.update({ where: { id: submission.id }, data: { score: ai.data.score, review: { ...(ai.data.review || ai.data), algorithmAnalysis } } }));
});
