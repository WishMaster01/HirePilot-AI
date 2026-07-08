import prisma from "../../config/prisma.js";
import { successResponse } from "../../shared/apiResponse.js";
import { calculateATSScore } from "../../shared/algorithms/keywordMatching.algorithm.js";
import {
  rankCommunityPosts,
  rankJobsForUser,
} from "../../shared/algorithms/ranking.algorithm.js";
import {
  calculateStreak,
  calculateUserLevel,
  calculateXP,
  rankLeaderboard,
} from "../../shared/algorithms/gamification.algorithm.js";
import {
  calculateDeadlineUrgency,
  rankNotifications,
} from "../../shared/algorithms/notificationPriority.algorithm.js";
import { calculatePlanUsagePercentage } from "../billing/billing.service.js";
import { PLAN_CONFIG } from "./platformCompatibility.constants.js";
import {
  buildCareerScores,
  createResumeRecord,
  getProfilePayload,
  hashPassword,
  recommendedRoles,
  resolveResume,
  setAuthCookie,
  toList,
  verifyPassword,
} from "./platformCompatibility.utils.js";

export const registerWithPassword = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }
  const user = await prisma.user.create({
    data: {
      name: name || String(email).split("@")[0],
      email: String(email).toLowerCase(),
      passwordHash: hashPassword(password),
      credits: 100,
      lastLoginAt: new Date(),
    },
  });
  await setAuthCookie(res, user.id);
  return successResponse(res, "Registered successfully", user, 201);
};

export const loginWithPassword = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email: String(email || "").toLowerCase() },
  });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password." });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await setAuthCookie(res, user.id);
  return successResponse(res, "Logged in successfully", user);
};

export const logoutWithPost = async (req, res) => {
  res.clearCookie("token");
  return successResponse(res, "Logged out successfully");
};

export const getCareerProfile = async (req, res) => {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId: req.prismaUserId },
  });
  return successResponse(res, "Career profile fetched", profile);
};

export const saveCareerProfile = async (req, res) => {
  const profile = await prisma.careerProfile.upsert({
    where: { userId: req.prismaUserId },
    update: getProfilePayload(req.body),
    create: { userId: req.prismaUserId, ...getProfilePayload(req.body) },
  });
  return successResponse(res, "Career profile saved", profile, 201);
};

export const updateCareerProfile = async (req, res) => {
  const profile = await prisma.careerProfile.upsert({
    where: { userId: req.prismaUserId },
    update: getProfilePayload(req.body),
    create: { userId: req.prismaUserId, ...getProfilePayload(req.body) },
  });
  return successResponse(res, "Career profile updated", profile);
};

export const analyzeCareer = async (req, res) => {
  const profile = await prisma.careerProfile.upsert({
    where: { userId: req.prismaUserId },
    update: getProfilePayload(req.body),
    create: { userId: req.prismaUserId, ...getProfilePayload(req.body) },
  });
  const scores = buildCareerScores({ ...profile, skills: profile.techStack });
  const score = await prisma.careerScore.create({
    data: {
      userId: req.prismaUserId,
      ...scores,
      details: { source: "compatibility-analyzer" },
    },
  });
  const recommendations = await Promise.all(
    recommendedRoles({ ...profile, skills: profile.techStack }).map((item) =>
      prisma.careerRecommendation.create({
        data: { userId: req.prismaUserId, ...item },
      }),
    ),
  );
  return successResponse(res, "Career analysis generated", {
    score,
    recommendations,
  });
};

export const getCareerScores = async (req, res) => {
  const scores = await prisma.careerScore.findMany({
    where: { userId: req.prismaUserId },
    orderBy: { createdAt: "desc" },
  });
  return successResponse(res, "Career scores fetched", scores);
};

export const uploadResume = async (req, res) => {
  const resume = await createResumeRecord(req);
  return successResponse(res, "Resume uploaded", resume, 201);
};

export const buildResume = async (req, res) => {
  const resume = await createResumeRecord(req, {
    title: req.body.title || "AI built resume",
    content: req.body.content || req.body.summary || "",
  });
  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: resume.id,
      title: `${resume.title} v1`,
      content: resume.content || "",
      reason: "AI resume builder",
    },
  });
  return successResponse(res, "Resume built", { resume, version }, 201);
};

