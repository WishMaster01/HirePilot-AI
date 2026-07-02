import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import {
  analyzeResume,
  createInterview,
  createInterviewAnswer,
  createInterviewFeedback,
  createInterviewQuestions,
  deleteInterview,
  finishInterview,
  generateQuestion,
  getInterview,
  getInterviewReport,
  getMyInterviews,
  listInterviews,
  submitAnswer,
  updateInterview,
} from "./interviews.controller.js";

const interviewRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

interviewRouter.post("/interview/resume", isAuth, upload.single("resume"), analyzeResume);
interviewRouter.post("/interview/generate-questions", isAuth, generateQuestion);
interviewRouter.post("/interview/submit-answer", isAuth, submitAnswer);
interviewRouter.post("/interview/finish", isAuth, finishInterview);
interviewRouter.get("/interview/get-interview", isAuth, getMyInterviews);
interviewRouter.get("/interview/report/:id", isAuth, getInterviewReport);

interviewRouter.post("/interviews", protectedRoute, createInterview);
interviewRouter.get("/interviews", protectedRoute, listInterviews);
interviewRouter.get("/interviews/:id", protectedRoute, getInterview);
interviewRouter.patch("/interviews/:id", protectedRoute, updateInterview);
interviewRouter.delete("/interviews/:id", protectedRoute, deleteInterview);
interviewRouter.post("/interviews/:id/questions", aiRoute, createInterviewQuestions);
interviewRouter.post("/interviews/:id/answers", protectedRoute, createInterviewAnswer);
interviewRouter.post("/interviews/:id/feedback", aiRoute, createInterviewFeedback);

export default interviewRouter;
