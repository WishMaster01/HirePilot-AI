import prisma from "../config/prisma.js";

export const CREDIT_COSTS = {
  CAREER_PROFILE_ANALYZE: 3,
  RESUME_ANALYZE: 2,
  RESUME_ATS_CHECK: 2,
  RESUME_REWRITE: 3,
  RESUME_KEYWORD_OPTIMIZE: 2,
  JOB_MATCH_ANALYZE: 3,
  INTERVIEW_FEEDBACK: 5,
  CONTEXTUAL_VIDEO_INTERVIEW: 6,
  PROFILE_INTERVIEW_TRAINING: 4,
  VIDEO_ANALYSIS: 8,
  ROADMAP_GENERATE: 3,
  DSA_ASSESSMENT: 3,
  DSA_REVIEW: 2,
  PROJECT_ANALYSIS: 4,
  LINKEDIN_ANALYSIS: 3,
  PLACEMENT_REPORT: 2,
  MENTOR_CHAT: 1,
};

export const consumeCredits = async ({ userId, featureName, credits, tokensUsed, metadata }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.credits < credits) {
    await prisma.aICreditUsage.create({
      data: {
        userId,
        featureName,
        creditsConsumed: credits,
        tokensUsed,
        status: "BLOCKED",
        metadata,
      },
    });
    const error = new Error("Insufficient AI credits");
    error.statusCode = 402;
    throw error;
  }

  const [updatedUser, usage] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: credits } },
    }),
    prisma.aICreditUsage.create({
      data: {
        userId,
        featureName,
        creditsConsumed: credits,
        tokensUsed,
        status: "SUCCESS",
        metadata,
      },
    }),
  ]);

  return { updatedUser, usage };
};
