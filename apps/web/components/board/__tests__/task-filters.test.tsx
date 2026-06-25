import { applyFilters, type Filters } from "../task-filters";

const t = (
  id: string,
  title: string,
  status: "DRAFT" | "PENDING" | "IN_PROGRESS" | "COMPLETED",
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  assigneeId: string | null,
) => ({
  id,
  title,
  description: null as string | null,
  status,
  priority,
  assignedTo: assigneeId ? { id: assigneeId } : null,
});

const tasks = [
  t("1", "Ship the board", "IN_PROGRESS", "HIGH", "u1"),
  t("2", "Fix the flaky test", "PENDING", "LOW", "u2"),
  t("3", "Plan roadmap", "DRAFT", "HIGH", null),
];

const filters = (overrides: Partial<Filters>): Filters => ({
  search: "",
  status: "ALL",
  priority: "ALL",
  assigneeId: "",
  ...overrides,
});

describe("applyFilters", () => {
  it("returns all tasks with empty filters", () => {
    expect(applyFilters(tasks, filters({}))).toHaveLength(3);
  });

  it("filters by case-insensitive search", () => {
    const res = applyFilters(tasks, filters({ search: "FLAKY" }));
    expect(res.map((x) => x.id)).toEqual(["2"]);
  });

  it("filters by status", () => {
    const res = applyFilters(tasks, filters({ status: "PENDING" }));
    expect(res.map((x) => x.id)).toEqual(["2"]);
  });

  it("filters by priority", () => {
    const res = applyFilters(tasks, filters({ priority: "HIGH" }));
    expect(res.map((x) => x.id)).toEqual(["1", "3"]);
  });

  it("filters by assignee and by unassigned", () => {
    expect(
      applyFilters(tasks, filters({ assigneeId: "u1" })).map((x) => x.id),
    ).toEqual(["1"]);
    expect(
      applyFilters(tasks, filters({ assigneeId: "UNASSIGNED" })).map(
        (x) => x.id,
      ),
    ).toEqual(["3"]);
  });
});