export const analyzeResume = async (req, res) => {
  const resume = await resolveResume(req);
  const ats = calculateATSScore(
    resume.content || "",
    req.body.jobDescription || "",
  );
  const analysis = await prisma.resumeAnalysis.create({
    data: {
      resumeId: resume.id,
      type: "ANALYSIS",
      score: ats.atsScore,
      missingSkills: ats.missingKeywords.slice(0, 10),
      missingKeywords: ats.missingKeywords,
      suggestions: {
        matchedKeywords: ats.matchedKeywords,
        keywordScore: ats.keywordScore,
        similarityScore: ats.similarityScore,
      },
    },
  });
  return successResponse(res, "Resume analyzed", { resume, analysis });
};

export const atsCheckResume = async (req, res) => {
  const resume = await resolveResume(req);
  const ats = calculateATSScore(
    resume.content || req.body.content || "",
    req.body.jobDescription || "",
  );
  const result = await prisma.aTSResult.create({
    data: {
      resumeId: resume.id,
      score: ats.atsScore,
      matchedKeywords: ats.matchedKeywords,
      missingKeywords: ats.missingKeywords,
      details: ats,
    },
  });
  return successResponse(res, "ATS check completed", result);
};

export const rewriteResume = async (req, res) => {
  const resume = await resolveResume(req);
  const rewritten = `${resume.content || ""}\n\nImproved focus: quantified impact, role-aligned keywords, concise project outcomes.`;
  const version = await prisma.resumeVersion.create({
    data: {
      resumeId: resume.id,
      title: `${resume.title} rewrite`,
      content: rewritten,
      reason: "AI rewrite",
    },
  });
  const analysis = await prisma.resumeAnalysis.create({
    data: {
      resumeId: resume.id,
      type: "REWRITE",
      rewrittenContent: rewritten,
      suggestions: { tone: "impact-focused" },
    },
  });
  return successResponse(res, "Resume rewritten", { version, analysis });
};

export const optimizeResumeKeywords = async (req, res) => {
  const resume = await resolveResume(req);
  const ats = calculateATSScore(
    resume.content || "",
    req.body.jobDescription || "",
  );
  const analysis = await prisma.resumeAnalysis.create({
    data: {
      resumeId: resume.id,
      type: "KEYWORD_OPTIMIZE",
      score: ats.keywordScore,
      missingKeywords: ats.missingKeywords,
      suggestions: { add: ats.missingKeywords.slice(0, 12) },
    },
  });
  return successResponse(res, "Keywords optimized", analysis);
};

export const analyzeResumeGaps = async (req, res) => {
  const resume = await resolveResume(req);
  const required = toList(req.body.requiredSkills || req.body.jobDescription);
  const current = toList(resume.content);
  const missing = required.filter(
    (skill) => !current.join(" ").toLowerCase().includes(skill.toLowerCase()),
  );
  const analysis = await prisma.resumeAnalysis.create({
    data: {
      resumeId: resume.id,
      type: "GAP_ANALYSIS",
      missingSkills: missing,
      suggestions: { priority: missing.slice(0, 5) },
    },
  });
  return successResponse(res, "Resume gaps analyzed", analysis);
};

export const getResumeHistory = async (req, res) => {
  const history = await prisma.resume.findMany({
    where: { userId: req.prismaUserId },
    include: { analyses: true, atsResults: true, versions: true },
    orderBy: { createdAt: "desc" },
  });
  return successResponse(res, "Resume history fetched", history);
};

export const matchJobs = async (req, res) => {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId: req.prismaUserId },
  });
  const jobs = req.body.jobs || (await prisma.jobListing.findMany({ take: 25 }));
  const ranked = rankJobsForUser(
    {
      skills: profile?.techStack || toList(req.body.skills),
      projects: profile?.projects || [],
    },
    jobs,
  );
  const saved = await Promise.all(
    ranked.slice(0, 5).map((job) =>
      prisma.jobMatch.create({
        data: {
          userId: req.prismaUserId,
          role: job.role || job.title || "Recommended role",
          company: job.company,
          jobType: job.jobType,
          matchPercentage: job.matchScore,
          extractedSkills: job.skills || [],
          missingSkills: [],
          sourcePayload: job,
        },
      }),
    ),
  );
  return successResponse(res, "Jobs matched", saved);
};

