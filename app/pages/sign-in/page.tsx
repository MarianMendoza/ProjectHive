'use client';
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function SignIn(){
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const router = useRouter(); // Use router for navigation

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault(); // Prevent the default form submission

        try {
            const res = await fetch('../api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), // Send the email and password
            });

            if (res?.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token); // Store token in local storage
                router.push('/'); // Redirect to the profile or dashboard
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
                <form onSubmit={handleLogin} className="space-y-6"> {/* Call handleLogin on submit */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
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
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                Password
                            </label>
                            <div className="text-sm">
                                <a href="#" className="font-semibold text-lime-600 hover:text-lime-500">
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
                            className="flex w-full justify-center rounded-md bg-lime-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600"
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
                    Don't Have An Account?{''}
                    <Link href="/register" className="font-semibold leading-6 text-lime-600 hover:text-lime-500">
                        Sign Up Here!
                    </Link>
                </p>
            </div>
        </div>
    );
}