'use client';
import { useEffect, useState } from 'react';
import { Project } from '../../../types/projects'; // TypeScript interface for the project
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const ProjectsPage = () => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [newProject, setNewProject] = useState<Project>({
    title: '',
    description: '',
    status: 'Available',
    visibility: 'Public',
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // Track selected project

  // Fetch projects from the backend on page load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('../api/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data); // Store the fetched data in the state
        } else {
          console.error('Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
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
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Project deleted successfully!');
        setProjects((prevProjects) => prevProjects.filter((project) => project._id !== id)); // Remove the deleted project from the state
      } else {
        console.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  // Handle create project functionality
  const handleCreateProject = async () => {
    const response = await fetch('../api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProject),
    });

    if (response.ok) {
      const createdProject = await response.json();
      setProjects((prevProjects) => [...prevProjects, createdProject]); // Add the new project to the list
      setModalOpen(false); // Close the modal after successful creation
    } else {
      console.error('Failed to create project');
    }
  };

  const handleUpdateProject = async (id: string) => {
    const response = await fetch(`../api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProject), // Send the updated project data
    });

    if (response.ok) {
      const updatedProject = await response.json();
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project._id === id ? updatedProject.project : project
        )
      ); // Update the project in the state
      setModalOpen(false); // Close modal after successful update
    } else {
      console.error('Failed to update project');
    }
  };

  // Handle input change for project form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleModal = () => setModalOpen(!isModalOpen);

  const handleCardClick = (project: Project) => {
    setSelectedProject(project); // Set the selected project to display detailed info
  };

  // Render loading state or project cards
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Projects</h1>

      {session && (
        <button
          onClick={toggleModal}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md mb-4"
        >
          Create New Project
        </button>
      )}

      {/* Loading indicator */}
      {loading && <p className="text-gray-500">Loading projects...</p>}

      {/* Main layout with left for cards, right for detailed view */}
      <div className="flex gap-4">
        {/* Left column for project cards, scrollable and with gap between cards */}
        <div className="w-1/3 overflow-y-auto h-screen"> {/* Keep left cards within the page height */}
          <div className="grid grid-cols-1 gap-y-6 my-6"> {/* Added vertical gap */}
            {!loading && (
              <div>
                {projects.map((project) => (
                  <div
                    key={project._id}
                    className="bg-white p-6 rounded-lg shadow-md my-5 cursor-pointer w-full p-2"
                    onClick={() => handleCardClick(project)} // Handle click to select project
                  >
                    <h2 className="text-xl font-semibold">{project.title}</h2>
                    <p>
                      <strong>Status:</strong> {project.status}
                    </p>
                    <p>
                      <strong>Visibility:</strong> {project.visibility}
                    </p>
                    <p>
                      <strong>Description:</strong> {project.description || 'No description'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column for selected project details, fixed height, white background with subtle box shadow */}
        <div className="w-2/3 p-4 bg-white rounded-lg shadow-md h-screen overflow-y-auto"> {/* White background and subtle box shadow */}
          {selectedProject ? (
            <>
              <h2 className="text-2xl font-semibold">{selectedProject.title}</h2>
              <p><strong>Status:</strong> {selectedProject.status}</p>
              <p><strong>Visibility:</strong> {selectedProject.visibility}</p>
              <p><strong>Description:</strong> {selectedProject.description || 'No description'}</p>
              <div className="mt-4 flex justify-between">
                {session && (
                  <>
                    <Link
                      href={`/update-project/${selectedProject._id}`}
                      className="bg-green-500 text-white px-4 py-2 rounded-md"
                    >
                      Update
                    </Link>
                    <button
                      onClick={() => handleDelete(selectedProject._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md"
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

      {/* Modal for Creating New Project */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">Create Project</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateProject();
              }}
            >
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={newProject.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  id="description"
                  value={newProject.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <input
                  type="text"
                  name="status"
                  id="status"
                  value={newProject.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">Visibility</label>
                <input
                  type="text"
                  name="visibility"
                  id="visibility"
                  value={newProject.visibility}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={toggleModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
