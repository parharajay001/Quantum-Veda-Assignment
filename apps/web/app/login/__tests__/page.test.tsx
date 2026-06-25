import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "../page";
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
  return { ApiError, authApi: { login: jest.fn() } };
});

const login = jest.mocked(authApi.login);

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits the credentials and navigates home on success", async () => {
    login.mockResolvedValue({ user: {} as never });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "password123",
      }),
    );
    expect(push).toHaveBeenCalledWith("/");
  });

  it("shows the server error message on failure", async () => {
    login.mockRejectedValue(new ApiError(401, "Invalid credentials"));

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid credentials",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("shows field errors and does not call the API when fields are empty", async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Enter your email.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });
});
