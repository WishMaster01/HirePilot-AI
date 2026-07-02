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
import { calculateATSScore, extractKeywordFrequency } from "../../shared/algorithms/keywordMatching.algorithm.js";

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

const createResumeAnalysis = async (req, type, featureName, aiFactory) => {
  const { id } = parse(idSchema, req.params);
  const resume = await assertOwned("resume", id, req.prismaUserId);
  const ai = await aiFactory({ content: resume.content, targetKeywords: req.body.targetKeywords || req.body.jobDescription });
  const algorithmAnalysis = calculateATSScore(resume.content || "", req.body.jobDescription || (req.body.targetKeywords || []).join(" "));
  algorithmAnalysis.resumeKeywordFrequency = extractKeywordFrequency(resume.content || "");
  await consumeCredits({
    userId: req.prismaUserId,
    featureName,
    credits: CREDIT_COSTS[featureName],
    tokensUsed: ai.tokensUsed,
    metadata: { resumeId: id },
  });
  return prisma.resumeAnalysis.create({
    data: {
      resumeId: id,
      type,
      score: ai.data.score,
      missingSkills: ai.data.missingSkills || [],
      missingKeywords: ai.data.missingKeywords || [],
      missingProjects: ai.data.missingProjects || [],
      certifications: ai.data.certifications || [],
      rewrittenContent: ai.data.rewrittenContent,
      suggestions: { ...(ai.data.suggestions || ai.data), algorithmAnalysis },
    },
  });
};

export const createResume = asyncHandler(async (req, res) => {
  const body = parse(
    z.object({
      title: z.string().min(1),
      content: z.string().optional(),
    }),
    req.body
  );
  const resume = await prisma.resume.create({
    data: {
      ...body,
      userId: req.prismaUserId,
      fileName: req.file?.originalname,
      fileType: req.file?.mimetype,
      fileSize: req.file?.size,
      fileUrl: req.file?.path,
    },
  });
  return successResponse(res, "Resume created", resume, 201);
});

export const listResumes = asyncHandler(async (req, res) => {
  const resumes = await prisma.resume.findMany({ where: userWhere(req), orderBy: { createdAt: "desc" } });
  return successResponse(res, "Resumes fetched", resumes);
});

export const getResume = asyncHandler(async (req, res) => {
  const { id } = parse(idSchema, req.params);
  const resume = await assertOwned("resume", id, req.prismaUserId, { analyses: true });
  return successResponse(res, "Resume fetched", resume);
});

export const updateResume = asyncHandler(async (req, res) => {
  const { id } = parse(idSchema, req.params);
  await assertOwned("resume", id, req.prismaUserId);
  const resume = await prisma.resume.update({ where: { id }, data: req.body });
  return successResponse(res, "Resume updated", resume);
});

export const deleteResume = asyncHandler(async (req, res) => {
  const { id } = parse(idSchema, req.params);
  await assertOwned("resume", id, req.prismaUserId);
  await prisma.resume.delete({ where: { id } });
  return successResponse(res, "Resume deleted");
});

export const analyzeResume = asyncHandler(async (req, res) => {
  const analysis = await createResumeAnalysis(req, "ANALYZE", "RESUME_ANALYZE", analyzeResumeAI);
  return successResponse(res, "Resume analyzed", analysis);
});

export const atsCheckResume = asyncHandler(async (req, res) => {
  const analysis = await createResumeAnalysis(req, "ATS_CHECK", "RESUME_ATS_CHECK", analyzeResumeAI);
  return successResponse(res, "ATS check complete", analysis);
});

export const rewriteResume = asyncHandler(async (req, res) => {
  const analysis = await createResumeAnalysis(req, "REWRITE", "RESUME_REWRITE", rewriteResumeAI);
  return successResponse(res, "Resume rewritten", analysis);
});

export const keywordOptimizeResume = asyncHandler(async (req, res) => {
  const analysis = await createResumeAnalysis(req, "KEYWORD_OPTIMIZE", "RESUME_KEYWORD_OPTIMIZE", optimizeKeywordsAI);
  return successResponse(res, "Resume keywords optimized", analysis);
});
