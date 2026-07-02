import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import {
  createContextualVideoInterview,
  createProfileTrainingQuestions,
} from "./contextualInterview.controller.js";

const contextualInterviewRouter = express.Router();
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

contextualInterviewRouter.post("/contextual-interview/video-assistant", aiRoute, createContextualVideoInterview);
contextualInterviewRouter.post("/contextual-interview/training-questions", aiRoute, createProfileTrainingQuestions);

export default contextualInterviewRouter;
