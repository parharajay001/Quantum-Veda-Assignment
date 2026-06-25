"use client";

import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@repo/ui/lib/utils";
import { type BoardTask, type TaskStatus } from "@/lib/tasks";
import { TaskCard } from "./task-card";

const DOT: Record<TaskStatus, string> = {
  DRAFT: "bg-muted-foreground/40",
  PENDING: "bg-sky-500",
  IN_PROGRESS: "bg-amber-500",
  COMPLETED: "bg-emerald-500",
};

interface CardHandlers {
  onEdit: (task: BoardTask) => void;
  onDelete: (task: BoardTask) => void;
  onMove: (task: BoardTask, status: TaskStatus) => void;
}

function SortableTaskCard({
  task,
  handlers,
}: {
  task: BoardTask;
  handlers: CardHandlers;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "touch-none",
        isDragging ? "cursor-grabbing opacity-40" : "cursor-grab",
      )}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} {...handlers} />
    </div>
  );
}

interface BoardColumnProps {
  status: TaskStatus;
  label: string;
  tasks: BoardTask[];
  onAddTask?: (status: TaskStatus) => void;
  handlers?: CardHandlers;
}

export function BoardColumn({
  status,
  label,
  tasks,
  onAddTask,
  handlers,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section className="flex w-[80vw] max-w-72 shrink-0 flex-col sm:w-72">
      <header className="mb-3 flex items-center gap-2 px-1">
        <span className={cn("size-2 rounded-full", DOT[status])} />
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className="text-sm text-muted-foreground">{tasks.length}</span>
        {onAddTask && (
          <button
            type="button"
            onClick={() => onAddTask(status)}
            aria-label={`Add task to ${label}`}
            className="ml-auto flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="size-4" />
          </button>
        )}
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-24 flex-1 flex-col gap-2.5 rounded-lg p-1.5 transition-colors sm:p-2",
          isOver && "bg-accent/50",
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <p className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
              No tasks
            </p>
          ) : (
            tasks.map((task) =>
              handlers ? (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  handlers={handlers}
                />
              ) : (
                <TaskCard key={task.id} task={task} />
              ),
            )
          )}
        </SortableContext>
      </div>
    </section>
  );
}
