"use client";
import { useEffect, useState } from "react";
import { Project } from "../../../types/projects";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSocket } from "@/app/provider";
import { User } from "@/types/users";

const ProjectsPage = () => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [message, setMessage] = useState("");

  const [appliedStudents, setAppliedStudents] = useState<{
    [projectId: string]: string[];
  }>({});

  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();

          const filteredProjects = data.filter((project: Project) => {
            // Filter based on visibility (Private projects only visible to the author or assigned users)
            if (project.visibility === "Private") {
              if (
                project.projectAssignedTo.authorId?._id !== session?.user.id &&
                !project.projectAssignedTo?.studentsId.some(
                  (student) => student._id === session?.user.id
                )
              ) {
                return false; // If the project is private, only show if the user is the author or assigned student
              }
            }

            // Filter based on search query
            const matchesSearchQuery =
              project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              project.projectAssignedTo?.authorId?.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            // Filter based on status
            const matchesStatusFilter =
              statusFilter === "All" ||
              (statusFilter === "Open" && project.status) ||
              (statusFilter === "Closed" && !project.status);

            return matchesSearchQuery && matchesStatusFilter;
          });

          setProjects(filteredProjects);
        } else {
          console.error("Failed to fetch projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [session, searchQuery, statusFilter]); // Dependency array to re-run effect on searchQuery or statusFilter change

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });

      if (res.ok) {
        setProjects((prevProjects) => {
          const updatedProjects = prevProjects.filter(
            (project) => project._id !== id
          );

          if (updatedProjects.length > 0) {
            setSelectedProject(updatedProjects[0]);
          } else {
            setSelectedProject(null);
          }
          setShowModal(false);

          return updatedProjects;
        });
      } else {
        console.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const confirmDelete = (id: string) => {
    setProjectToDelete(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setProjectToDelete(null);
  };

  const handleApply = async (id: String) => {
    setShowMessageModal(true);
  };

  const handleModalSubmit = async (id:String) => {

    setShowMessageModal(false);

    setAppliedStudents((prev) => {
      const updated = { ...prev };
      if (updated[selectedProject?._id]) {
        // If the project already has applicants, add the student to the list
        updated[selectedProject?._id].push(session?.user.id);
      } else {
        // Otherwise, create a new entry for the project with the studentId
        updated[selectedProject?._id] = [session?.user.id];
      }
      return updated;
    });

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "POST" });
      // console.log(session?.user.id);
      // console.log(id);

      if (res.ok) {
        const updatedProject = await res.json(); // Get the updated project from the response
        // console.log(updatedProject);
        const userId = session?.user.id;
        const receiversId = [
          updatedProject.project.projectAssignedTo.supervisorId,
        ];
        const projectId = updatedProject.project._id;
        const type = "ApplicationStudent";
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
        setProjects((prevProjects) => {
          const updatedProjects = prevProjects.map((project) =>
            project._id === id
              ? {
                  ...project,
                  applicants: updatedProject.project.applicants, // Update the applicants list
                }
              : project
          );

          return updatedProjects;
        });

        if (selectedProject && selectedProject._id === id) {
          setSelectedProject((prev) => ({
            ...prev!,
            applicants: updatedProject.project.applicants, // Update the applicants in the selected project
          }));
        }
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to apply for the project");
      }
    } catch (error) {
      console.error("Error applying for project:", error);
    }
  };

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6 justify-between space-x-4">
        {/* Left side: Search Bar */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Projects..."
          className="w-96 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-600 transition duration-200 ease-in-out"
        />

        {/* Right side: Filter and Create Project Button */}
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-600 transition duration-200 ease-in-out"
          >
            <option value="All">All Projects</option>
            <option value="Open">Open Projects</option>
            <option value="Closed">Closed Projects</option>
          </select>

          {session && (
            <Link
              href={`/pages/create-project`}
              className="bg-lime-600 text-white px-6 py-3 rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out"
            >
              Create New Project
            </Link>
          )}
        </div>
      </div>

      {loading && <p>Loading...</p>}

      <div className="flex gap-8">
        {/* Project List */}
        <div className="w-1/3 overflow-y-auto h-screen">
          <div className="grid grid-cols-1 gap-y-8 my-9">
            {!loading &&
              projects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 flex items-center justify-between"
                  onClick={() => handleCardClick(project)}
                >
                  <div>
                    <h2 className="text-xl font-semibold text-lime-600">
                      {project.title}
                    </h2>

                    <p className="text-black">
                      <strong>Supervised By:</strong>{" "}
                      {project.projectAssignedTo.supervisorId?.name ||
                        "Not Assigned"}
                    </p>
                  </div>

                  {/* Badge section */}
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        project.status
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {project.status ? "Open" : "Closed"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Selected Project Details */}
        <div className="w-2/3 p-6 bg-white rounded-lg shadow-lg h-screen overflow-y-auto">
          {selectedProject ? (
            <>
              <h2 className="text-2xl font-semibold text-lime-600">
                {selectedProject.title}
              </h2>
              <div className="author mb-5 text-lg">
                <strong>Author:</strong>{" "}
                {selectedProject.projectAssignedTo?.authorId?.name ||
                  "Not assigned"}
              </div>

              <div className="assignments flex justify-between items-center gap-5">
                <div className="assignment-item flex flex-col">
                  <strong>Supervisor:</strong>{" "}
                  {selectedProject.projectAssignedTo?.supervisorId?.name ||
                    "Not assigned"}
                </div>
                <div className="assignment-item flex flex-col">
                  <strong>Second Reader:</strong>{" "}
                  {selectedProject.projectAssignedTo?.secondReaderId?.name ||
                    "Not assigned"}
                </div>
                <div className="assignment-item flex flex-col">
                  <div className="flex">
                    <strong>Students:</strong>{" "}
                    {session?.user.role === "Lecturer" &&
                      session?.user.id ===
                        selectedProject.projectAssignedTo.authorId._id && (
                        <button
                          // onClick={() => setAssignShowModal(true)}
                          className="px-3 "
                        >
                          ✏️
                        </button>
                      )}
                  </div>

                  {selectedProject.projectAssignedTo?.studentsId?.length > 0
                    ? selectedProject.projectAssignedTo.studentsId
                        .map((student: any) => student.name)
                        .join(", ")
                    : "No students assigned"}
                </div>
              </div>

              {session?.user.role == "Student" &&
                session?.user.id !==
                  selectedProject.projectAssignedTo.authorId._id &&
                selectedProject.status == true &&
                selectedProject.visibility !== "Private" && (
                  <button
                    onClick={() => handleApply(selectedProject?._id)}
                    className={`px-4 py-2 rounded-lg ${
                      selectedProject.applicants.some(
                        (applicant) =>
                          applicant.studentId?._id === session.user.id
                      ) ||
                      appliedStudents[selectedProject._id]?.includes(
                        session.user.id
                      )
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-lime-600 text-white hover:bg-lime-700"
                    }`}
                    disabled={
                      selectedProject.applicants.some(
                        (applicant) =>
                          applicant.studentId?._id === session.user.id
                      ) ||
                      appliedStudents[selectedProject._id]?.includes(
                        session.user.id
                      )
                    } // Check if the user ID is in that array
                  >
                    {selectedProject.applicants.some(
                      (applicant) =>
                        applicant.studentId?._id === session.user.id
                    ) ||
                    appliedStudents[selectedProject._id]?.includes(
                      session.user.id
                    )
                      ? "Applied"
                      : "Apply"}
                  </button>
                )}

              <p>
                <strong>Visibility:</strong> {selectedProject.visibility}
              </p>

              <p>
                <strong>Status:</strong>
                {(() => {
                  if (selectedProject.status === false) {
                    return "Closed";
                  } else {
                    return "Open";
                  }
                })()}
              </p>

              <div className="flex gap-4 mr-0 mt-3 mb-3">
                {session &&
                  selectedProject.projectAssignedTo.authorId._id ===
                    session.user.id && (
                    <>
                      <Link
                        href={`/pages/update-project/${selectedProject._id}`}
                        className="bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => confirmDelete(selectedProject._id)}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200 ease-in-out"
                      >
                        🗑️ Delete
                      </button>
                    </>
                  )}
              </div>

              <p>
                <strong>Description:</strong>{" "}
                {selectedProject.description || "No description"}
              </p>

              
            </>
          ) : (
            <p className="text-gray-500">
              Select a project to view more details.
            </p>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-center text-gray-700 mb-6">
              Are you sure you want to delete this project?
            </p>
            <div className="flex justify-between">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (projectToDelete) handleDelete(projectToDelete);
                }}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200 ease-in-out"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

{showMessageModal && (
  <div className="modal fixed w-full inset-0 flex justify-center items-center bg-black bg-opacity-50 ">
    <div className="modal-content bg-white p-8 rounded-2xl w-96 max-w-full shadow-lg">
      <h2 className="text-1xl font-semibold text-gray-800 mb-4">Send a message to {selectedProject?.projectAssignedTo.supervisorId.name}:</h2>
      <textarea
        className="w-full h-36 p-4 border border-gray-300 rounded-md text-md focus:outline-none focus:ring-2 focus:ring-lime-500 resize-none"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message"
      />
      <div className="mt-6 flex justify-end space-x-4">
        <button
          className="bg-lime-600 text-white px-6 py-3 rounded-md font-medium focus:bg-lime-500"
          onClick={() => handleModalSubmit(selectedProject?._id)}
        >
          Submit
        </button>
        <button
          className="bg-red-600 text-white px-6 py-3 rounded-md font-medium  focus:bg-red-500"
          onClick={() => setShowMessageModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ProjectsPage;
