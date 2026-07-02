import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import { analyzeJobMatches, deleteJobMatch, getJobMatch, listJobMatches } from "./jobMatching.controller.js";

const jobMatchingRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

jobMatchingRouter.post("/job-matches/analyze", aiRoute, analyzeJobMatches);
jobMatchingRouter.get("/job-matches", protectedRoute, listJobMatches);
jobMatchingRouter.get("/job-matches/:id", protectedRoute, getJobMatch);
jobMatchingRouter.delete("/job-matches/:id", protectedRoute, deleteJobMatch);

export default jobMatchingRouter;
