import { prisma } from "@repo/database";
import type { CreateTaskInput, UpdateTaskInput } from "./tasks.validation.js";

// Always return the assignee alongside a task so the board can render avatars
// after any mutation (not just on list).
const assigneeInclude = {
  assignedTo: { select: { id: true, name: true, avatarUrl: true } },
} as const;

// Business logic and data access for tasks. No Express req/res here.
export const taskService = {
  list() {
    return prisma.task.findMany({
      where: { archived: false },
      orderBy: [{ status: "asc" }, { position: "asc" }],
      include: assigneeInclude,
    });
  },

  getById(id: string) {
    return prisma.task.findUniqueOrThrow({
      where: { id },
      include: assigneeInclude,
    });
  },

  create(data: CreateTaskInput, createdById: string) {
    return prisma.task.create({
      data: { ...data, createdById },
      include: assigneeInclude,
    });
  },

  update(id: string, data: UpdateTaskInput) {
    return prisma.task.update({
      where: { id },
      data,
      include: assigneeInclude,
    });
  },

  remove(id: string) {
    return prisma.task.delete({ where: { id } });
  },
};
