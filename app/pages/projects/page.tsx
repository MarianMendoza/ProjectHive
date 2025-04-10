"use client";
import { useEffect, useState } from "react";
import { Project } from "@/types/projects";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSocket } from "@/app/provider";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { User } from "@/types/users";
import { createNotification } from "@/app/utils/notificationUtils";

const ProjectsPage = () => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [programmeFilter, setProgrammeFilter] = useState<string>("All");
  const [programme, setProgrammes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showConfirmModal, setshowConfirmModal] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [appliedStudents, setAppliedStudents] = useState<{
    [projectId: string]: string[];
  }>({});

  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const socket = useSocket();
  console.log(session?.user.assigned)

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        const res = await fetch("/api/programmes");
        const data = await res.json();
        console.log(data);
        const programmeName = data.map(
          (programme: { name: string }) => programme.name
        );
        setProgrammes(programmeName);
      } catch (error) {
        console.error("Error fetching tags", error);
      }
    };

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

            const matchesProgramme =
              programmeFilter === "All" ||
              project.programme === programmeFilter;

            return (
              matchesSearchQuery && matchesStatusFilter && matchesProgramme
            );
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
    fetchProgrammes();
    fetchProjects();
  }, [session, searchQuery, statusFilter, programmeFilter]); // Dependency array to re-run effect on searchQuery or statusFilter change
  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true); // Open modal on mobile
  };
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
    setshowConfirmModal(true);
  };

  const handleConfirmModal = async (id: string) => {
    setshowConfirmModal(false);

    // Check if `selectedProject` exists and handle `session` safely
    if (!session?.user?.id || !selectedProject?._id) {
      console.error("Invalid session or selected project data.");
      return;
    }

    // Update applied students state
    setAppliedStudents((prev) => {
      const updated = { ...prev };
      const projectId = selectedProject?._id;

      if (projectId) {
        // If the project already has applicants, add the student to the list
        updated[projectId] = updated[projectId]
          ? [...updated[projectId], session.user.id]
          : [session.user.id];
      }

      return updated;
    });

    try {
      // Make the API call to update the project
      console.log("Hello World!");
      const res = await fetch(`/api/projects/${id}`, { method: "POST" });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Failed to apply for the project");
        return;
      } else {
        const updatedProject = await res.json();
        const userId = session.user.id;
        console.log(selectedProject.projectAssignedTo.supervisorId._id);
        const receiversId = [
          selectedProject.projectAssignedTo?.supervisorId._id,
        ];
        console.log(receiversId);
        const projectId = selectedProject._id;
        const type = "ApplicationStudent";
        const messageUser = message; // Assuming `message` is defined elsewhere in your code

        // Check if socket is available and emit the event
        console.log(socket);
        console.log("Hello");
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

        // Update the projects and selected project state
        setProjects((prevProjects) => {
          return prevProjects.map((project) =>
            project._id === id
              ? { ...project, applicants: selectedProject.applicants }
              : project
          );
        });

        if (selectedProject?._id === id) {
          setSelectedProject((prev) => ({
            ...prev!,
            applicants: selectedProject.applicants,
          }));
        }
      }
    } catch (error) {
      console.error("Error applying for project:", error);
    }
  };

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <>
      <div className="mb-6">
        <img
          src={"/iStock-1357672566.jpg"}
          alt="Student Dashboard Banner"
          className="w-full h-64 object-cover rounded-b-lg"
        />
      </div>
      <div className="container mx-auto p-2">
        <div className="bg-white flex justify-start w-full rounded-lg p-3 text-center">
          <h2 className="text-md font-semibold text-gray-800">
            Total Projects: {projects.length}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4">
          {/* Search Input */}
          <div className="w-full md:w-1/3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Projects..."
              className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 transition duration-200 ease-in-out"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 transition duration-200 ease-in-out"
              >
                <option value="All">All Projects</option>
                <option value="Open">Open Projects</option>
                <option value="Closed">Closed Projects</option>
              </select>
            </div>

            {/* More Filters and Create Button */}
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`text-white p-3 rounded-lg transition duration-200 ease-in-out w-full md:w-auto ${
                  showFilters
                    ? "bg-emerald-700 hover:bg-emerald-800"
                    : "bg-gray-700 hover:bg-gray-800"
                }`}
              >
                {showFilters ? "Hide Filters" : "More Filters"}
              </button>

              {session && (
                <Link
                  href="/pages/create-project"
                  className="text-center bg-teal-800 hover:bg-teal-900 text-white p-3 rounded-lg transition duration-200 ease-in-out w-full md:w-auto"
                >
                  Create New Project
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="w-full mt-3 bg-white md:mb-2 lg:mb-5">
          {showFilters && (
            <div className="p-2 flex flex-col md:flex-row gap-3 justify-between w-full">
              <h3 className="text-lg font-semibold md:w-1/3">Select Program</h3>
              <div className="flex flex-col md:flex-row md:w-2/3 gap-4">
                <label className="inline-flex items-center space-x-2">
                  <input
                    type="radio"
                    name="programmeFilter"
                    value="All"
                    checked={programmeFilter === "All"}
                    onChange={(e) => setProgrammeFilter(e.target.value)}
                    className="form-radio text-emerald-800"
                  />
                  <span>All Programs</span>
                </label>
                {programme.map((c, index) => (
                  <label
                    key={index}
                    className="inline-flex items-center space-x-2"
                  >
                    <input
                      type="radio"
                      name="programmeFilter"
                      value={c}
                      checked={programmeFilter === c}
                      onChange={(e) => setProgrammeFilter(e.target.value)}
                      className="form-radio text-emerald-800"
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && <p>Loading...</p>}

        <div className="flex flex-col-reverse md:flex-row gap-8">
          {/* Project List */}
          <div className="w-full md:w-1/3 overflow-y-auto h-screen">
            <div className="grid grid-cols-1 p-2 gap-y-8 my-9">
              {!loading &&
                projects.map((project) => (
                  <div
                    key={project._id}
                    className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200 flex items-center justify-between"
                    onClick={() => handleCardClick(project)}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2 text-sm space-x-2">
                        <span className="px-4 py-1 text-sm rounded-full bg-emerald-100 text-emerald-800">
                          {project.programme ? project.programme : "N/A"}
                        </span>

                        <span
                          className={`px-3 py-1 text-sm rounded-full ${
                            project.status
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {project.status ? "Open" : "Closed"}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-emerald-800">
                        {project.title}
                      </h2>

                      <p className="text-black">
                        <strong>Supervised By:</strong>{" "}
                        {project.projectAssignedTo.supervisorId?.name ||
                          "Not Assigned"}
                      </p>

                      <p className="text-black">
                        <strong>Abstract:</strong>
                        {` ${project.abstract.slice(0, 200)} ... ` ||
                          "No Description"}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Selected Project Details */}
          <div className="hidden lg:block w-full md:w-2/3 p-6 bg-white rounded-lg shadow-lg h-screen overflow-y-auto">
            {selectedProject ? (
              <>
                <h2 className="text-2xl font-semibold text-emerald-800">
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
                    <strong>Students:</strong>{" "}
                    {selectedProject.projectAssignedTo?.studentsId?.length > 0
                      ? selectedProject.projectAssignedTo.studentsId
                          .map((student: any) => student.name)
                          .join(", ")
                      : "No students assigned"}
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  {session?.user.role == "Student" &&
                    session?.user.id !==
                      selectedProject.projectAssignedTo.authorId._id &&
                    selectedProject.status == true &&
                    selectedProject.visibility !== "Private" &&  (
                      <button
                        onClick={() => handleApply(selectedProject?._id)}
                        className={`px-4 py-2 rounded-lg ${
                          selectedProject.applicants.some(
                            (applicant) =>
                              applicant.studentId?._id === session.user.id
                          ) ||
                          appliedStudents[selectedProject._id]?.includes(
                            session.user.id
                          ) || (session.user.assigned)
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-emerald-800 text-white hover:bg-emerald-900"
                        }`}
                        disabled={
                          selectedProject.applicants.some(
                            (applicant) =>
                              applicant.studentId?._id === session.user.id
                          ) ||
                          appliedStudents[selectedProject._id]?.includes(
                            session.user.id
                          ) || (session.user.assigned)
                        }
                      >
                        {selectedProject.applicants.some(
                          (applicant) =>
                            applicant.studentId?._id === session.user.id
                        ) ||
                        appliedStudents[selectedProject._id]?.includes(
                          session.user.id
                        ) || (session.user.assigned)
                          ? "Applied"
                          : "Apply"}
                      </button>
                    )}
                </div>

                <p>
                  <strong>Visibility:</strong> {selectedProject.visibility}
                </p>

                <p>
                  <strong>Program: </strong>
                  {selectedProject.programme
                    ? selectedProject.programme
                    : " N/A"}
                </p>

                <p>
                  <strong>Status:</strong>
                  {(() => {
                    if (selectedProject.status === false) {
                      return " Closed";
                    } else {
                      return " Open";
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
                          className="bg-emerald-700 text-white px-6 py-2 rounded-lg hover:bg-emerald-800 transition duration-200 ease-in-out"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => confirmDelete(selectedProject._id)}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 ease-in-out"
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
                </div>

                <p className="mb-5">
                  <strong>Abstract:</strong>{" "}
                  {selectedProject.abstract || "No description"}
                </p>

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

          <div className="md:hidden ">
            <div
              className={`fixed bottom-0 left-0 w-screen bg-white rounded-t-md border border-t-2 px-6 transition-all duration-500 ease-in-out ${
                showDetails
                  ? "transform translate-y-0"
                  : "transform translate-y-100"
              }`}
              style={{ zIndex: 9999 }}
            >
              {!showDetails && (
                <button
                  onClick={() => setShowDetails(!showDetails)} // Toggle the details visibility
                  className="text-black p-2 rounded-t-md bg-white border border-gray-100 left-0 w-screen fixed bottom-0 text-center flex items-center justify-center transition-all duration-300"
                >
                  <span
                    className="text-2xl text-gray-800"
                    aria-label="Expand More Project Details"
                  >
                    <FaArrowUp />
                  </span>
                </button>
              )}
              {showDetails && (
                <button
                  onClick={() => setShowDetails(!showDetails)} // Toggle the details visibility
                  className="bg-gray-100 text-white p-2 w-full rounded-md flex items-center justify-center text-center mt-2"
                >
                  <span
                    className="text-2xl text-gray-800"
                    aria-label="Collapse Project Details"
                  >
                    <FaArrowDown />
                  </span>
                </button>
              )}

              {showDetails && selectedProject && (
                <div className="p-6 mt-4 max-h-[80vh] overflow-y-auto transition-all duration-300">
                  <h2 className="text-2xl font-semibold text-emerald-800">
                    {selectedProject.title || "No Project Selected"}
                  </h2>

                  <div className="overflow-y-scroll mt-4">
                    <p className="text-lg">
                      <strong>Author:</strong>{" "}
                      {selectedProject.projectAssignedTo?.authorId?.name ||
                        "Not assigned"}
                    </p>
                    <p className="text-lg">
                      <strong>Supervisor</strong>{" "}
                      {selectedProject.projectAssignedTo?.supervisorId?.name ||
                        "Not assigned"}
                    </p>
                    <p className="text-lg">
                      <strong>Second Reader:</strong>{" "}
                      {selectedProject.projectAssignedTo?.secondReaderId
                        ?.name || "Not assigned"}
                    </p>
                    <p className="text-lg">
                      <strong>Students:</strong>
                      {""}
                      {selectedProject.projectAssignedTo?.studentsId?.length > 0
                        ? selectedProject.projectAssignedTo.studentsId
                            .map((student: any) => student.name)
                            .join(", ")
                        : "No Student Assigned"}
                    </p>
                    <p className="text-lg">
                      <strong>Status:</strong>{" "}
                      {selectedProject.status ? "Open" : "Closed"}
                    </p>
                    <p className="text-lg">
                      <strong>Program:</strong>{" "}
                      {selectedProject.programme || "N/A"}
                    </p>
                    <p>
                      <strong>Abstract:</strong>{" "}
                      {selectedProject.abstract || "No description"}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedProject.description || "No description"}
                    </p>
                    <div className="flex flex-row mt-4 gap-4">
                      {session?.user.role === "Student" &&
                        selectedProject.status === true &&
                        selectedProject.visibility !== "Private" && (
                          <button
                            onClick={() => handleApply(selectedProject._id)}
                            className="bg-emerald-800 text-white p-2 rounded-md w-full"
                          >
                            Apply
                          </button>
                        )}

                      {session &&
                        selectedProject.projectAssignedTo.authorId._id ===
                          session.user.id && (
                          <>
                            <button className="bg-emerald-700 text-white w-full p-2 rounded-lg hover:bg-emerald-800 transition duration-200 ease-in-out">
                              <Link
                                href={`/pages/update-project/${selectedProject._id}`}
                              >
                                ✏️ Edit
                              </Link>
                            </button>

                            <button
                              onClick={() => confirmDelete(selectedProject._id)}
                              className="bg-red-600 text-white p-2 w-full rounded-lg hover:bg-red-700 transition duration-200 ease-in-out"
                            >
                              🗑️ Delete
                            </button>
                          </>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200 ease-in-out"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirmModal && (
          <div className="modal fixed w-full inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="modal-content bg-white p-8 rounded-2xl w-96 max-w-full shadow-lg">
              <h2 className="text-1xl font-semibold text-gray-800 mb-4">
                Send a message to{" "}
                {selectedProject?.projectAssignedTo.supervisorId.name}:
              </h2>
              <textarea
                className="w-full h-36 p-4 border border-gray-300 rounded-md text-md focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
              />
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  className="bg-red-600 text-white px-6 py-3 rounded-md font-medium focus:bg-red-700"
                  onClick={() => setshowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-emerald-700 text-white px-6 py-3 rounded-md font-medium focus:bg-emerald-500"
                  onClick={() => handleConfirmModal(selectedProject?._id)}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectsPage;