export const getRecommendedJobs = async (req, res) => {
  const matches = await prisma.jobMatch.findMany({
    where: { userId: req.prismaUserId },
    orderBy: { matchPercentage: "desc" },
  });
  return successResponse(res, "Recommended jobs fetched", matches);
};

export const getJob = async (req, res) => {
  const job =
    (await prisma.jobMatch.findFirst({
      where: { id: req.params.id, userId: req.prismaUserId },
    })) ||
    (await prisma.jobListing.findUnique({ where: { id: req.params.id } }));
  if (!job) {
    return res.status(404).json({ success: false, message: "Job not found" });
  }
  return successResponse(res, "Job fetched", job);
};

export const getPlacementStats = async (req, res) => {
  const applications = await prisma.placementApplication.findMany({
    where: { userId: req.prismaUserId },
  });
  const byStatus = applications.reduce(
    (acc, item) => ({ ...acc, [item.status]: (acc[item.status] || 0) + 1 }),
    {},
  );
  const averageProbability = Math.round(
    applications.reduce((sum, item) => sum + (item.successProbability || 0), 0) /
      (applications.length || 1),
  );
  return successResponse(res, "Placement stats fetched", {
    total: applications.length,
    byStatus,
    averageProbability,
  });
};

export const prepareCompany = async (req, res) => {
  const plan = {
    company: req.body.company,
    role: req.body.role,
    topics: [
      "Company research",
      "Role skills",
      "Recent projects",
      "Interview patterns",
    ],
  };
  const preparation = await prisma.companyPreparation.create({
    data: {
      userId: req.prismaUserId,
      company: req.body.company || "Target company",
      role: req.body.role,
      plan,
    },
  });
  return successResponse(res, "Company preparation generated", preparation, 201);
};

export const createInterview = async (req, res) => {
  const interview = await prisma.interview.create({
    data: {
      userId: req.prismaUserId,
      role: req.body.role || "Software Developer",
      mode: req.body.mode || "Technical Interview",
      company: req.body.company,
      difficulty: req.body.difficulty,
      status: "DRAFT",
    },
  });
  return successResponse(res, "Interview created", interview, 201);
};

export const createCompanySpecificInterview = async (req, res) => {
  const questions = [
    "Tell me about a project relevant to this company.",
    "How would you solve a role-specific production issue?",
    "Why this company and team?",
  ];
  return successResponse(res, "Company-specific interview generated", {
    company: req.body.company,
    role: req.body.role,
    questions,
  });
};

export const analyzeVideo = async (req, res) => {
  const interviewId = req.body.interviewId;
  const analysis = await prisma.videoAnalysis.upsert({
    where: { interviewId },
    update: {
      fileUrl: req.file?.path,
      speakingSpeed: 135,
      confidence: 76,
      fillerWords: 8,
      report: { source: "compatibility-video-analysis" },
    },
    create: {
      userId: req.prismaUserId,
      interviewId,
      fileUrl: req.file?.path,
      speakingSpeed: 135,
      confidence: 76,
      fillerWords: 8,
      report: { source: "compatibility-video-analysis" },
    },
  });
  return successResponse(res, "Video analyzed", analysis);
};

export const getVideo = async (req, res) => {
  const analysis = await prisma.videoAnalysis.findFirst({
    where: { interviewId: req.params.interviewId, userId: req.prismaUserId },
  });
  return successResponse(res, "Video analysis fetched", analysis);
};

export const getDsaProgress = async (req, res) => {
  const progress = await prisma.dSAProgress.findMany({
    where: { userId: req.prismaUserId },
    orderBy: { updatedAt: "desc" },
  });
  return successResponse(res, "DSA progress fetched", progress);
};

export const analyzeCodeReview = async (req, res) => {
  const review = await prisma.codeReview.create({
    data: {
      userId: req.prismaUserId,
      code: req.body.code || "",
      language: req.body.language,
      complexity: "O(n)",
      score: 78,
      feedback: {
        strengths: ["Readable structure"],
        improvements: ["Add edge cases", "Explain complexity"],
      },
    },
  });
  return successResponse(res, "Code reviewed", review);
};

