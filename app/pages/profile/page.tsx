'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Profile(){
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true); // Track loading state

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/sign-in');
                return;
            }

            try {
                const res = await fetch('/api/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    const errorData = await res.json(); // Capture error response if available
                    setError(errorData.message || "Failed to load profile data.");
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError("An error occurred, please try again.");
            } finally {
                setLoading(false); // Ensure loading state is reset
            }
        };

        fetchUserProfile();
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {loading && <p>Loading...</p>} {/* Show loading indicator */}
            {error && (
                <div className="bg-red-500 text-white w-fit text-sm py-1 rounded-md px-2 mt-2">
                    {error}
                </div>
            )}
            {user && (
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Profile</h1>
                    <p className="mt-4 text-lg">Name: {user.name}</p>
                    <p className="mt-2 text-lg">Role: {user.role}</p>
                </div>
            )}
        </div>
    );
}