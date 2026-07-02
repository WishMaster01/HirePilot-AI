import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import { analyzeProject, deleteProjectAnalysis, getProjectAnalysis, listProjectAnalyses } from "./project.controller.js";

const projectRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

projectRouter.post("/projects/analyze", aiRoute, analyzeProject);
projectRouter.get("/projects/analyses", protectedRoute, listProjectAnalyses);
projectRouter.get("/projects/analyses/:id", protectedRoute, getProjectAnalysis);
projectRouter.delete("/projects/analyses/:id", protectedRoute, deleteProjectAnalysis);

export default projectRouter;
