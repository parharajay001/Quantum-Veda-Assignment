import { render, screen } from "@testing-library/react";
import { TaskCard } from "../task-card";
import type { BoardTask } from "@/lib/tasks";

const baseTask: BoardTask = {
  id: "t1",
  title: "Wire up authentication cookies",
  description: "Forward the httpOnly token to the API",
  status: "IN_PROGRESS",
  priority: "URGENT",
  dueDate: new Date().toISOString(),
  position: 0,
  assignedTo: { id: "u1", name: "Priya Sharma", avatarUrl: null },
};

describe("TaskCard", () => {
  it("renders the title, description and priority", () => {
    render(<TaskCard task={baseTask} />);

    expect(
      screen.getByRole("heading", { name: "Wire up authentication cookies" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Forward the httpOnly token to the API"),
    ).toBeInTheDocument();
    expect(screen.getByText("Urgent priority")).toBeInTheDocument();
  });

  it("shows 'Today' for a due date of today and the assignee initials", () => {
    render(<TaskCard task={baseTask} />);

    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("PS")).toBeInTheDocument();
  });

  it("tints an overdue due date as destructive", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    render(
      <TaskCard task={{ ...baseTask, dueDate: yesterday.toISOString() }} />,
    );

    const due = screen.getByText(
      yesterday.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    );
    expect(due).toHaveClass("text-destructive");
  });

  it("shows an actions menu only when handlers are provided", () => {
    const { rerender } = render(<TaskCard task={baseTask} />);
    expect(
      screen.queryByRole("button", { name: /actions for/i }),
    ).not.toBeInTheDocument();

    rerender(<TaskCard task={baseTask} onEdit={() => {}} />);
    expect(
      screen.getByRole("button", { name: /actions for/i }),
    ).toBeInTheDocument();
  });
});
