import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "../page";
import { ApiError, authApi } from "@/lib/api";

const push = jest.fn();
const refresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

jest.mock("@/lib/api", () => {
  class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }
  return { ApiError, authApi: { register: jest.fn() } };
});

const register = jest.mocked(authApi.register);

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits the new account and navigates home on success", async () => {
    register.mockResolvedValue({ user: {} as never });

    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        name: "Ada",
        email: "ada@example.com",
        password: "password123",
      }),
    );
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows the server error message on a duplicate email", async () => {
    register.mockRejectedValue(new ApiError(409, "Email already registered"));

    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Ada" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email already registered",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
