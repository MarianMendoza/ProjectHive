"use client"
import { useState, useEffect } from "react";

interface Project {
  _id: string;
  title: string;
  status: "Available" | "Unavailable" | "Archived";
  visibility: "Private" | "Public";
  description: string;
  files?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Project>({
    _id: "",
    title: "",
    status: "Available",
    visibility: "Private",
    description: "",
    files: "",
    createdAt: "",
    updatedAt: "",
  });

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      const response = await fetch("../api/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = formData._id ? "PUT" : "POST";
      const url = formData._id ? `/api/projects/${formData._id}` : "/api/projects";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchProjects();
        setIsModalOpen(false);
        setFormData({ _id: "", title: "", status: "Available", visibility: "Private", description: "", files: "", createdAt: "", updatedAt: "" });
      } else {
        console.error("Error submitting project:", response.statusText);
      }
    } catch (error) {
      console.error("Error submitting project:", error);
    }
  };

  // Handle Edit button
  const handleEdit = async (id: string) => {
    try {
      const response = await fetch(`../api/projects/${id}`);
      const project = await response.json();
      setFormData(project);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching project for edit:", error);
    }
  };

  // Handle Delete button
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`../api/projects/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchProjects();
      } else {
        console.error("Error deleting project:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  // Fetch projects on load
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <button
        className="bg-lime-600  text-white px-4 py-2 rounded mb-4"
        onClick={() => setIsModalOpen(true)}
      >
        Create Project
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project._id} className="bg-white shadow-md rounded p-4">
            <h2 className="text-lg font-bold">{project.title}</h2>
            <p>Status: {project.status}</p>
            <p>Visibility: {project.visibility}</p>
            <p>Description: {project.description}</p>
            <div className="flex justify-between mt-4">
              <button
                className="bg-yellow-500 text-white px-2 py-1 rounded"
                onClick={() => handleEdit(project._id)}
              >
                Edit
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => handleDelete(project._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">
              {formData._id ? "Edit Project" : "Create Project"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" htmlFor="visibility">
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="Private">Private</option>
                  <option value="Public">Public</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  {formData._id ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
