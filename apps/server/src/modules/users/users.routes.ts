import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { userController } from "./users.controller.js";

export const userRouter: Router = Router();

// Listing users is only available to authenticated callers.
userRouter.use(requireAuth);

userRouter.get("/", userController.list);
