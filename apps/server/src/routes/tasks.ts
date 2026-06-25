import { Router } from "express";
import { prisma } from "@repo/database";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.js";

export const tasksRouter: Router = Router();

// GET /api/tasks
tasksRouter.get("/", async (_req, res) => {
  const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  res.json(tasks);
});

// GET /api/tasks/:id
tasksRouter.get("/:id", async (req, res) => {
  const task = await prisma.task.findUniqueOrThrow({
    where: { id: req.params.id },
  });
  res.json(task);
});

// POST /api/tasks
tasksRouter.post("/", async (req, res) => {
  const data = createTaskSchema.parse(req.body);
  const task = await prisma.task.create({ data });
  res.status(201).json(task);
});

// PATCH /api/tasks/:id
tasksRouter.patch("/:id", async (req, res) => {
  const data = updateTaskSchema.parse(req.body);
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data,
  });
  res.json(task);
});

// DELETE /api/tasks/:id
tasksRouter.delete("/:id", async (req, res) => {
  await prisma.task.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
