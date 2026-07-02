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
import { calculateModerationRisk } from "../../shared/algorithms/securityRisk.algorithm.js";
import { rankCommunityPosts } from "../../shared/algorithms/ranking.algorithm.js";

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

export const createCommunityPost = asyncHandler(async (req, res) => {
  const algorithmAnalysis = { moderationRisk: calculateModerationRisk(`${req.body.title || ""} ${req.body.content || ""}`) };
  const post = await prisma.communityPost.create({ data: { userId: req.prismaUserId, title: req.body.title, content: req.body.content, category: req.body.category } });
  return successResponse(res, "Post created", { ...post, algorithmAnalysis }, 201);
});

export const listCommunityPosts = asyncHandler(async (req, res) => {
  const posts = await prisma.communityPost.findMany({ include: { user: { select: { id: true, name: true } }, comments: true }, orderBy: { createdAt: "desc" } });
  return successResponse(res, "Posts fetched", rankCommunityPosts(posts.map((post) => ({ ...post, likes: 0, shares: 0 }))));
});

export const getCommunityPost = asyncHandler(async (req, res) => successResponse(res, "Post fetched", await prisma.communityPost.findUnique({ where: { id: req.params.id }, include: { comments: true, user: { select: { id: true, name: true } } } })));

export const updateCommunityPost = asyncHandler(async (req, res) => { await assertOwned("communityPost", req.params.id, req.prismaUserId); return successResponse(res, "Post updated", await prisma.communityPost.update({ where: { id: req.params.id }, data: req.body })); });

export const deleteCommunityPost = asyncHandler(async (req, res) => { await assertOwned("communityPost", req.params.id, req.prismaUserId); await prisma.communityPost.delete({ where: { id: req.params.id } }); return successResponse(res, "Post deleted"); });

export const createCommunityComment = asyncHandler(async (req, res) => successResponse(res, "Comment created", await prisma.communityComment.create({ data: { postId: req.params.id, userId: req.prismaUserId, content: req.body.content } }), 201));

export const deleteCommunityComment = asyncHandler(async (req, res) => { await assertOwned("communityComment", req.params.id, req.prismaUserId); await prisma.communityComment.delete({ where: { id: req.params.id } }); return successResponse(res, "Comment deleted"); });
