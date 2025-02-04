"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use for navigation methods
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation"; // Import useSearchParams

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const { status } = useSession(); // Get the session status

  const searchParams = useSearchParams(); // Access URL search parameters
  const token = searchParams.get("token"); // Extract the token from the URL query parameters


  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setError("Token is missing");
      return;
    }

    // Basic form validation
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // if (newPassword.length < 6) {
    //   setError("Password must be at least 6 characters long.");
    //   return;
    // }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token, // Send the token from the URL
          newPassword: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password");
      } else {
        setSuccessMessage("Your password has been successfully reset.");
        // Optionally redirect to login after success
        setTimeout(() => {
          router.push("/pages/sign-in");
        }, 3000);
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Reset Your Password
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-900">
              New Password
            </label>
            <div className="mt-2">
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
              Confirm Password
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-lime-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"
            >
              Reset Password
            </button>
            {error && (
              <div className="bg-red-500 text-white w-fit text-sm py-1 rounded-md px-2 mt-2">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-500 text-white w-fit text-sm py-1 rounded-md px-2 mt-2">
                {successMessage}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
