import express from "express";
import { googleAuth, logOut } from "./auth.controller.js";

const authRouter = express.Router();

authRouter.post("/google", googleAuth);
authRouter.get("/logout", logOut);

export default authRouter;
