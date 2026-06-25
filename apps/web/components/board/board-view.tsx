"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { taskApi } from "@/lib/api";
import {
  COLUMNS,
  groupByStatus,
  moveTask,
  sortTasks,
  type BoardTask,
  type TaskAssignee,
  type TaskStatus,
} from "@/lib/tasks";
import { FormBanner } from "@/components/form-banner";
import { BoardColumn } from "./board-column";
import { TaskCard } from "./task-card";
import { TaskDialog } from "./task-dialog";
import { ConfirmDialog } from "./confirm-dialog";
import {
  TaskFilters,
  applyFilters,
  EMPTY_FILTERS,
  type Filters,
} from "./task-filters";

const isStatus = (id: string): id is TaskStatus =>
  COLUMNS.some((c) => c.status === id);

interface BoardViewProps {
  initialTasks: BoardTask[];
  users: TaskAssignee[];
}

export function BoardView({ initialTasks, users }: BoardViewProps) {
  const [tasks, setTasks] = React.useState(() => sortTasks(initialTasks));
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [dialog, setDialog] = React.useState<{
    mode: "create" | "edit";
    task?: BoardTask;
    defaultStatus?: TaskStatus;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<BoardTask | null>(
    null,
  );
  const [deleting, setDeleting] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const visible = applyFilters(tasks, filters);
  const grouped = groupByStatus(visible);
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  // Persist the tasks whose status/position changed, reverting on failure.
  async function persist(changed: BoardTask[], previous: BoardTask[]) {
    try {
      await Promise.all(
        changed.map((c) =>
          taskApi.update(c.id, { status: c.status, position: c.position }),
        ),
      );
    } catch {
      setTasks(previous);
      setError("Couldn't save the change. Your board was reverted.");
    }
  }

  function onSaved(saved: BoardTask) {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      const next = exists
        ? prev.map((t) => (t.id === saved.id ? saved : t))
        : [...prev, saved];
      return sortTasks(next);
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    try {
      await taskApi.remove(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      setTasks(previous);
      setError("Couldn't delete the task. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  function moveToStatus(task: BoardTask, status: TaskStatus) {
    if (task.status === status) return;
    const previous = tasks;
    const toIndex = groupByStatus(tasks)[status].length;
    const { tasks: next, changed } = moveTask(tasks, task.id, status, toIndex);
    setTasks(next);
    void persist(changed, previous);
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);
    const current = tasks.find((t) => t.id === activeTaskId);
    if (!current) return;

    const fullGrouped = groupByStatus(tasks);
    let toStatus: TaskStatus;
    let toIndex: number;

    if (isStatus(overId)) {
      toStatus = overId;
      toIndex = fullGrouped[toStatus].length;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;
      toStatus = overTask.status;
      toIndex = fullGrouped[toStatus].findIndex((t) => t.id === overId);
    }

    const previous = tasks;
    const { tasks: next, changed } = moveTask(
      tasks,
      activeTaskId,
      toStatus,
      toIndex,
    );
    if (changed.length === 0) return;
    setTasks(next);
    void persist(changed, previous);
  }

  const handlers = {
    onEdit: (task: BoardTask) => setDialog({ mode: "edit", task }),
    onDelete: (task: BoardTask) => setDeleteTarget(task),
    onMove: moveToStatus,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-4 border-b p-3 sm:p-6">
        <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
        <TaskFilters
          filters={filters}
          onChange={setFilters}
          users={users}
          onNewTask={() => setDialog({ mode: "create" })}
        />
      </div>

      {error && (
        <div className="px-4 pt-4 sm:px-6">
          <FormBanner>{error}</FormBanner>
        </div>
      )}

      <DndContext
        id="board-dnd"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="flex flex-1 gap-3 overflow-x-auto p-3 sm:gap-4 sm:p-6">
          {COLUMNS.map(({ status, label }) => (
            <BoardColumn
              key={status}
              status={status}
              label={label}
              tasks={grouped[status]}
              onAddTask={(s) => setDialog({ mode: "create", defaultStatus: s })}
              handlers={handlers}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="cursor-grabbing">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {dialog && (
        <TaskDialog
          open
          onOpenChange={(open) => !open && setDialog(null)}
          mode={dialog.mode}
          task={dialog.task}
          defaultStatus={dialog.defaultStatus}
          users={users}
          onSaved={onSaved}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete task?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be permanently removed.`
            : undefined
        }
        onConfirm={confirmDelete}
        pending={deleting}
      />
    </div>
  );
}
