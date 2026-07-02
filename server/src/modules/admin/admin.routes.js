import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser, requireRole } from "../../middlewares/prismaAuth.middleware.js";
import {
  adminAnalytics,
  adminDeleteUser,
  adminInterviews,
  adminReports,
  adminUpdateUserRole,
  adminUsers,
} from "./admin.controller.js";

const adminRouter = express.Router();
const adminRoute = [isAuth, attachPrismaUser, requireRole("ADMIN")];

adminRouter.get("/admin/users", adminRoute, adminUsers);
adminRouter.get("/admin/analytics", adminRoute, adminAnalytics);
adminRouter.get("/admin/interviews", adminRoute, adminInterviews);
adminRouter.get("/admin/reports", adminRoute, adminReports);
adminRouter.patch("/admin/users/:id/role", adminRoute, adminUpdateUserRole);
adminRouter.delete("/admin/users/:id", adminRoute, adminDeleteUser);

export default adminRouter;
