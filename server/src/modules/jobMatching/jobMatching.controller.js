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
import { rankJobsForUser } from "../../shared/algorithms/ranking.algorithm.js";

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

export const analyzeJobMatches = asyncHandler(async (req, res) => {
  const ai = await analyzeJobMatchAI(req.body);
  const algorithmMatches = rankJobsForUser(req.body.userProfile || req.body.profile || {}, req.body.jobs || ai.data.matches || []);
  await consumeCredits({ userId: req.prismaUserId, featureName: "JOB_MATCH_ANALYZE", credits: CREDIT_COSTS.JOB_MATCH_ANALYZE, tokensUsed: ai.tokensUsed });
  const matches = await prisma.$transaction(
    (algorithmMatches.length ? algorithmMatches : ai.data.matches || []).map((match) =>
      prisma.jobMatch.create({
        data: {
          userId: req.prismaUserId,
          resumeId: req.body.resumeId,
          role: match.role || match.title || "Recommended Role",
          company: match.company,
          jobType: match.jobType,
          matchPercentage: match.matchPercentage || match.matchScore || 0,
          extractedSkills: match.extractedSkills || [],
          missingSkills: match.missingSkills || [],
          suggestions: match.suggestions || {},
          sourcePayload: { ...req.body, algorithmAnalysis: { rankedMatches: algorithmMatches } },
        },
      })
    )
  );
  return successResponse(res, "Job matches analyzed", { matches, algorithmAnalysis: { rankedMatches: algorithmMatches } });
});

export const listJobMatches = asyncHandler(async (req, res) => successResponse(res, "Job matches fetched", await prisma.jobMatch.findMany({ where: userWhere(req), orderBy: { createdAt: "desc" } })));

export const getJobMatch = asyncHandler(async (req, res) => successResponse(res, "Job match fetched", await assertOwned("jobMatch", req.params.id, req.prismaUserId)));

export const deleteJobMatch = asyncHandler(async (req, res) => { await assertOwned("jobMatch", req.params.id, req.prismaUserId); await prisma.jobMatch.delete({ where: { id: req.params.id } }); return successResponse(res, "Job match deleted"); });
