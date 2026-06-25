import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TaskDialog } from "../task-dialog";
import { ApiError, taskApi } from "@/lib/api";
import type { TaskAssignee } from "@/lib/tasks";

jest.mock("@/lib/api", () => {
  class ApiError extends Error {
    status: number;
    fieldErrors?: Record<string, string[]>;
    constructor(
      status: number,
      message: string,
      fieldErrors?: Record<string, string[]>,
    ) {
      super(message);
      this.status = status;
      this.fieldErrors = fieldErrors;
    }
  }
  return {
    ApiError,
    taskApi: { create: jest.fn(), update: jest.fn() },
  };
});

const create = jest.mocked(taskApi.create);
const users: TaskAssignee[] = [{ id: "u1", name: "Priya", avatarUrl: null }];

describe("TaskDialog", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the form fields in create mode", () => {
    render(
      <TaskDialog
        open
        onOpenChange={() => {}}
        mode="create"
        users={users}
        onSaved={() => {}}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "New task" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Priority")).toBeInTheDocument();
    expect(screen.getByLabelText("Assignee")).toBeInTheDocument();
  });

  it("creates a task and reports the saved result", async () => {
    const saved = { id: "t9", title: "New" } as never;
    create.mockResolvedValue(saved);
    const onSaved = jest.fn();

    render(
      <TaskDialog
        open
        onOpenChange={() => {}}
        mode="create"
        defaultStatus="PENDING"
        users={users}
        onSaved={onSaved}
      />,
    );

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Ship the board" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));

    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Ship the board", status: "PENDING" }),
    );
    expect(onSaved).toHaveBeenCalledWith(saved);
  });

  it("surfaces a server field error on the title", async () => {
    create.mockRejectedValue(
      new ApiError(400, "Validation failed", { title: ["title is required"] }),
    );

    render(
      <TaskDialog
        open
        onOpenChange={() => {}}
        mode="create"
        users={users}
        onSaved={() => {}}
      />,
    );

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(await screen.findByText("title is required")).toBeInTheDocument();
  });
});
