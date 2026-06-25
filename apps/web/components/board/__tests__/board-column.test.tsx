import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import { BoardColumn } from "../board-column";
import type { BoardTask } from "@/lib/tasks";

const makeTask = (id: string, title: string, position: number): BoardTask => ({
  id,
  title,
  description: null,
  status: "PENDING",
  priority: "MEDIUM",
  dueDate: null,
  position,
  assignedTo: null,
});

// useDroppable/useSortable require a DndContext ancestor.
const renderInDnd = (ui: React.ReactElement) =>
  render(<DndContext>{ui}</DndContext>);

describe("BoardColumn", () => {
  it("renders the label, count and one card per task", () => {
    renderInDnd(
      <BoardColumn
        status="PENDING"
        label="To Do"
        tasks={[
          makeTask("1", "Define board rules", 0),
          makeTask("2", "Prep deck", 1),
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Define board rules")).toBeInTheDocument();
    expect(screen.getByText("Prep deck")).toBeInTheDocument();
  });

  it("renders an empty state when there are no tasks", () => {
    renderInDnd(<BoardColumn status="PENDING" label="To Do" tasks={[]} />);

    expect(screen.getByText("No tasks")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
