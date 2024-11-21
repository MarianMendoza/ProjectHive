"use client";
import { useEffect, useState } from "react";
import { Project } from "../../../types/projects"; // TypeScript interface for the project
import Link from "next/link";
import { useSession } from "next-auth/react";

const ProjectsPage = () => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // Track selected project
  const [showModal, setShowModal] = useState<boolean>(false); // State to control modal visibility
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null); // Track project to delete

  // Fetch projects from the backend on page load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("../api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data); // Store the fetched data in the state
        } else {
          console.error("Failed to fetch projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false); // Stop the loading indicator
      }
    };

    fetchProjects();
  }, []);

  // Handle delete functionality
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`../api/projects/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // alert("Project deleted successfully!");
        setProjects((prevProjects) => prevProjects.filter((project) => project._id !== id)); // Remove the deleted project from the state
        setShowModal(false); // Close the modal
      } else {
        console.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Open modal for deletion confirmation
  const confirmDelete = (id: string) => {
    setProjectToDelete(id);
    setShowModal(true);
  };

  // Handle closing the modal without deleting
  const closeModal = () => {
    setShowModal(false);
    setProjectToDelete(null);
  };

  const handleCardClick = (project: Project) => {
    setSelectedProject(project); // Set the selected project to display detailed info
  };

  // Render loading state or project cards
  return (
    <div className="container mx-auto p-4">

      <div className="flex items-center mb-6 space-x-4">
        {/* Create New Project Button */}
        {session && (
          <Link
            href={`/pages/create-project`}
            className="bg-lime-600 text-white px-6 py-3 rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out float-left"
          >
            Create New Project
          </Link>
        )}

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Projects..."
          className="w-96 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-600 transition duration-200 ease-in-out"
        />

        {/* Filter Button */}
        <button className="bg-gray-200 text-black px-6 py-3 rounded-lg hover:bg-gray-300 transition duration-200 ease-in-out ml-auto">
          Filter
        </button>
      </div>

      {/* Loading indicator */}
      {loading && <p className="text-gray-500 text-center">Loading projects...</p>}

      {/* Main layout with left for cards, right for detailed view */}
      <div className="flex gap-8">
        {/* Left column for project cards, scrollable and with gap between cards */}
        <div className="w-1/3 overflow-y-auto h-screen scrollbar-left"> {/* Custom scrollbar on the left */}
          <div className="grid grid-cols-1 gap-y-8 my-9"> {/* Added vertical gap */}
            {!loading && (
              <div>
                {projects.map((project) => (
                  <div
                    key={project._id}
                    className="bg-white p-6 rounded-lg shadow-lg my-4 cursor-pointer w-full transition-all duration-200 ease-in-out"
                    onClick={() => handleCardClick(project)} // Handle click to select project
                  >
                    <h2 className="text-xl font-semibold text-lime-600">{project.title}</h2>
                    <p className="text-black">
                      <strong>Status:</strong> {project.status}
                    </p>
                    <p className="text-black">
                      <strong>Visibility:</strong> {project.visibility}
                    </p>
                    <p className="text-black">
                      <strong>Description:</strong> {project.description || "No description"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column for selected project details, fixed height, white background with subtle box shadow */}
        <div className="w-2/3 p-6 bg-white rounded-lg shadow-lg h-screen overflow-y-auto"> {/* White background and subtle box shadow */}
          {selectedProject ? (
            <>
              <h2 className="text-2xl font-semibold text-lime-600">{selectedProject.title}</h2>
              <p><strong>Status:</strong> {selectedProject.status}</p>
              <p><strong>Visibility:</strong> {selectedProject.visibility}</p>
              <p><strong>Description:</strong> {selectedProject.description || "No description"}</p>
              <div className="mt-6 flex justify-between">
                {session && (
                  <>
                    <Link
                      href={`/pages/update-project/${selectedProject._id}`}
                      className="bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => confirmDelete(selectedProject._id)} // Open modal on delete
                      className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200 ease-in-out"
                    >
                      Delete
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

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">Confirm Deletion</h2>
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
