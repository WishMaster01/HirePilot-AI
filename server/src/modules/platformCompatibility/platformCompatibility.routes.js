import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import {
  attachPrismaUser,
  requireRole,
} from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import {
  mediaUpload,
  resumeUpload,
} from "../../middlewares/upload.middleware.js";
import asyncHandler from "../../shared/asyncHandler.js";
import {
  createOrder,
  getCreditUsage,
  getMySubscription,
  verifyPayment,
} from "../billing/billing.controller.js";
import {
  analyzeCareer,
  analyzeCodeReview,
  analyzeResume,
  analyzeResumeGaps,
  analyzeResumeProject,
  analyzeVideo,
  atsCheckResume,
  awardXp,
  buildResume,
  createCompanySpecificInterview,
  createDailyGoal,
  createEmailReport,
  createInterview,
  createPeerInterview,
  createPortfolioSuggestions,
  getAdminAiUsage,
  getAdminRevenue,
  getBillingCredits,
  getBillingPlans,
  getCareerProfile,
  getCareerScores,
  getCommunityLeaderboard,
  getContentModeration,
  getDailyGoals,
  getDailyRecommendations,
  getDsaProgress,
  getGamificationLeaderboard,
  getJob,
  getLinkedInHistory,
  getPlacementStats,
  getRankedNotifications,
  getRecommendedJobs,
  getReminders,
  getResumeHistory,
  getStreaks,
  getSystemHealth,
  getVideo,
  loginWithPassword,
  logoutWithPost,
  matchJobs,
  optimizeResumeKeywords,
  prepareCompany,
  reactToCommunityPost,
  registerWithPassword,
  rewriteResume,
  saveCareerProfile,
  unlockBadge,
  updateCareerProfile,
  updateUserSecurity,
  uploadResume,
} from "./platformCompatibility.controller.js";

const router = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];
const adminRoute = [isAuth, attachPrismaUser, requireRole("ADMIN")];
const run = (controller) => asyncHandler(controller);

router.post("/auth/register", run(registerWithPassword));
router.post("/auth/login", run(loginWithPassword));
router.post("/auth/logout", run(logoutWithPost));

router.get("/career/profile", protectedRoute, run(getCareerProfile));
router.post("/career/profile", protectedRoute, run(saveCareerProfile));
router.patch("/career/profile", protectedRoute, run(updateCareerProfile));
router.post("/career/analyze", aiRoute, run(analyzeCareer));
router.get("/career/scores", protectedRoute, run(getCareerScores));

router.post(
  "/resume/upload",
  protectedRoute,
  resumeUpload.single("resume"),
  run(uploadResume),
);
router.post("/resume/build", protectedRoute, run(buildResume));
router.post("/resume/analyze", aiRoute, run(analyzeResume));
router.post("/resume/ats-check", aiRoute, run(atsCheckResume));
router.post("/resume/rewrite", aiRoute, run(rewriteResume));
router.post("/resume/keyword-optimize", aiRoute, run(optimizeResumeKeywords));
router.post("/resume/gap-analysis", aiRoute, run(analyzeResumeGaps));
router.get("/resume/history", protectedRoute, run(getResumeHistory));

router.post("/jobs/match", aiRoute, run(matchJobs));
router.get("/jobs/recommended", protectedRoute, run(getRecommendedJobs));
router.get("/jobs/:id", protectedRoute, run(getJob));

router.get("/placements/stats", protectedRoute, run(getPlacementStats));
router.post("/company/prepare", aiRoute, run(prepareCompany));

router.post("/interviews/create", protectedRoute, run(createInterview));
router.post(
  "/interviews/company-specific",
  aiRoute,
  run(createCompanySpecificInterview),
);

router.post(
  "/video/analyze",
  aiRoute,
  mediaUpload.single("media"),
  run(analyzeVideo),
);
router.get("/video/:interviewId", protectedRoute, run(getVideo));

router.get("/dsa/progress", protectedRoute, run(getDsaProgress));
router.post("/code-review/analyze", aiRoute, run(analyzeCodeReview));

router.post("/portfolio/suggestions", aiRoute, run(createPortfolioSuggestions));
router.post(
  "/portfolio/resume-project-analysis",
  aiRoute,
  run(analyzeResumeProject),
);
router.get("/linkedin/history", protectedRoute, run(getLinkedInHistory));

router.get(
  "/mentor/daily-recommendations",
  protectedRoute,
  run(getDailyRecommendations),
);

router.post(
  "/community/posts/:id/react",
  protectedRoute,
  run(reactToCommunityPost),
);
router.get(
  "/community/leaderboard",
  protectedRoute,
  run(getCommunityLeaderboard),
);
router.post(
  "/community/peer-interview",
  protectedRoute,
  run(createPeerInterview),
);

router.post("/gamification/award-xp", protectedRoute, run(awardXp));
router.post("/gamification/unlock-badge", protectedRoute, run(unlockBadge));
router.get(
  "/gamification/leaderboard",
  protectedRoute,
  run(getGamificationLeaderboard),
);
router.get("/gamification/streaks", protectedRoute, run(getStreaks));

router.get("/billing/plans", protectedRoute, run(getBillingPlans));
router.get("/billing/subscription", protectedRoute, getMySubscription);
router.post("/billing/create-order", protectedRoute, createOrder);
router.post("/billing/verify-payment", protectedRoute, verifyPayment);
router.get("/billing/usage", protectedRoute, getCreditUsage);
router.get("/billing/credits", protectedRoute, run(getBillingCredits));

router.post("/productivity/daily-goal", protectedRoute, run(createDailyGoal));
router.get("/productivity/daily-goals", protectedRoute, run(getDailyGoals));
router.post(
  "/productivity/email-report",
  protectedRoute,
  run(createEmailReport),
);
router.get("/productivity/reminders", protectedRoute, run(getReminders));

router.get("/notifications", protectedRoute, run(getRankedNotifications));

router.get("/admin/ai-usage", adminRoute, run(getAdminAiUsage));
router.get("/admin/revenue", adminRoute, run(getAdminRevenue));
router.get("/admin/system-health", adminRoute, run(getSystemHealth));
router.get("/admin/content-moderation", adminRoute, run(getContentModeration));

router.patch("/users/security", protectedRoute, run(updateUserSecurity));

export default router;
