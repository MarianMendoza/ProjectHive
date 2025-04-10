"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useSocket } from "@/app/provider";

export default function SignIn() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const socket = useSocket();

  const { data: session, status } = useSession(); // Track session status

  useEffect(() => {
    // If there is an active session, redirect to the profile/dashboard page
    if (status === "authenticated") {
      router.push("/pages/dashboard"); // Redirect to the profile page
    }
  }, [status, router]); // Re-run effect if session status changes

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Send the email and password
      });

      if (res?.ok) {
        const data = await res.json();

        if (socket) {
          socket.emit("registerUser", data.userId);
        } else {
          console.error("Socket not initialized", error);
        }
        localStorage.setItem("token", data.token); // Store token in local storage

        router.push("/pages/dashboard"); // Redirect to profile/dashboard
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to log in");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} // Update email state
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
              <div className="text-sm">
                <a
                  href="/pages/forgot-password"
                  className="font-semibold text-emerald-700 hover:text-emerald-500"
                >
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // Update password state
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              Sign in
            </button>
            {error && (
              <div className="bg-red-500 text-white w-fit text-sm py-1 rounded-md px-2 mt-2">
                {error}
              </div>
            )}
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Don't Have An Account?{" "}
          <Link
            href="/pages/register"
            className="font-semibold leading-6 text-emerald-700 hover:text-emerald-500"
          >
            Sign Up Here!
          </Link>
        </p>
      </div>
    </div>
  );
}
