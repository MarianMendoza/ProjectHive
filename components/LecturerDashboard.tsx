"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Project } from "@/types/projects";
import NotificationStack from "./NotificationStack";

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

            const filteredProjects = data.filter((project: Project) => {
              if (project.visibility === "Private") {
                return (
                  project.projectAssignedTo.authorId?._id === session?.user.id
                );
              }
              return true;
            });

            setProjects(filteredProjects);
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

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === id ? { ...notif, read: true } : notif
          )
        );
      } else {
        console.error("Error marking notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

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
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <h2 className="text-3xl font-bold leading-9 tracking-tight text-gray-900 col-span-3">
        Welcome to Your Dashboard!
      </h2>
      {isApproved ? (
        <>
          {/* Notifications and Project Progress Section - Positioned at the top */}
          <div className="flex justify-between mb-6 col-span-3">
            {/* Project Progress Section (65%) */}
            <div className="w-2/3 mr-10 bg-white p-6 ">
              <div className="space-y-4">
                <p className="text-m">
                  <strong>Project:</strong> {selectedProject?.title}
                </p>
                <div className="w-full bg-gray-200 rounded-full">
                  <div
                    className="bg-lime-600 text-xs font-medium text-center text-white p-1 leading-none rounded-l-full"
                    style={{
                      width: "70%", // Adjust this based on actual project progress
                    }}
                  >
                    70% Progress
                  </div>
                </div>
                <button className="bg-lime-500 text-white px-4 py-2 rounded-lg hover:bg-lime-600 mt-4">
                  View Deliverables
                </button>
              </div>
            </div>

            {/* Notifications Section (35%) */}
            <div className="w-1/3 bg-white p-6 rounded-lg shadow-md">
            <NotificationStack userId={session?.user.id||""}>
              
            </NotificationStack>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Notifications
              </h3>
              {loadingNotifications ? (
                <p>Loading notifications...</p>
              ) : notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 rounded-lg shadow-md ${
                        notification.read
                          ? "bg-gray-100 text-gray-500"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{notification.message}</span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-blue-500 hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No new notifications</p>
              )}
            </div>
          </div>

          {/* Create New Project Button - Positioned to the right of "Your Projects" */}
          <div className="col-span-3 flex justify-between items-center ">
            <h3 className="text-xl font-bold text-gray-800">Your Projects</h3>
            <Link
              href="/pages/create-project"
              className="bg-lime-600 text-white px-6 py-3 rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out"
            >
              Create New Project
            </Link>
          </div>

          {/* Your Projects Section - Positioned below the progress and notifications */}
          <div className="bg-white p-6 rounded-lg col-span-3">
            {loadingProjects ? (
              <p>Loading projects...</p>
            ) : projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    className=" p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer"
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
        </>
      ) : (
        <h2 className="text-2xl font-bold leading-9 tracking-tight text-red-600">
          Waiting for admin approval. Please check back later.
        </h2>
      )}
    </div>
  );
}
