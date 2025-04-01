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
  const [courseFilter, setCourseFilter] = useState<string>("All");
  const [course, setCourses] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [message, setMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [showConfirmModal, setshowConfirmModal] = useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState(false);

  const socket = useSocket();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/tags");
        const data = await res.json();
        const courseName = data.map((tag: { name: string }) => tag.name);
        setCourses(courseName);
      } catch (error) {
        console.error("Error fetching tags", error);
      }
    };
    const fetchUsers = async () => {
      try {
        const usersResponse = await fetch("/api/users");
        const usersData = await usersResponse.json();
        setLecturers(
          usersData.filter(
            (user: User) => user.role === "Lecturer" && !user.approved
          )
        );

        const projectsResponse = await fetch("/api/projects");
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

    fetchCourses();
    fetchUsers();
  }, [searchQuery, courseFilter]);

  const handleInviteClick = (lecturer: User) => {
    setSelectedLecturer(lecturer);
    setShowInviteModal(true);
  };

  const handleInvite = async () => {
    setshowConfirmModal(true);
  };

  const handleInviteSubmit = async () => {
    setshowConfirmModal(false);

    if (session?.user.role === "Lecturer") {
      const userId = session?.user.id;
      const receiversId = [selectedLecturer?._id];
      const projectId = selectedProject;
      const type = "InvitationSecondReader";
      const messageUser = message;

      console.log(projectId);

      if (socket) {
        socket.emit("sendNotification", {
          userId,
          receiversId,
          projectId,
          messageUser,
          type,
        });
      } else {
        console.error("Socket is not initialized");
      }
    } else {
      const userId = session?.user.id;
      const receiversId = [selectedLecturer?._id];
      const projectId = selectedProject;
      const type = "InvitationSupervisor";
      const messageUser = message;
      if (socket) {
        socket.emit("sendNotification", {
          userId,
          receiversId,
          projectId,
          messageUser,
          type,
        });
      } else {
        console.error("Socket is not initialized");
      }
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
    const matchesCourse = courseFilter === "All" || user.tag === courseFilter;

    return matchesSearchQuery && matchesRole && matchesCourse;
  });

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row">
      <div className="w-full lg:pr-4">
      <div className="bg-white flex justify-start w-full rounded-lg p-3 text-center">
          <h2 className="text-md font-semibold text-gray-800">
            Total Users: {users.length}
          </h2>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row md:justify-between gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name"
            className="w-full sm:w-1/2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full sm:w-1/4 px-4 py-2 flex flex-col md:flex-row border rounded focus:outline-none focus:ring-2 focus:ring-teal-700"
          >
            <option value="All">All Roles</option>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
          </select>
          <div className="w-full gap-3 flex flex-col sm:w-1/2 md:w-1/3  md:flex-row justify-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`text-white p-2 rounded-sm hover:bg-opacity-80 transition duration-200 ease-in-out w-full text-center ${
                showFilters
                  ? "bg-emerald-700 hover:bg-emerald-800"
                  : "bg-gray-700 hover:bg-gray-800"
              }`}
            >
              {showFilters ? "Hide Filters" : "More Filters"}
            </button>
          </div>
        </div>

        <div className="w-full mt-3 bg-white mb-5 ">
          {showFilters && (
            <div className="p-2 flex flex-col md:flex-row gap-3 w-full ">
              <h3 className="text-lg font-semibold md:w-1/3">Select Program</h3>
              <div className="flex gap-4 flex-col md:flex-row md:w-2/3">
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="radio"
                    name="courseFilter"
                    value="All"
                    checked={courseFilter === "All"}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="form-radio text-emerald-800"
                  />
                  <span>All Programs</span>
                </label>
                {course.map((c, index) => (
                  <label
                    key={index}
                    className="inline-flex items-center space-x-2"
                  >
                    <input
                      type="radio"
                      name="courseFilter"
                      value={c}
                      checked={courseFilter === c}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      className="form-radio text-emerald-800"
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row items-center sm:items-start justify-between space-y-4 sm:space-y-0"
            >
              <div className="w-full sm:w-auto flex justify-center sm:justify-start">
                {user.pfpurl ? (
                  <img
                    src={user.pfpurl}
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
              </div>

              {/* User Details */}
              <div className="flex-grow m-2 text-center sm:text-left">
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-gray-500 text-sm italic">{user.role}</p>
                <p className="text-gray-600 text-sm">
                  {user.tag || "No Course"}
                </p>
                <p className="text-gray-600 text-sm">
                  {user.assignedProject
                    ? `Project: ${user.assignedProject}`
                    : "No Projects Assigned"}
                </p>
              </div>

              {/* Actions - Invite Button Full Width on Mobile */}
              <div className="w-full sm:w-auto flex flex-col md:flex-row md:items-center md:justify-end space-y-2 md:space-y-0 md:space-x-4">
                {/* Invite Button - Shown for Eligible Users */}
                {(user.role === "Lecturer" &&
                  session?.user.role === "Lecturer" &&
                  session?.user.id !== user._id) ||
                (user.role === "Lecturer" &&
                  session?.user.role === "Student" &&
                  session?.user.id !== user._id) ? (
                  <button
                    onClick={() => handleInviteClick(user)}
                    className="px-4 py-2 bg-emerald-700 text-white text-sm rounded hover:bg-emerald-700 transition"
                  >
                    Invite
                  </button>
                ) : null}

                {/* Approval Status - Next to Invite Button on md/lg screens */}
                <span
                  className={`px-3 py-2 text-sm rounded-full text-center ${
                    user.approved
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {user.approved ? "Approved" : "Pending Approval"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && selectedLecturer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
              Invite {selectedLecturer.name} to become a{" "}
              {session?.user?.role === "Student"
                ? "supervisor"
                : "second-reader"}{" "}
              in your Project
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
                onClick={() => handleInviteSubmit()}
                className="bg-teal-700 text-white px-6 py-2 rounded-lg hover:bg-teal-800 transition duration-200 ease-in-out"
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
