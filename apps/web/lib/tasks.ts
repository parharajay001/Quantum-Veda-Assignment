// Client-safe task types and pure helpers (no server-only imports, so this can
// be imported from client components). Server-side fetchers live in tasks.server.ts.

export type TaskStatus = "DRAFT" | "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TaskAssignee {
  id: string;
  name: string;
  email?: string;
  avatarUrl: string | null;
}

// The subset of the Prisma task row the board renders (GET /api/tasks includes
// the assignedTo relation; comments/attachments have no data model).
export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  assignedTo: TaskAssignee | null;
}

// Payload for creating/editing a task. dueDate is an ISO string (or null to
// clear); assignedToId is a user id (or null to unassign).
export interface TaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assignedToId?: string | null;
}

// Ordered board columns. Friendly labels over the raw enum; the order here is
// the left-to-right order on the board.
export const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "DRAFT", label: "Backlog" },
  { status: "PENDING", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "COMPLETED", label: "Done" },
];

const STATUS_ORDER: Record<TaskStatus, number> = {
  DRAFT: 0,
  PENDING: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
};

// Stable board ordering: by column, then position within the column.
export function sortTasks(tasks: BoardTask[]): BoardTask[] {
  return [...tasks].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      a.position - b.position,
  );
}

// Bucket tasks into the configured columns, preserving board order within each.
export function groupByStatus(
  tasks: BoardTask[],
): Record<TaskStatus, BoardTask[]> {
  const grouped: Record<TaskStatus, BoardTask[]> = {
    DRAFT: [],
    PENDING: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  };
  for (const task of sortTasks(tasks)) {
    grouped[task.status]?.push(task);
  }
  return grouped;
}

// Pure drag-and-drop move: place `activeId` into `toStatus` at `toIndex`, then
// re-index positions of the affected columns. Returns the new task array plus
// the subset of tasks whose status/position changed (to persist via the API).
export function moveTask(
  tasks: BoardTask[],
  activeId: string,
  toStatus: TaskStatus,
  toIndex: number,
): { tasks: BoardTask[]; changed: BoardTask[] } {
  const active = tasks.find((t) => t.id === activeId);
  if (!active) return { tasks, changed: [] };

  const grouped = groupByStatus(tasks);
  // Remove the active task from whichever column it currently sits in.
  for (const status of Object.keys(grouped) as TaskStatus[]) {
    grouped[status] = grouped[status].filter((t) => t.id !== activeId);
  }

  const target = grouped[toStatus];
  const clampedIndex = Math.max(0, Math.min(toIndex, target.length));
  // Insert as-is; the re-index loop below assigns the new status/position and
  // records it as changed.
  target.splice(clampedIndex, 0, active);

  const next: BoardTask[] = [];
  const changed: BoardTask[] = [];
  for (const { status } of COLUMNS) {
    grouped[status].forEach((task, index) => {
      const updated =
        task.position !== index || task.status !== status
          ? { ...task, position: index, status }
          : task;
      next.push(updated);
      if (updated !== task) changed.push(updated);
    });
  }

  return { tasks: next, changed };
}
