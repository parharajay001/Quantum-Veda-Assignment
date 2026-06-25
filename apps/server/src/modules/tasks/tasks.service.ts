import { prisma } from "@repo/database";
import type { CreateTaskInput, UpdateTaskInput } from "./tasks.validation.js";

// Business logic and data access for tasks. No Express req/res here.
export const taskService = {
  list() {
    return prisma.task.findMany({ orderBy: { createdAt: "desc" } });
  },

  getById(id: string) {
    return prisma.task.findUniqueOrThrow({ where: { id } });
  },

  create(data: CreateTaskInput, createdById: string) {
    return prisma.task.create({ data: { ...data, createdById } });
  },

  update(id: string, data: UpdateTaskInput) {
    return prisma.task.update({ where: { id }, data });
  },

  remove(id: string) {
    return prisma.task.delete({ where: { id } });
  },
};
