import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import { mediaUpload } from "../../middlewares/upload.middleware.js";
import { createVideoAnalysis, getVideoAnalysis } from "./videoAnalysis.controller.js";

const videoAnalysisRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

videoAnalysisRouter.post("/video-analysis", aiRoute, mediaUpload.single("media"), createVideoAnalysis);
videoAnalysisRouter.get("/video-analysis/:interviewId", protectedRoute, getVideoAnalysis);

export default videoAnalysisRouter;
