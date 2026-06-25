import type { TaskPriority } from "./tasks";

// Priority → display label + the Tailwind text color used for the flag icon.
// Reserved violet stays for brand; priorities use semantic-ish accents.
export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; color: string }
> = {
  URGENT: { label: "Urgent", color: "text-destructive" },
  HIGH: { label: "High", color: "text-amber-500" },
  MEDIUM: { label: "Medium", color: "text-sky-500" },
  LOW: { label: "Low", color: "text-muted-foreground" },
};

// Initials for an avatar fallback. Multi-word names use the first letter of the
// first two words ("Priya Patel" -> "PP"); a single word uses its first two
// letters ("Admin" -> "AD") so the avatar always reads as a proper 2-char badge.
export function initials(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0] ?? "";
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const second = parts[1] ?? "";
  return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export interface DueDate {
  label: string;
  overdue: boolean;
}

// Human due-date label: "Today", "Tomorrow", or "Mon 4". `overdue` is true when
// the date is strictly before today (so the pill can tint destructive).
export function formatDueDate(iso: string, now: Date = new Date()): DueDate {
  const due = new Date(iso);
  const overdue = startOfDay(due) < startOfDay(now);

  if (sameDay(due, now)) return { label: "Today", overdue: false };

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(due, tomorrow)) return { label: "Tomorrow", overdue: false };

  const label = due.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return { label, overdue };
}
