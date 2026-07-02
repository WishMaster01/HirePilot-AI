import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import { resumeUpload } from "../../middlewares/upload.middleware.js";
import {
  analyzeResume,
  atsCheckResume,
  createResume,
  deleteResume,
  getResume,
  keywordOptimizeResume,
  listResumes,
  rewriteResume,
  updateResume,
} from "./resume.controller.js";

const resumeRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

resumeRouter.post("/resumes", protectedRoute, resumeUpload.single("resume"), createResume);
resumeRouter.get("/resumes", protectedRoute, listResumes);
resumeRouter.get("/resumes/:id", protectedRoute, getResume);
resumeRouter.patch("/resumes/:id", protectedRoute, updateResume);
resumeRouter.delete("/resumes/:id", protectedRoute, deleteResume);
resumeRouter.post("/resumes/:id/analyze", aiRoute, analyzeResume);
resumeRouter.post("/resumes/:id/ats-check", aiRoute, atsCheckResume);
resumeRouter.post("/resumes/:id/rewrite", aiRoute, rewriteResume);
resumeRouter.post("/resumes/:id/keyword-optimize", aiRoute, keywordOptimizeResume);

export default resumeRouter;
