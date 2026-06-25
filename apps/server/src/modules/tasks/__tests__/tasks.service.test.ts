import { taskService } from "../tasks.service.js";
import { prisma } from "@repo/database";

jest.mock("@repo/database", () => ({
  prisma: {
    task: { findMany: jest.fn(), create: jest.fn() },
  },
}));

const findMany = jest.mocked(prisma.task.findMany);
const create = jest.mocked(prisma.task.create);

describe("taskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("list() returns tasks ordered by createdAt desc", async () => {
    const tasks = [{ id: "1", title: "A" }];
    findMany.mockResolvedValue(tasks as never);

    await expect(taskService.list()).resolves.toEqual(tasks);
    expect(findMany).toHaveBeenCalledWith({ orderBy: { createdAt: "desc" } });
  });

  it("create() forwards the validated payload to prisma", async () => {
    const input = { title: "New task" };
    const created = { id: "2", ...input };
    create.mockResolvedValue(created as never);

    await expect(taskService.create(input)).resolves.toEqual(created);
    expect(create).toHaveBeenCalledWith({ data: input });
  });
});
