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
import { calculateArchitectureScore, detectMissingProjectFiles, detectProjectLayers, traverseProjectTree } from "../../shared/algorithms/projectTree.algorithm.js";
import { detectHardcodedSecrets } from "../../shared/algorithms/securityRisk.algorithm.js";
import { calculateProjectResumeValue } from "../../shared/algorithms/weightedScoring.algorithm.js";

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

export const analyzeProject = asyncHandler(async (req, res) => {
  const ai = await analyzeProjectAI(req.body);
  const filePaths = req.body.filePaths || traverseProjectTree(req.body.fileTree || []);
  const architectureScore = calculateArchitectureScore({ filePaths });
  const securityFindings = detectHardcodedSecrets(req.body.fileContents || []);
  const algorithmAnalysis = {
    filePaths,
    layers: detectProjectLayers(filePaths),
    missingFiles: detectMissingProjectFiles(filePaths),
    architectureScore,
    securityFindings,
    resumeValueScore: calculateProjectResumeValue({ architectureScore, completenessScore: 100 - detectMissingProjectFiles(filePaths).length * 20, securityRiskScore: securityFindings.length * 25 }),
  };
  await consumeCredits({ userId: req.prismaUserId, featureName: "PROJECT_ANALYSIS", credits: CREDIT_COSTS.PROJECT_ANALYSIS, tokensUsed: ai.tokensUsed });
  const analysis = await prisma.projectAnalysis.create({ data: { userId: req.prismaUserId, githubUrl: req.body.githubUrl, ...ai.data, projectScore: ai.data.projectScore || algorithmAnalysis.architectureScore, resumeValueScore: ai.data.resumeValueScore || algorithmAnalysis.resumeValueScore, architectureReview: { aiAnalysis: ai.data.architectureReview, algorithmAnalysis } } });
  return successResponse(res, "Project analyzed", { ...analysis, algorithmAnalysis }, 201);
});

export const listProjectAnalyses = asyncHandler(async (req, res) => successResponse(res, "Project analyses fetched", await prisma.projectAnalysis.findMany({ where: userWhere(req), orderBy: { createdAt: "desc" } })));

export const getProjectAnalysis = asyncHandler(async (req, res) => successResponse(res, "Project analysis fetched", await assertOwned("projectAnalysis", req.params.id, req.prismaUserId)));

export const deleteProjectAnalysis = asyncHandler(async (req, res) => { await assertOwned("projectAnalysis", req.params.id, req.prismaUserId); await prisma.projectAnalysis.delete({ where: { id: req.params.id } }); return successResponse(res, "Project analysis deleted"); });
