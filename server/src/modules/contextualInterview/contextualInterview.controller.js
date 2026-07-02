import { z } from "zod";
import prisma from "../../config/prisma.js";
import asyncHandler from "../../shared/asyncHandler.js";
import { successResponse } from "../../shared/apiResponse.js";
import { CREDIT_COSTS, consumeCredits } from "../../services/credit.service.js";
import {
  generateContextualVideoInterviewAI,
  generateProfileTrainingQuestionsAI,
} from "../../services/ai/contextualInterviewAI.service.js";

const contextSchema = z.object({
  targetRole: z.string().min(1),
  experienceLevel: z.string().optional(),
  interviewType: z.string().optional(),
  difficulty: z.string().optional(),
  company: z.string().optional(),
  resumeText: z.string().optional(),
  linkedInProfile: z.string().optional(),
  githubUrl: z.string().optional(),
  githubProjects: z.string().optional(),
  techStack: z.string().optional(),
  focusAreas: z.string().optional(),
  weakAreas: z.string().optional(),
  targetCompanies: z.string().optional(),
});

export const createContextualVideoInterview = asyncHandler(async (req, res) => {
  const body = contextSchema.parse(req.body);
  const ai = await generateContextualVideoInterviewAI(body);

  await consumeCredits({
    userId: req.prismaUserId,
    featureName: "CONTEXTUAL_VIDEO_INTERVIEW",
    credits: CREDIT_COSTS.CONTEXTUAL_VIDEO_INTERVIEW,
    tokensUsed: ai.tokensUsed,
    metadata: { targetRole: body.targetRole, githubUrl: body.githubUrl },
  });

  const interview = await prisma.interview.create({
    data: {
      userId: req.prismaUserId,
      role: body.targetRole,
      experience: body.experienceLevel,
      mode: "CONTEXTUAL_VIDEO",
      company: body.company,
      difficulty: body.difficulty,
      status: "IN_PROGRESS",
      questions: {
        create: (ai.data.questions || []).map((question, index) => ({
          question: question.question,
          difficulty: question.difficulty,
          timeLimit: question.timeLimit,
          order: index,
        })),
      },
    },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  return successResponse(res, "Contextual video interview generated", {
    interview,
    assistantPersona: ai.data.assistantPersona,
    contextSummary: ai.data.contextSummary,
    openingPrompt: ai.data.openingPrompt,
    videoInterviewTips: ai.data.videoInterviewTips || [],
    riskAreas: ai.data.riskAreas || [],
    sourceQuestions: ai.data.questions || [],
  }, 201);
});

export const createProfileTrainingQuestions = asyncHandler(async (req, res) => {
  const body = contextSchema.parse(req.body);
  const ai = await generateProfileTrainingQuestionsAI(body);

  await consumeCredits({
    userId: req.prismaUserId,
    featureName: "PROFILE_INTERVIEW_TRAINING",
    credits: CREDIT_COSTS.PROFILE_INTERVIEW_TRAINING,
    tokensUsed: ai.tokensUsed,
    metadata: { targetRole: body.targetRole, githubUrl: body.githubUrl },
  });

  return successResponse(res, "Profile-based interview training generated", ai.data, 201);
});
