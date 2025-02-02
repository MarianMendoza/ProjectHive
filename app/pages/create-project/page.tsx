"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CreateProjectPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    status: false,
    visibility: "Private",
    description: "",
    files: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name == "status" ? e.target.value === "true" : e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("../../api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/pages/projects");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error creating project");
    }
  };

  return (
    <div className="container mx-auto p-10 flex items-center justify-center ">
      <div className="w-full">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Create New Project
        </h1>

        {error && <div className="text-center py-4 text-red-500">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 font-medium mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="status"
              className="block text-gray-700 font-medium mb-2"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status.toString()}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="visibility"
              className="block text-gray-700 font-medium mb-2"
            >
              Visibility
            </label>
            <select
              id="visibility"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Private">Private</option>
              <option value="Public">Public</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {formData.description.length}/1000 characters
            </div>
          </div>

          <div className="w-full p-4 mb-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-lime-600 text-center">
              <label
                htmlFor="files"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="flex flex-col items-center mb-2">
                  <span role="img" aria-label="file" className="text-2xl">
                    📁
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  Drag & drop files here or{" "}
                  <span className="text-lime-600 font-semibold">browse</span>
                </span>
              </label>
              <input
                type="file"
                id="files"
                name="files"
                multiple
                onChange={handleChange}
                className="hidden"
              />
            </div>

          <div className="flex justify-end">
            <Link
              href="/pages/projects"
              className="bg-lime-600 text-white px-6 py-2 rounded-lg mx-7 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;
