'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register2(){
    const router = useRouter();
  const [role, setRole] = useState<'student' | 'lecturer' | null>(null);
  const [error, setError] = useState<string>("");

  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRole(e.target.value as 'student' | 'lecturer');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
        console.error("Token is undefined. User is not authenticated.");
        return; // Handle error accordingly
    }
    if (!role) {
      setError("Please select a role.");
      return;
    }

    try {
      const res = await fetch('../api/register2', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include the token in the header
        },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token); // Save token in local storage
        router.push('/pages/sign-in');
      } else {
        const data = await res.json();
        setError(data.message || "Failed to save role.");
      }
    } catch (error) {
      console.log("Error saving role:", error);
      setError("An error occurred, please try again.");
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Select Your Role
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label>
              <input type="radio" value="student" checked={role === 'student'} onChange={handleRoleChange} />
              Student
            </label>
          </div>
          <div>
            <label>
              <input type="radio" value="lecturer" checked={role === 'lecturer'} onChange={handleRoleChange} />
              Lecturer
            </label>
          </div>
          {error && <div className="text-red-500">{error}</div>}
          <div>
            <button type="submit" className="btn">Save Role</button>
          </div>
        </form>
      </div>
    </div>
  );
}