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

  it("list() returns unarchived tasks ordered by status then position, with the assignee included", async () => {
    const tasks = [
      { id: "1", title: "A", assignedTo: { id: "u1", name: "Ada" } },
    ];
    findMany.mockResolvedValue(tasks as never);

    await expect(taskService.list()).resolves.toEqual(tasks);
    expect(findMany).toHaveBeenCalledWith({
      where: { archived: false },
      orderBy: [{ status: "asc" }, { position: "asc" }],
      include: {
        assignedTo: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  });

  it("create() forwards the validated payload plus createdById to prisma", async () => {
    const input = { title: "New task" };
    const created = { id: "2", ...input, createdById: "u1" };
    create.mockResolvedValue(created as never);

    await expect(taskService.create(input, "u1")).resolves.toEqual(created);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { ...input, createdById: "u1" } }),
    );
  });
});
