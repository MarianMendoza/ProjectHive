"use client";
import { useEffect, useState } from "react";
import { Project } from "../../../types/projects";
import Link from "next/link";
import { useSession } from "next-auth/react";

const ProjectsPage = () => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("../api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          setSelectedProject(data[0]); // Always get the first item in the list
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
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`../api/projects/${id}`, { method: "DELETE" });

      if (res.ok) {
        setProjects((prevProjects) =>
          prevProjects.filter((project) => project._id !== id)
        );
        setShowModal(false);
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

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6 space-x-4">
        {session && (
          <Link
            href={`/pages/create-project`}
            className="bg-lime-600 text-white px-6 py-3 rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out"
          >
            Create New Project
          </Link>
        )}

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Projects..."
          className="w-96 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-600 transition duration-200 ease-in-out"
        />
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
                  className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-200"
                  onClick={() => handleCardClick(project)}
                >
                  <h2 className="text-xl font-semibold text-lime-600">
                    {project.title}
                  </h2>
                  <p className="text-black">
                    <strong>Status:</strong> {project.status}
                  </p>
                  <p className="text-black">
                    <strong>Visibility:</strong> {project.visibility}
                  </p>
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
              <p>
                <strong>Status:</strong> {selectedProject.status}
              </p>
              <p>
                <strong>Visibility:</strong> {selectedProject.visibility}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedProject.description || "No description"}
              </p>
              <p>
                <strong>Author:</strong>{" "}
                {selectedProject.projectAssignedTo?.authorId || "Not assigned"}
              </p>
              <p>
                <strong>Supervisor:</strong>{" "}
                {selectedProject.projectAssignedTo?.supervisorId || "Not assigned"}
              </p>
              <p>
                <strong>Second Reader:</strong>{" "}
                {selectedProject.projectAssignedTo?.secondReaderId ||
                  "Not assigned"}
              </p>
              <p>
                <strong>Students:</strong>{" "}
                {selectedProject.projectAssignedTo?.studentsId?.length > 0
                  ? selectedProject.projectAssignedTo.studentsId.join(", ")
                  : "No students assigned"}
              </p>
              <div className="mt-6 flex gap-4">
                {session && (
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
            </>
          ) : (
            <p className="text-gray-500">Select a project to view more details.</p>
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
    </div>
  );
};

export default ProjectsPage;
