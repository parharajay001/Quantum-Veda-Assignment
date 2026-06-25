import { groupByStatus, moveTask, sortTasks, type BoardTask } from "../tasks";

const task = (
  id: string,
  status: BoardTask["status"],
  position: number,
): BoardTask => ({
  id,
  title: id,
  description: null,
  status,
  priority: "MEDIUM",
  dueDate: null,
  position,
  assignedTo: null,
});

describe("tasks helpers", () => {
  it("sortTasks orders by column then position", () => {
    const sorted = sortTasks([
      task("b", "PENDING", 1),
      task("a", "DRAFT", 0),
      task("c", "PENDING", 0),
    ]);
    expect(sorted.map((t) => t.id)).toEqual(["a", "c", "b"]);
  });

  it("groupByStatus buckets tasks per column", () => {
    const grouped = groupByStatus([
      task("a", "DRAFT", 0),
      task("b", "PENDING", 0),
      task("c", "PENDING", 1),
    ]);
    expect(grouped.DRAFT.map((t) => t.id)).toEqual(["a"]);
    expect(grouped.PENDING.map((t) => t.id)).toEqual(["b", "c"]);
    expect(grouped.COMPLETED).toEqual([]);
  });

  describe("moveTask", () => {
    const base = [
      task("a", "DRAFT", 0),
      task("b", "DRAFT", 1),
      task("c", "PENDING", 0),
    ];

    it("moves a task to another column and re-indexes positions", () => {
      const { tasks, changed } = moveTask(base, "a", "PENDING", 0);
      const grouped = groupByStatus(tasks);

      expect(grouped.PENDING.map((t) => t.id)).toEqual(["a", "c"]);
      expect(grouped.DRAFT.map((t) => t.id)).toEqual(["b"]);
      // a (moved + repositioned), b (re-indexed 1->0), c (pushed to 1)
      const changedIds = changed.map((t) => t.id).sort();
      expect(changedIds).toEqual(["a", "b", "c"]);
      expect(tasks.find((t) => t.id === "a")?.status).toBe("PENDING");
      expect(tasks.find((t) => t.id === "b")?.position).toBe(0);
    });

    it("returns no changes when nothing moves", () => {
      const { changed } = moveTask(base, "c", "PENDING", 0);
      expect(changed).toEqual([]);
    });

    it("ignores an unknown task id", () => {
      const result = moveTask(base, "zzz", "DRAFT", 0);
      expect(result.tasks).toBe(base);
      expect(result.changed).toEqual([]);
    });
  });
});
