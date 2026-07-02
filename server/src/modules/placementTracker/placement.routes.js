import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { aiLimiter } from "../../middlewares/security.middleware.js";
import { createPlacement, deletePlacement, getPlacement, listPlacements, placementReport, updatePlacement } from "./placement.controller.js";

const placementRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];
const aiRoute = [isAuth, attachPrismaUser, aiLimiter];

placementRouter.post("/placements", protectedRoute, createPlacement);
placementRouter.get("/placements", protectedRoute, listPlacements);
placementRouter.get("/placements/:id", protectedRoute, getPlacement);
placementRouter.patch("/placements/:id", protectedRoute, updatePlacement);
placementRouter.delete("/placements/:id", protectedRoute, deletePlacement);
placementRouter.post("/placements/report", aiRoute, placementReport);

export default placementRouter;
