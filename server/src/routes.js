import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/users/users.routes.js";
import interviewRouter from "./modules/interviews/interviews.routes.js";
import contextualInterviewRouter from "./modules/contextualInterview/contextualInterview.routes.js";
import billingRouter from "./modules/billing/billing.routes.js";
import careerProfileRouter from "./modules/careerProfile/careerProfile.routes.js";
import resumeRouter from "./modules/resumeAI/resume.routes.js";
import jobMatchingRouter from "./modules/jobMatching/jobMatching.routes.js";
import videoAnalysisRouter from "./modules/videoAnalysis/videoAnalysis.routes.js";
import roadmapsRouter from "./modules/roadmaps/roadmaps.routes.js";
import dsaRouter from "./modules/dsaCoach/dsa.routes.js";
import projectRouter from "./modules/projectAnalyzer/project.routes.js";
import linkedinRouter from "./modules/linkedinOptimizer/linkedin.routes.js";
import placementRouter from "./modules/placementTracker/placement.routes.js";
import mentorRouter from "./modules/mentorChat/mentor.routes.js";
import communityRouter from "./modules/community/community.routes.js";
import gamificationRouter from "./modules/gamification/gamification.routes.js";
import notificationsRouter from "./modules/notifications/notifications.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";
import { authLimiter } from "./middlewares/rateLimit.middleware.js";

export {
  authRouter,
  userRouter,
  interviewRouter,
  contextualInterviewRouter,
  billingRouter,
  careerProfileRouter,
  resumeRouter,
  jobMatchingRouter,
  videoAnalysisRouter,
  roadmapsRouter,
  dsaRouter,
  projectRouter,
  linkedinRouter,
  placementRouter,
  mentorRouter,
  communityRouter,
  gamificationRouter,
  notificationsRouter,
  adminRouter,
};

export const registerRoutes = (app) => {
  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api", userRouter);
  app.use("/api", interviewRouter);
  app.use("/api", contextualInterviewRouter);
  app.use("/api", billingRouter);
  app.use("/api", careerProfileRouter);
  app.use("/api", resumeRouter);
  app.use("/api", jobMatchingRouter);
  app.use("/api", videoAnalysisRouter);
  app.use("/api", roadmapsRouter);
  app.use("/api", dsaRouter);
  app.use("/api", projectRouter);
  app.use("/api", linkedinRouter);
  app.use("/api", placementRouter);
  app.use("/api", mentorRouter);
  app.use("/api", communityRouter);
  app.use("/api", gamificationRouter);
  app.use("/api", notificationsRouter);
  app.use("/api", adminRouter);
};
