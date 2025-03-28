"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import Link from "next/link";

export default function CreateProjectPage() {
  const { data: session } = useSession();

  const router = useRouter();
  const [programme, setProgrammes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    status: false,
    programme: "",
    visibility: "Private",
    abstract: "",
    description: "",
    files: "",
  });
  const [error, setError] = useState<string | null>(null);

  const fetchProgrammes = async () => {
    try {
      const res = await fetch("/api/programmes");
      const data = await res.json();
      console.log(data);
        const programmeName = data.map((programme: { name: string }) => programme.name);
        setProgrammes(programmeName);
  
    } catch (error) {
      console.error("Error fetching tags", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProgrammes();
    }
  }, [session]);

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
      const response = await fetch("/api/projects", {
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

        {error && <div className="text-center py-4 text-red-600">{error}</div>}

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
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="true">Open</option>
              <option value="false">Closed</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="programme"
              className="block text-gray-700 font-medium mb-2"
            >
              Programme
            </label>
            <select
              id="programme"
              name="programme"
              value={formData.programme.toString()}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="">Select a course</option>
              {programme.map((c, index) => (
                <option key={index} value={c}>
                  {c}
                </option>
              ))}
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
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="Private">Private</option>
              <option value="Public">Public</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="abstract"
              className="block text-gray-700 font-medium mb-2"
            >
              Abstract
            </label>
            <textarea
              id="abstract"
              name="abstract"
              maxLength={500}
              value={formData.abstract}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={4}
              required
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {formData.abstract.length}/500 characters
            </div>
            <label
              htmlFor="description"
              className="block text-gray-700 font-medium mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              maxLength={1000}
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={4}
              required
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {formData.description.length}/1000 characters
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/pages/projects"
              className="bg-red-600 text-white px-6 py-2 rounded-lg mx-7 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

