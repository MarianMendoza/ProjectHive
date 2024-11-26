"use client";

import { useSession } from "next-auth/react";
import StudentDashboard from "@/components/StudentDashboard";
import LecturerDashboard from "@/components/LecturerDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import PageNotFound from "@/components/PageNotFound";

import { useEffect, useState } from "react";
import { Project } from "@/types/projects";

const Dashboard = () => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("../api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
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

  if (!session) {
    return <PageNotFound />;
  }
  const role = session.user.role;

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <p>Loading projects...</p>
      ) : (
        <div className="overflow-y-auto max-h-[500px]">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-2 font-semibold">Title</th>
                <th className="text-left px-4 py-2 font-semibold">Description</th>
                <th className="text-left px-4 py-2 font-semibold">Created At</th>
                <th className="text-left px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project._id} className="border-b">
                    <td className="px-4 py-2">{project.title}</td>
                    <td className="px-4 py-2">{project.description}</td>
                    <td className="px-4 py-2">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out">
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-center">
                    No projects available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
