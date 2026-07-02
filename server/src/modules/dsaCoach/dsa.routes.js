import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import {
  createCodingSubmission,
  createDsaAssessment,
  getCodingProblem,
  listCodingProblems,
  listCodingSubmissions,
  reviewCodingSubmission,
} from "./dsa.controller.js";

const dsaRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

dsaRouter.get("/dsa/problems", protectedRoute, listCodingProblems);
dsaRouter.get("/dsa/problems/:id", protectedRoute, getCodingProblem);
dsaRouter.post("/dsa/assessment", aiRoute, createDsaAssessment);
dsaRouter.post("/dsa/submissions", protectedRoute, createCodingSubmission);
dsaRouter.get("/dsa/submissions", protectedRoute, listCodingSubmissions);
dsaRouter.post("/dsa/submissions/:id/review", aiRoute, reviewCodingSubmission);

export default dsaRouter;
