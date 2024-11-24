"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User } from "@/types/users";
import Link from "next/link";

const UsersPage = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("../api/users");
        const data = await response.json();
        setUsers(data);
        setLecturers(
          data.filter(
            (user: User) => user.role === "Lecturer" && !user.approved
          )
        );
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleApproveLecturer = async (id: string) => {
    try {
      const res = await fetch(`../api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved: true }),
      });

      if (res.ok) {
        // Update the frontend state
        setLecturers((prevLecturers) =>
          prevLecturers.filter((lecturer) => lecturer._id !== id)
        );
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === id ? { ...user, approved: true } : user
          )
        );
      } else {
        console.error("Failed to approve the lecturer.");
      }
    } catch (error) {
      console.error("Error during lecturer approval:", error);
    }
  };

  // Handle delete functionality
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`../api/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers((prevUsers) =>
          prevUsers.filter((project) => project._id !== id)
        );
        setShowModal(false);
      } else {
        console.error("Failed to delete the user.");
      }
    } catch (error) {
      console.error("Error during deleting user:", error);
    }
  };

  // Handle closing the modal without deleting
  const closeModal = () => {
    setShowModal(false);
    setUserToDelete(null);
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div className="container mx-auto p-4 flex">
      <div
        className={`${
          session?.user?.role !== "Admin" ? "w-full" : "w-3/4 pr-4"
        }`}
      >
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0"
              onClick={() => handleRowClick(user)}
            >
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-xs text-center">
                    No Image
                  </span>
                </div>
              )}

              <div className="flex-grow sm:ml-4">
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-gray-500 text-sm italic">{user.role}</p>
                <p className="text-gray-600 text-sm">
                  {user.course || "No Course"}
                </p>
              </div>

              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  user.approved
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {user.approved ? "Approved" : "Pending Approval"}
              </span>

              {session?.user?.role === "Admin" && (
                <div className="flex space-x-2">
                  {/* Disable delete and edit buttons for the current logged-in user */}
                  {user._id !== session.user.id &&  (
                    <>
                      <Link
                        key={user._id}
                        href={`/pages/update-user/${user._id}`}
                        className="px-3 py-2 m-2 bg-lime-600 text-white text-sm rounded hover:bg-lime-700 transition"
                      >
                        ✏️ Edit
                      </Link>
                      {user.role !== "Admin" && (
                        <button
                        onClick={() => setShowModal(true)}
                        className="px-3 py-2 m-2 bg-lime-600 text-white text-sm rounded hover:bg-lime-700 transition"
                      >
                        🗑️ Delete
                      </button>
                      )}
                      
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {session?.user?.role === "Admin" && (
        <div className="w-full sm:w-3/4 lg:w-1/4 h-auto overflow-hidden bg-gray-50 shadow-md rounded-lg p-4 ml-4">
          <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">
            Pending Lecturer Approvals
          </h2>
          {lecturers.length === 0 ? (
            <p className="text-center text-gray-500">
              No lecturers pending approval
            </p>
          ) : (
            <div className="space-y-4">
              {lecturers.map((lecturer) => (
                <div
                  key={lecturer._id}
                  className="justify-between items-center p-4 border-b last:border-b-0 bg-white shadow-sm rounded-md"
                >
                  <div className=" flex-col sm:items-center">
                    <h3 className="font-semibold mb-2">{lecturer.name}</h3>
                    <p className="flex text-gray-500 text-sm">{lecturer.email}</p>
                  </div>
                  <div className="space-x-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleApproveLecturer(lecturer._id)}
                      className="px-3 py-2 bg-lime-600 text-white text-sm rounded m-2 hover:bg-lime-700 transition"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => setShowDeclineModal(true)}
                      className="px-3 py-2 bg-lime-600 text-white text-sm rounded m-2 hover:bg-red-700 transition"
                    >
                      ❌ Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-center text-gray-700 mb-6">
              Are you sure you want to delete this User?
            </p>
            <div className="flex justify-between">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedUser._id)}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200 ease-in-out"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeclineModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h2 className="text-xl font-bold text-center">Decline Lecturer</h2>
            <p className="text-center text-gray-700 mt-2">
              Are you sure you want to decline this lecturer's application?
            </p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowDeclineModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
