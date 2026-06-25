"use client";

import {
  CalendarDays,
  Flag,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Avatar } from "@repo/ui/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { COLUMNS, type BoardTask, type TaskStatus } from "@/lib/tasks";
import { PRIORITY_META, formatDueDate, initials } from "@/lib/format";

interface TaskCardProps {
  task: BoardTask;
  onEdit?: (task: BoardTask) => void;
  onDelete?: (task: BoardTask) => void;
  onMove?: (task: BoardTask, status: TaskStatus) => void;
}

// A single task card: title, muted description, color-coded priority flag, a
// due-date pill (destructive when overdue), the assignee, and an actions menu.
export function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  const priority = PRIORITY_META[task.priority];
  const due = task.dueDate ? formatDueDate(task.dueDate) : null;
  const interactive = Boolean(onEdit || onDelete || onMove);

  return (
    <article className="group rounded-lg border bg-card p-3 text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug">{task.title}</h3>
        {interactive && (
          <DropdownMenu>
            <DropdownMenuTrigger
              onPointerDown={(e) => e.stopPropagation()}
              aria-label={`Actions for ${task.title}`}
              className="-mr-1 -mt-0.5 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-0 transition-colors hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="size-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onMove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Move to</DropdownMenuLabel>
                  {COLUMNS.filter((c) => c.status !== task.status).map((c) => (
                    <DropdownMenuItem
                      key={c.status}
                      onClick={() => onMove(task, c.status)}
                    >
                      {c.label}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onClick={() => onDelete(task)}>
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <span
          className={cn("relative flex items-center", priority.color)}
          title={`${priority.label} priority`}
        >
          <Flag className="size-3.5 fill-current" strokeWidth={0} />
          <span className="sr-only">{priority.label} priority</span>
        </span>

        {due && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              due.overdue ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <CalendarDays className="size-3.5" />
            {due.label}
          </span>
        )}

        <span className="ml-auto">
          {task.assignedTo && (
            <Avatar
              src={task.assignedTo.avatarUrl}
              alt={task.assignedTo.name}
              fallback={initials(task.assignedTo.name)}
              className="size-6 text-[10px]"
            />
          )}
        </span>
      </div>
    </article>
  );
}
