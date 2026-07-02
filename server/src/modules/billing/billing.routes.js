import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import {
  createOrder,
  getCreditUsage,
  getMySubscription,
  verifyPayment,
} from "./billing.controller.js";

const billingRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];

billingRouter.post("/payment/order", isAuth, createOrder);
billingRouter.post("/payment/verify", isAuth, verifyPayment);
billingRouter.get("/subscriptions/me", protectedRoute, getMySubscription);
billingRouter.get("/credits/usage", protectedRoute, getCreditUsage);

export default billingRouter;
