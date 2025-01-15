"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User } from "@/types/users";
import { Project } from "@/types/projects";
import { useSocket } from "@/app/provider";



const UsersPage = () => {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedLecturer, setSelectedLecturer] = useState<User | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const socket = useSocket();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersResponse = await fetch("../api/users");
        const usersData = await usersResponse.json();
        setLecturers(
          usersData.filter(
            (user: User) => user.role === "Lecturer" && !user.approved
          )
        );

        const projectsResponse = await fetch("../api/projects");
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);

        const usersWithProjects = usersData.map((user: User) => {
          // Find the project assigned to the user
          const assignedProject = projectsData.find((project: Project) =>
            project.projectAssignedTo.studentsId.some(
              (student: User) => student._id === user._id
            )
          );

          return {
            ...user,
            assignedProject: assignedProject ? assignedProject.title : null,
          };
        });
        setUsers(usersWithProjects);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleInviteClick = (lecturer: User) => {
    setSelectedLecturer(lecturer);
    setShowInviteModal(true);
  };

  const handleInviteSubmit = async () => {
    // console.log("Selected Project;" + selectedProject);
    const userId = session?.user.id;
    const receiversId = [selectedLecturer?._id];
    const projectId = selectedProject;
    const type = "Invitation";

    // console.log("User ID", userId, "ReceiversId", receiversId, "ProjectId", projectId, "type", type);
    if (socket) {
      socket.emit("sendNotification", {userId, receiversId,projectId,type});
    } else{
      console.error("Socket is not initialized");
    }
    

    setShowInviteModal(false);
    alert("You have sent an invite.");
    
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearchQuery = user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole =
      selectedRole === "All" ||
      user.role.toLowerCase() === selectedRole.toLowerCase();
    return matchesSearchQuery && matchesRole;
  });

  return (
    <div className="container mx-auto p-4 flex">
      <div className={`w-full pr-4`}>
        <div className="flex justify-between mb-4">
          <input
            type="text"
            placeholder="Search by name"
            className="px-4 py-2 border rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="All">All Roles</option>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0"
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
                <p className="text-gray-600 text-sm">
                  {user.assignedProject
                    ? `Project: ${user.assignedProject}`
                    : "No Projects Assigned"}
                </p>
              </div>

              <div className="flex space-x-2">
                {user.role === "Lecturer" && session !== null && session?.user.id !== user._id && (
                  <button
                    onClick={() => handleInviteClick(user)}
                    className="px-3 py-2 m-2 bg-lime-600 text-white text-sm rounded hover:bg-lime-700 transition"
                  >
                    Invite
                  </button>
                )}

                <span
                  className={`px-3 py-2 m-2 text-sm rounded-full ${
                    user.approved
                      ? "bg-green-100 text-green-600"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {user.approved ? "Approved" : "Pending Approval"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showInviteModal && selectedLecturer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
              Invite {selectedLecturer.name} to become a second-reader in your
              Project
            </h2>
            <div className="mb-4">
              <label htmlFor="project" className="block text-sm text-gray-700">
                Select Project:
              </label>
              <select
                id="project"
                value={selectedProject || ""}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="" disabled>
                  Select a project
                </option>
                {projects
                  .filter(
                    (project: Project) =>
                      project.projectAssignedTo.authorId._id ===
                      session?.user?.id
                  ) 
                  .map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setShowInviteModal(false)}
                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteSubmit}
                className="bg-lime-500 text-white px-6 py-2 rounded-lg hover:bg-lime-600 transition duration-200 ease-in-out"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