export const createPortfolioSuggestions = async (req, res) => {
  const suggestions = await Promise.all(
    [
      "Add deployment proof",
      "Document architecture",
      "Showcase measurable impact",
    ].map((title, index) =>
      prisma.portfolioSuggestion.create({
        data: {
          userId: req.prismaUserId,
          title,
          description: `Portfolio improvement for ${req.body.role || "target roles"}.`,
          priority: 90 - index * 10,
        },
      }),
    ),
  );
  return successResponse(res, "Portfolio suggestions generated", suggestions);
};

export const analyzeResumeProject = async (req, res) => {
  const analysis = {
    projectScore: 82,
    resumeValueScore: 86,
    interviewQuestions: [
      "What was the architecture?",
      "How did you test it?",
      "What would you scale next?",
    ],
  };
  return successResponse(res, "Resume project analysis generated", analysis);
};

export const getLinkedInHistory = async (req, res) => {
  const history = await prisma.linkedInAnalysis.findMany({
    where: { userId: req.prismaUserId },
    orderBy: { createdAt: "desc" },
  });
  return successResponse(res, "LinkedIn history fetched", history);
};

export const getDailyRecommendations = async (req, res) => {
  const existing = await prisma.dailyRecommendation.findMany({
    where: { userId: req.prismaUserId },
    orderBy: { priority: "desc" },
    take: 5,
  });
  if (existing.length) {
    return successResponse(res, "Daily recommendations fetched", existing);
  }
  const defaults = await Promise.all(
    [
      "Run one ATS check",
      "Solve two DSA problems",
      "Practice one mock interview",
    ].map((title, index) =>
      prisma.dailyRecommendation.create({
        data: {
          userId: req.prismaUserId,
          title,
          detail: "Recommended by HirePilot AI",
          priority: 90 - index * 10,
        },
      }),
    ),
  );
  return successResponse(res, "Daily recommendations fetched", defaults);
};

export const reactToCommunityPost = async (req, res) => {
  const reaction = await prisma.communityReaction.upsert({
    where: {
      postId_userId_type: {
        postId: req.params.id,
        userId: req.prismaUserId,
        type: req.body.type || "like",
      },
    },
    update: {},
    create: {
      postId: req.params.id,
      userId: req.prismaUserId,
      type: req.body.type || "like",
    },
  });
  return successResponse(res, "Reaction saved", reaction);
};

export const getCommunityLeaderboard = async (req, res) => {
  const posts = await prisma.communityPost.findMany({
    include: { comments: true, reactions: true, user: true },
  });
  return successResponse(
    res,
    "Community leaderboard fetched",
    rankCommunityPosts(posts).slice(0, 20),
  );
};

export const createPeerInterview = async (req, res) => {
  const peerInterview = await prisma.peerInterview.create({
    data: {
      userId: req.prismaUserId,
      peerEmail: req.body.peerEmail,
      role: req.body.role,
      scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
      metadata: req.body.metadata,
    },
  });
  return successResponse(res, "Peer interview requested", peerInterview, 201);
};

export const awardXp = async (req, res) => {
  const xp = Number(req.body.xp) || calculateXP(req.body);
  const record = await prisma.userXP.upsert({
    where: { userId: req.prismaUserId },
    update: { xp: { increment: xp } },
    create: { userId: req.prismaUserId, xp, level: calculateUserLevel(xp) },
  });
  const updated = await prisma.userXP.update({
    where: { userId: req.prismaUserId },
    data: { level: calculateUserLevel(record.xp) },
  });
  return successResponse(res, "XP awarded", updated);
};

export const unlockBadge = async (req, res) => {
  const badge = await prisma.badge.upsert({
    where: { key: req.body.key || "career-builder" },
    update: {},
    create: {
      key: req.body.key || "career-builder",
      name: req.body.name || "Career Builder",
      description: req.body.description,
      xp: req.body.xp || 25,
    },
  });
  const userBadge = await prisma.userBadge.upsert({
    where: {
      userId_badgeId: { userId: req.prismaUserId, badgeId: badge.id },
    },
    update: {},
    create: { userId: req.prismaUserId, badgeId: badge.id },
  });
  return successResponse(res, "Badge unlocked", { badge, userBadge });
};

export const getGamificationLeaderboard = async (req, res) => {
  const users = await prisma.userXP.findMany({ include: { user: true } });
  return successResponse(
    res,
    "Gamification leaderboard fetched",
    rankLeaderboard(users).slice(0, 50),
  );
};

