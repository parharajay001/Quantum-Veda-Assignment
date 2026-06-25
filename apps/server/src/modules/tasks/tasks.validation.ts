import { z } from "zod";

export const taskStatusSchema = z.enum([
  "DRAFT",
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
]);

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "title is required"),
  description: z.string().optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  // Accepts an ISO date string from the client; null clears the due date.
  dueDate: z.coerce.date().nullable().optional(),
  assignedToId: z.string().nullable().optional(),
  position: z.number().int().optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: z.coerce.date().nullable().optional(),
    assignedToId: z.string().nullable().optional(),
    position: z.number().int().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
