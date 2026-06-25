"use client";

import * as React from "react";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Select } from "@repo/ui/components/ui/select";
import {
  COLUMNS,
  type TaskAssignee,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks";

export interface Filters {
  search: string;
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
  assigneeId: string; // "" = all, "UNASSIGNED", or a user id
}

export const EMPTY_FILTERS: Filters = {
  search: "",
  status: "ALL",
  priority: "ALL",
  assigneeId: "",
};

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

interface TaskFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  users: TaskAssignee[];
  onNewTask: () => void;
}

export function TaskFilters({
  filters,
  onChange,
  users,
  onNewTask,
}: TaskFiltersProps) {
  const [open, setOpen] = React.useState(false);

  const activeCount =
    (filters.search !== "" ? 1 : 0) +
    (filters.status !== "ALL" ? 1 : 0) +
    (filters.priority !== "ALL" ? 1 : 0) +
    (filters.assigneeId !== "" ? 1 : 0);
  const active = activeCount > 0;

  return (
    // On mobile this is a vertical stack; the selects collapse behind the
    // Filters toggle. At sm+ the inner groups become `display: contents` so
    // every control flows into a single wrapping row, as before.
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex gap-2 sm:contents">
        <Button
          onClick={onNewTask}
          size="sm"
          className="flex-1 sm:w-auto sm:flex-initial"
        >
          <Plus className="size-4" />
          New task
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="sm:hidden"
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5">
              {activeCount}
            </Badge>
          )}
        </Button>
      </div>

      <div className="relative w-full min-w-40 sm:max-w-xs sm:flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks…"
          aria-label="Search tasks"
          className="h-9 pl-8"
        />
      </div>

      <div
        className={cn("flex-col gap-2 sm:contents", open ? "flex" : "hidden")}
      >
        <Select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(e) =>
            onChange({
              ...filters,
              status: e.target.value as Filters["status"],
            })
          }
          className="h-9 w-full sm:w-auto"
        >
          <option value="ALL">All statuses</option>
          {COLUMNS.map((c) => (
            <option key={c.status} value={c.status}>
              {c.label}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by priority"
          value={filters.priority}
          onChange={(e) =>
            onChange({
              ...filters,
              priority: e.target.value as Filters["priority"],
            })
          }
          className="h-9 w-full sm:w-auto"
        >
          <option value="ALL">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0) + p.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>

        <Select
          aria-label="Filter by assignee"
          value={filters.assigneeId}
          onChange={(e) => onChange({ ...filters, assigneeId: e.target.value })}
          className="h-9 w-full sm:w-auto"
        >
          <option value="">All assignees</option>
          <option value="UNASSIGNED">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>

        {active && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="w-full sm:w-auto"
          >
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}

// Pure filter predicate, shared by the board and its tests.
export function applyFilters<
  T extends {
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    assignedTo: { id: string } | null;
  },
>(tasks: T[], filters: Filters): T[] {
  const q = filters.search.trim().toLowerCase();
  return tasks.filter((t) => {
    if (q) {
      const haystack = `${t.title} ${t.description ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (filters.status !== "ALL" && t.status !== filters.status) return false;
    if (filters.priority !== "ALL" && t.priority !== filters.priority)
      return false;
    if (filters.assigneeId === "UNASSIGNED" && t.assignedTo) return false;
    if (
      filters.assigneeId &&
      filters.assigneeId !== "UNASSIGNED" &&
      t.assignedTo?.id !== filters.assigneeId
    )
      return false;
    return true;
  });
}
