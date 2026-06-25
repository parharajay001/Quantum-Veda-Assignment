import { Router } from "express";
import { validateBody } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { authController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

export const authRouter: Router = Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  authController.register,
);
authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post("/logout", requireAuth, authController.logout);
authRouter.get("/me", requireAuth, authController.me);
