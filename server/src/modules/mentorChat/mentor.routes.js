import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import { deleteMentorSession, getMentorSession, listMentorSessions, mentorChat } from "./mentor.controller.js";

const mentorRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

mentorRouter.post("/mentor/chat", aiRoute, mentorChat);
mentorRouter.get("/mentor/sessions", protectedRoute, listMentorSessions);
mentorRouter.get("/mentor/sessions/:id", protectedRoute, getMentorSession);
mentorRouter.delete("/mentor/sessions/:id", protectedRoute, deleteMentorSession);

export default mentorRouter;
