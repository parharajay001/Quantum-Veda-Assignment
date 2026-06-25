"use client";

import * as React from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select } from "@repo/ui/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog";
import { ApiError, taskApi } from "@/lib/api";
import {
  COLUMNS,
  type BoardTask,
  type TaskAssignee,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/tasks";
import { FormBanner } from "@/components/form-banner";

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

// ISO datetime -> yyyy-mm-dd for a native date input.
const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  task?: BoardTask;
  defaultStatus?: TaskStatus;
  users: TaskAssignee[];
  onSaved: (task: BoardTask) => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  mode,
  task,
  defaultStatus,
  users,
  onSaved,
}: TaskDialogProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<TaskStatus>("DRAFT");
  const [priority, setPriority] = React.useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = React.useState("");
  const [assignedToId, setAssignedToId] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>(
    {},
  );
  const [formError, setFormError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  // Seed the form whenever the dialog opens.
  React.useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setStatus(task?.status ?? defaultStatus ?? "DRAFT");
    setPriority(task?.priority ?? "MEDIUM");
    setDueDate(toDateInput(task?.dueDate ?? null));
    setAssignedToId(task?.assignedTo?.id ?? "");
    setFieldErrors({});
    setFormError(null);
  }, [open, task, defaultStatus]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setFieldErrors({});
    setFormError(null);

    const input: TaskInput = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assignedToId: assignedToId || null,
    };

    try {
      const saved =
        mode === "edit" && task
          ? await taskApi.update(task.id, input)
          : await taskApi.create(input);
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(err.fieldErrors)) {
            if (v?.[0]) flat[k] = v[0];
          }
          setFieldErrors(flat);
        }
        if (!err.fieldErrors || Object.keys(err.fieldErrors).length === 0) {
          setFormError(err.message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit task" : "New task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {formError && <FormBanner>{formError}</FormBanner>}

          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-invalid={fieldErrors.title ? true : undefined}
              autoFocus
            />
            {fieldErrors.title && (
              <p className="text-sm text-destructive">{fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more detail…"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              <Select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {COLUMNS.map((c) => (
                  <option key={c.status} value={c.status}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assignee</Label>
              <Select
                id="task-assignee"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving…"
                : mode === "edit"
                  ? "Save changes"
                  : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
