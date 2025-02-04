import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SessionProvider } from "next-auth/react";
import userEvent from "@testing-library/user-event";
import ResetPassword from "@/app/pages/reset-password/page";

// Mock the Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams("?token=test-token")),
}));

// Mock the NextAuth session hook
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

describe("ResetPassword", () => {
  it("renders the reset password form correctly", () => {
    render(
      <SessionProvider session={null}>
        <ResetPassword />
      </SessionProvider>
    );

    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reset Password/i })).toBeInTheDocument();
  });

  it("shows an error if passwords do not match", async () => {
    render(
      <SessionProvider session={null}>
        <ResetPassword />
      </SessionProvider>
    );

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole("button", { name: /Reset Password/i });

    await userEvent.type(newPasswordInput, "newPassword123");
    await userEvent.type(confirmPasswordInput, "differentPassword123");
    await userEvent.click(submitButton);

    expect(await screen.findByText(/Passwords do not match!/i)).toBeInTheDocument();
  });

  it("calls the reset password API on valid form submission", async () => {
    render(
      <SessionProvider session={null}>
        <ResetPassword />
      </SessionProvider>
    );

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole("button", { name: /Reset Password/i });

    await userEvent.type(newPasswordInput, "newPassword123");
    await userEvent.type(confirmPasswordInput, "newPassword123");

    // Mock the fetch API
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => ({ message: "Password reset successful!" }),
    });

    await userEvent.click(submitButton);

    // Check if success message is shown
    expect(await screen.findByText(/Your password has been successfully reset./i)).toBeInTheDocument();
  });

  it("displays an error if the API fails", async () => {
    render(
      <SessionProvider session={null}>
        <ResetPassword />
      </SessionProvider>
    );

    const newPasswordInput = screen.getByLabelText(/New Password/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole("button", { name: /Reset Password/i });

    await userEvent.type(newPasswordInput, "newPassword123");
    await userEvent.type(confirmPasswordInput, "newPassword123");

    // Mock the fetch API to simulate an error
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => ({ message: "Failed to reset password" }),
    });

    await userEvent.click(submitButton);

    expect(await screen.findByText(/Failed to reset password/i)).toBeInTheDocument();
  });
});
