import type { Request, Response } from "express";
import { userService } from "./users.service.js";

// Thin HTTP layer for users.
export const userController = {
  async list(_req: Request, res: Response) {
    res.json(await userService.list());
  },
};
