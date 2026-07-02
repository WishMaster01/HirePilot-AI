import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import { analyzeLinkedIn, getLinkedInAnalysis, listLinkedInAnalyses } from "./linkedin.controller.js";

const linkedinRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

linkedinRouter.post("/linkedin/analyze", aiRoute, analyzeLinkedIn);
linkedinRouter.get("/linkedin/analyses", protectedRoute, listLinkedInAnalyses);
linkedinRouter.get("/linkedin/analyses/:id", protectedRoute, getLinkedInAnalysis);

export default linkedinRouter;
