import { Router } from "express";
import { validateBody } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { taskController } from "./tasks.controller.js";
import { createTaskSchema, updateTaskSchema } from "./tasks.validation.js";

export const taskRouter: Router = Router();

// All task endpoints require an authenticated user.
taskRouter.use(requireAuth);

taskRouter.get("/", taskController.list);
taskRouter.get("/:id", taskController.getById);
taskRouter.post("/", validateBody(createTaskSchema), taskController.create);
taskRouter.patch("/:id", validateBody(updateTaskSchema), taskController.update);
taskRouter.delete("/:id", taskController.remove);
