import express from "express";
import isAuth from "../../middlewares/auth.middleware.js";
import { attachPrismaUser } from "../../middlewares/prismaAuth.middleware.js";
import {
  createCommunityComment,
  createCommunityPost,
  deleteCommunityComment,
  deleteCommunityPost,
  getCommunityPost,
  listCommunityPosts,
  updateCommunityPost,
} from "./community.controller.js";

const communityRouter = express.Router();
const protectedRoute = [isAuth, attachPrismaUser];

communityRouter.post("/community/posts", protectedRoute, createCommunityPost);
communityRouter.get("/community/posts", protectedRoute, listCommunityPosts);
communityRouter.get("/community/posts/:id", protectedRoute, getCommunityPost);
communityRouter.patch("/community/posts/:id", protectedRoute, updateCommunityPost);
communityRouter.delete("/community/posts/:id", protectedRoute, deleteCommunityPost);
communityRouter.post("/community/posts/:id/comments", protectedRoute, createCommunityComment);
communityRouter.delete("/community/comments/:id", protectedRoute, deleteCommunityComment);

export default communityRouter;