export const getStreaks = async (req, res) => {
  const usage = await prisma.aICreditUsage.findMany({
    where: { userId: req.prismaUserId },
    select: { createdAt: true },
  });
  const streak = await prisma.userStreak.upsert({
    where: { userId_type: { userId: req.prismaUserId, type: "practice" } },
    update: {
      count: calculateStreak(usage.map((item) => item.createdAt)),
      lastAt: new Date(),
    },
    create: {
      userId: req.prismaUserId,
      type: "practice",
      count: calculateStreak(usage.map((item) => item.createdAt)),
      lastAt: new Date(),
    },
  });
  return successResponse(res, "Streaks fetched", streak);
};

export const getBillingPlans = async (req, res) =>
  successResponse(res, "Plans fetched", PLAN_CONFIG);

export const getBillingCredits = async (req, res) => {
  const subscription = await prisma.subscription.findFirst({
    where: { userId: req.prismaUserId },
    orderBy: { createdAt: "desc" },
  });
  const usage = await prisma.aICreditUsage.aggregate({
    where: { userId: req.prismaUserId },
    _sum: { creditsConsumed: true },
  });
  const used = usage._sum.creditsConsumed || 0;
  return successResponse(res, "Credits fetched", {
    credits: req.prismaUser.credits,
    used,
    usagePercentage: calculatePlanUsagePercentage(
      used,
      subscription?.monthlyCreditLimit || req.prismaUser.credits,
    ),
  });
};

export const createDailyGoal = async (req, res) => {
  const goal = await prisma.dailyGoal.create({
    data: {
      userId: req.prismaUserId,
      title: req.body.title || "Daily preparation goal",
      target: req.body.target || 1,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
    },
  });
  return successResponse(res, "Daily goal created", goal, 201);
};

export const getDailyGoals = async (req, res) =>
  successResponse(
    res,
    "Daily goals fetched",
    await prisma.dailyGoal.findMany({
      where: { userId: req.prismaUserId },
      orderBy: { createdAt: "desc" },
    }),
  );

export const createEmailReport = async (req, res) => {
  const report = await prisma.emailReport.create({
    data: {
      userId: req.prismaUserId,
      subject: req.body.subject || "HirePilot AI report",
      body: req.body.body || "Your career preparation report is ready.",
      sentAt: new Date(),
    },
  });
  return successResponse(res, "Email report queued", report, 201);
};

export const getReminders = async (req, res) => {
  const reminders = await prisma.reminder.findMany({
    where: { userId: req.prismaUserId },
    orderBy: { dueAt: "asc" },
  });
  return successResponse(
    res,
    "Reminders fetched",
    reminders.map((item) => ({
      ...item,
      urgencyScore: calculateDeadlineUrgency(item.dueAt),
    })),
  );
};

export const getRankedNotifications = async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.prismaUserId },
  });
  return successResponse(
    res,
    "Notifications fetched",
    rankNotifications(notifications),
  );
};

export const getAdminAiUsage = async (req, res) =>
  successResponse(
    res,
    "AI usage fetched",
    await prisma.aICreditUsage.groupBy({
      by: ["featureName"],
      _sum: { creditsConsumed: true },
      _count: true,
    }),
  );

export const getAdminRevenue = async (req, res) =>
  successResponse(
    res,
    "Revenue fetched",
    await prisma.payment.aggregate({ _sum: { amount: true }, _count: true }),
  );

export const getSystemHealth = async (req, res) => {
  const data = {
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
  await prisma.systemHealthLog.create({
    data: { status: data.status, metrics: data },
  });
  return successResponse(res, "System health fetched", data);
};

export const getContentModeration = async (req, res) =>
  successResponse(
    res,
    "Moderation queue fetched",
    await prisma.moderationQueue.findMany({
      orderBy: [{ riskScore: "desc" }, { createdAt: "desc" }],
    }),
  );

export const updateUserSecurity = async (req, res) => {
  const security = await prisma.accountSecurity.upsert({
    where: { userId: req.prismaUserId },
    update: {
      twoFactorEnabled: Boolean(req.body.twoFactorEnabled),
      riskScore: req.body.riskScore ?? 0,
    },
    create: {
      userId: req.prismaUserId,
      twoFactorEnabled: Boolean(req.body.twoFactorEnabled),
      riskScore: req.body.riskScore ?? 0,
    },
  });
  return successResponse(res, "Security settings updated", security);
};
