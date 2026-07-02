import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import { analyzeCareerProfile, createCareerProfile, getCareerProfile, updateCareerProfile } from "./careerProfile.controller.js";

const careerProfileRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

careerProfileRouter.post("/career-profile", protectedRoute, createCareerProfile);
careerProfileRouter.get("/career-profile/me", protectedRoute, getCareerProfile);
careerProfileRouter.patch("/career-profile", protectedRoute, updateCareerProfile);
careerProfileRouter.post("/career-profile/analyze", aiRoute, analyzeCareerProfile);

export default careerProfileRouter;
