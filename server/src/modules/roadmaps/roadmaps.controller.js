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
import { buildSkillGraph, generateLearningPath, topologicalSortSkills } from "../../shared/algorithms/roadmapGraph.algorithm.js";

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

export const generateRoadmap = asyncHandler(async (req, res) => {
  const ai = await generateRoadmapAI(req.body);
  const skillGraph = buildSkillGraph(req.body.skillsWithPrerequisites || []);
  const orderedSkills = topologicalSortSkills(skillGraph);
  const algorithmAnalysis = generateLearningPath(req.body.role || ai.data.role, req.body.knownSkills || [], orderedSkills.length ? orderedSkills : req.body.requiredSkills || []);
  await consumeCredits({ userId: req.prismaUserId, featureName: "ROADMAP_GENERATE", credits: CREDIT_COSTS.ROADMAP_GENERATE, tokensUsed: ai.tokensUsed });
  const roadmap = await prisma.roadmap.create({
    data: {
      userId: req.prismaUserId,
      role: ai.data.role || req.body.role,
      summary: ai.data.summary,
      timeline: ai.data.timeline || algorithmAnalysis.learningPath.join(" -> "),
      steps: { create: (ai.data.steps || []).map((step) => ({ ...step })) },
    },
    include: { steps: true },
  });
  return successResponse(res, "Roadmap generated", { ...roadmap, algorithmAnalysis }, 201);
});

export const listRoadmaps = asyncHandler(async (req, res) => successResponse(res, "Roadmaps fetched", await prisma.roadmap.findMany({ where: userWhere(req), include: { steps: true }, orderBy: { createdAt: "desc" } })));

export const getRoadmap = asyncHandler(async (req, res) => successResponse(res, "Roadmap fetched", await assertOwned("roadmap", req.params.id, req.prismaUserId, { steps: true })));

export const updateRoadmapProgress = asyncHandler(async (req, res) => { await assertOwned("roadmap", req.params.id, req.prismaUserId); return successResponse(res, "Roadmap progress updated", await prisma.roadmap.update({ where: { id: req.params.id }, data: { progress: Number(req.body.progress || 0) }, include: { steps: true } })); });

export const deleteRoadmap = asyncHandler(async (req, res) => { await assertOwned("roadmap", req.params.id, req.prismaUserId); await prisma.roadmap.delete({ where: { id: req.params.id } }); return successResponse(res, "Roadmap deleted"); });
