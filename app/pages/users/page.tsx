"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface User {
    _id: string;
    imageUrl: string;
    name: string;
    email: string;
    course: string;
    description: string;
    role: string;
    approved: boolean;
}

const UsersPage = () => {
    const { data: session } = useSession();
    const [users, setUsers] = useState<User[]>([]);
    const [lecturers, setLecturers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch("../api/users");
                const data = await response.json();
                setUsers(data);
                setLecturers(data.filter((user: User) => user.role === "Lecturer" && !user.approved));
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="container mx-auto p-4 flex">
            {/* User Table */}
            <div className="w-3/4 pr-4">
                <div className="space-y-4">
                    {users.map((user) => (
                        <div
                            key={user._id}
                            className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0"
                        >
                            {/* User Image */}
                            {user.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt={user.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-xs text-center">No Image</span>
                                </div>
                            )}

                            {/* User Details */}
                            <div className="flex-grow sm:ml-4">
                                <h2 className="text-lg font-semibold">{user.name}</h2>
                                <p className="text-gray-500 text-sm italic">{user.role}</p>
                                <p className="text-gray-600 text-sm">{user.course || "No Course"}</p>
                            </div>

                            {/* Approval Badge */}
                            <span
                                className={`px-3 py-1 text-sm rounded-full ${
                                    user.approved
                                        ? "bg-green-100 text-green-600"
                                        : "bg-yellow-100 text-yellow-600"
                                }`}
                            >
                                {user.approved ? "Approved" : "Pending Approval"}
                            </span>

                            {/* Admin Options */}
                            {session?.user?.role === "Admin" && (
                                <div className="flex space-x-2">
                                    <button className="px-3 py-2 m-2 bg-lime-600 text-white text-sm rounded hover:bg-lime-700 transition">
                                        ✏️ Edit
                                    </button>
                                    <button className="px-3 py-2 m-2 bg-lime-600 text-white text-sm rounded hover:bg-lime-700 transition">
                                        🗑️ Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Lecturer Approvals */}
            {session?.user?.role === "Admin" && lecturers.length > 0 && (
                <div className="w-1/4 h-1/2 overflow-y-auto bg-gray-50 shadow-md rounded-lg p-4 ml-4">
                    <h2 className="text-xl font-semibold mb-4">Pending Lecturer Approvals</h2>
                    <div className="space-y-4">
                        {lecturers.map((lecturer) => (
                            <div
                                key={lecturer._id}
                                className="flex justify-between items-center p-4 border-b last:border-b-0 bg-white shadow-sm rounded-md"
                            >
                                <div>
                                    <h3 className="font-semibold">{lecturer.name}</h3>
                                    <p className="text-gray-500 text-sm">{lecturer.email}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="px-3 py-2 bg-lime-600 text-white text-sm rounded m-2 hover:bg-lime-700 transition">
                                        ✅ Approve
                                    </button>
                                    <button className="px-3 py-2 bg-lime-600 text-white text-sm rounded m-2 hover:bg-lime-700  transition">
                                        ❌ Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
