'use client'
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session } = useSession();

  if (!session) {
    return <p>You need to be logged in to view this page.</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto mt-8 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <p><strong>Name:</strong> {session.user.name}</p>
      <p><strong>Email:</strong> {session.user.email}</p>
      <p><strong>Role:</strong> {session.user.role}</p>
    </div>
  );
}
