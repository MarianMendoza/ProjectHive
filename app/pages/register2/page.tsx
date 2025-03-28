'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from "@/app/provider";
import { User } from '@/types/users';


export default function Register2(){
  const router = useRouter();
  const [role, setRole] = useState<'Student' | 'Lecturer' | null>(null);
  const [error, setError] = useState<string>("");
  const [admins, setAdmins] = useState<string[]>([]);
  const socket = useSocket();

  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRole(e.target.value as 'Student' | 'Lecturer');
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users")
      const data = await res.json()

      const adminsIds = data.filter((user:User) => user.role =="Admin").map((admin: User) => admin._id);
      console.log(adminsIds);
      setAdmins(adminsIds);
    } catch (error) {
      console.error("Error fetching Users", error);
      
    }
  }

  useEffect(() => {
    fetchUsers();
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    console.log(token);

    if (!token) {
        console.error("Token is undefined. User is not authenticated.");
        return; // Handle error accordingly
    }
    if (!role) {
      setError("Please select a role.");
      return;
    }

    try {
      const res = await fetch('/api/register2', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Include the token in the header
        },
        body: JSON.stringify({ role }),
      });

    
      if (res.ok) {
        const data = await res.json();
        console.log(data.user._id);
        localStorage.setItem('token', data.token); // Save token in local storage
        router.push('/pages/sign-in');

        const userId = data.user._id;
        const receiversId = admins;
        const projectId = null;
        const type = "LecturerCreated";

        console.log("Emitting Notification with userId:", userId); // Debugging line
  
        if (data.user.role == "Lecturer" && admins?.length >0 && socket) {

            socket.emit("sendNotification", {
              userId,
              receiversId,
              projectId,
              type,
            });
        }
  
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
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 ">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-center text-3xl font-semibold leading-9 tracking-tight text-gray-900">
          Select Your Role
        </h2>
      </div>
  
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 shadow-md rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="student"
              value="Student"
              checked={role === 'Student'}
              onChange={handleRoleChange}
              className="h-4 w-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
            />
            <label htmlFor="student" className="text-gray-800">Student</label>
          </div>
  
          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="lecturer"
              value="Lecturer"
              checked={role === 'Lecturer'}
              onChange={handleRoleChange}
              className="h-4 w-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
            />
            <label htmlFor="lecturer" className="text-gray-800">Lecturer</label>
          </div>
  
          {error && <div className="text-red-500 text-sm">{error}</div>}
  
          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-emerald-500 text-white font-semibold rounded-md shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
            >
              Save Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  
}