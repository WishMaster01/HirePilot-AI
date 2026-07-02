import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { deleteNotification, listNotifications, markNotificationRead } from "./notifications.controller.js";

const notificationsRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];

notificationsRouter.get("/notifications", protectedRoute, listNotifications);
notificationsRouter.patch("/notifications/:id/read", protectedRoute, markNotificationRead);
notificationsRouter.delete("/notifications/:id", protectedRoute, deleteNotification);

export default notificationsRouter;
