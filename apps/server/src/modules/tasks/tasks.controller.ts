import type { Request, Response } from "express";
import { taskService } from "./tasks.service.js";
import type { CreateTaskInput, UpdateTaskInput } from "./tasks.validation.js";

// Thin HTTP layer: bodies are already validated by validateBody middleware.
export const taskController = {
  async list(_req: Request, res: Response) {
    res.json(await taskService.list());
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    res.json(await taskService.getById(req.params.id));
  },

  async create(req: Request, res: Response) {
    const task = await taskService.create(
      req.body as CreateTaskInput,
      req.user!.id,
    );
    res.status(201).json(task);
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const task = await taskService.update(
      req.params.id,
      req.body as UpdateTaskInput,
    );
    res.json(task);
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    await taskService.remove(req.params.id);
    res.status(204).send();
  },
};
