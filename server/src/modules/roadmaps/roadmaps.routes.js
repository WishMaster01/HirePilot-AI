import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import { deleteRoadmap, generateRoadmap, getRoadmap, listRoadmaps, updateRoadmapProgress } from "./roadmaps.controller.js";

const roadmapsRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

roadmapsRouter.post("/roadmaps/generate", aiRoute, generateRoadmap);
roadmapsRouter.get("/roadmaps", protectedRoute, listRoadmaps);
roadmapsRouter.get("/roadmaps/:id", protectedRoute, getRoadmap);
roadmapsRouter.patch("/roadmaps/:id/progress", protectedRoute, updateRoadmapProgress);
roadmapsRouter.delete("/roadmaps/:id", protectedRoute, deleteRoadmap);

export default roadmapsRouter;
