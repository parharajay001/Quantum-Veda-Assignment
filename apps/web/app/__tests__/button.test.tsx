import { render, screen } from "@testing-library/react";
import { Button } from "@repo/ui/button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button appName="web">Click me</Button>);

    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("alerts with the app name when clicked", () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<Button appName="web">Click me</Button>);
    screen.getByRole("button", { name: "Click me" }).click();

    expect(alertSpy).toHaveBeenCalledWith("Hello from your web app!");
    alertSpy.mockRestore();
  });
});
