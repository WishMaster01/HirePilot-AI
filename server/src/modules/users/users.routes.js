import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import { deleteAccount, getCurrentUser, getMe, updateUserProfile } from "./users.controller.js";

const userRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];

userRouter.get("/user/current-user", isAuth, getCurrentUser);
userRouter.get("/users/me", protectedRoute, getMe);
userRouter.patch("/users/profile", protectedRoute, updateUserProfile);
userRouter.delete("/users/account", protectedRoute, deleteAccount);

export default userRouter;
