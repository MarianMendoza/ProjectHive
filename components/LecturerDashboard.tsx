"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Project } from "@/types/projects";
import Notification from "./Notifications";

export default function LecturerDashboard() {
  const { data: session, status } = useSession(); // Get session data
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchApprovalStatus = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const response = await fetch(`../../api/users/${session.user.id}`);
          const data = await response.json();

          if (response.ok) {
            setIsApproved(data.user.approved); // Assumes API response has an `approved` field
          } else {
            console.error("Error fetching approval status:", data.message);
            setIsApproved(false); // Default to false on error
          }
        } catch (error) {
          console.error("Error fetching approval status:", error);
          setIsApproved(false); // Default to false on fetch error
        }
      }
    };

    fetchApprovalStatus();
  }, [session, status]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const res = await fetch(`/api/notifications/${session.user.id}`);
          const data = await res.json();

          if (res.ok) {
            setNotifications(data.notifications);
          } else {
            console.error("Error fetching notifications:", data.message);
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
      setLoadingNotifications(false);
    };

    fetchNotifications();
  }, [session, status]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const res = await fetch("../api/projects");

          if (res.ok) {
            const data = await res.json();

            // Filter the projects to get only those assigned to the lecturer
            const filteredProjects = data.filter((project: Project) => {
              if (project.projectAssignedTo.authorId._id === session.user.id) {
                return true;
              }
            });

            // Ensure the first project is always the first in the list (sort if necessary)
            const sortedProjects = filteredProjects.sort(
              (a: Project, b: Project) => {
                return a.createdAt > b.createdAt ? 1 : -1; // Adjust sorting criteria as needed
              }
            );

            setProjects(sortedProjects);
          } else {
            console.error("Error fetching projects");
          }
        } catch (error) {
          console.error("Error fetching projects");
        }
      }
      setLoadingProjects(false);
    };

    fetchProjects();
  }, [session, status]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`../api/projects/${id}`, { method: "DELETE" });

      if (res.ok) {
        setProjects((prevProjects) => {
          const updatedProjects = prevProjects.filter(
            (project) => project._id !== id
          );
          return updatedProjects;
        });
      } else {
        console.error("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-red-600">
        You are not logged in. Please sign in to access your dashboard.
      </h2>
    );
  }

  if (isApproved === null) {
    return (
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Verifying your account status...
      </h2>
    );
  }

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <h2 className="text-3xl font-bold leading-9 tracking-tight text-gray-900 col-span-3">
        Welcome to Your Dashboard!
      </h2>
      {isApproved ? (
        <>
          {/* Notifications and Project Progress Section - Positioned at the top */}
          <div className="flex justify-between mb-6 col-span-3">
            {/* Project Progress Section (65%) */}
            <div className="w-2/3 bg-white p-6">
              <div className="col-span-3 flex justify-between items-center ">
                <h3 className="text-xl font-bold text-gray-800">
                  Your Projects
                </h3>
                <Link
                  href="/pages/create-project"
                  className="bg-lime-600 text-white px-6 py-3 rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out"
                >
                  Create New Project
                </Link>
              </div>

              {/* Your Projects Section - Positioned below the progress and notifications */}
              <div className="bg-white w-auto m-6 rounded-lg col-span-3">
                {loadingProjects ? (
                  <p>Loading projects...</p>
                ) : projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <div
                        key={project._id}
                        className="p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div className="flex justify-between">
                          <h4 className="text-lg font-semibold text-lime-600">
                            {project.title}
                          </h4>

                          {/* Edit and Delete buttons next to the title */}
                          <div className="flex space-x-4">
                            <Link
                              href={`/pages/update-project/${project._id}`}
                              className="bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out"
                            >
                              ✏️ Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(project._id)}
                              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200 ease-in-out"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No projects found.</p>
                )}
              </div>
            </div>
            <div className="w-1/3 max-h-max">
              <Notification></Notification>
            </div>
          </div>

        </>
      ) : (
        <h2 className="text-2xl font-bold leading-9 tracking-tight text-red-600">
          Waiting for admin approval. Please check back later.
        </h2>
      )}
    </div>
  );
}
