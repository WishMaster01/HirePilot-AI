import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { awardBadge, gamificationStats, listBadges } from "./gamification.controller.js";

const gamificationRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];

gamificationRouter.get("/gamification/stats", protectedRoute, gamificationStats);
gamificationRouter.get("/gamification/badges", protectedRoute, listBadges);
gamificationRouter.post("/gamification/award-badge", protectedRoute, awardBadge);

export default gamificationRouter;
