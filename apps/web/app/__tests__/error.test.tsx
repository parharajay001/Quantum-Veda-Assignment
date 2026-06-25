import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../error";

jest.mock("@repo/logger/client", () => ({
  clientLogger: { error: jest.fn() },
}));
import { clientLogger } from "@repo/logger/client";

const error = jest.mocked(clientLogger.error);

describe("Error boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the fallback UI and reports the error", () => {
    const thrown = Object.assign(new Error("boom"), { digest: "abc123" });

    render(<ErrorBoundary error={thrown} reset={() => {}} />);

    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
    expect(error).toHaveBeenCalledWith(
      "boom",
      expect.objectContaining({ digest: "abc123" }),
    );
  });
});
