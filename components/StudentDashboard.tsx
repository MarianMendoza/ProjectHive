"use client";
import { useEffect, useState } from "react";
import { Project } from "@/types/projects";
import { useSession } from "next-auth/react";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [assignedProject, setAssignedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [deliverables, setDeliverables] = useState({
    outlineDocument: "",
    extendedAbstract: "",
    finalProjectReport: "",
    deadline: "",
  });
  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!session?.user?.id) {
        console.log("Session user ID is not available.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("../api/projects");
        if (res.ok) {
          const data = await res.json();

          const appliedProjects = data.filter((project: Project) =>
            project.applicants.some(
              (applicant) => applicant.studentId._id.toString() === session.user.id
            )
          );

          setProjects(appliedProjects);

          const assignedProject = appliedProjects.find((project: Project) =>
            project.projectAssignedTo.studentsId.some(
              (student) => student._id.toString() === session.user.id
            )
          );

          setAssignedProject(assignedProject || null);

          if (assignedProject) {
            // Fetch deliverables from database
            const deliverablesRes = await fetch(`../api/deliverables/${session.user.id}`);
            const deliverablesData = await deliverablesRes.json();

            if (deliverablesRes.ok) {
              setDeliverables(deliverablesData);
            } else {
              console.log("No deliverables found.");
            }

            // Fetch notifications
            const notificationsRes = await fetch(`../api/notifications/${session.user.id}`);
            const notificationsData = await notificationsRes.json();

            if (notificationsRes.ok) {
              setNotifications(notificationsData.notifications);
            } else {
              console.log("No notifications found.");
            }
          }
        } else {
          console.error("Failed to fetch projects.");
        }
      } catch (error) {
        console.error("Error fetching projects", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [session?.user?.id]);

  const handleCreateProject = async () => {
    const title = prompt("Enter project title:");
    const description = prompt("Enter project description:");

    if (title && description && session?.user?.id) {
      try {
        const res = await fetch("../api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            projectAssignedTo: {
              authorId: session.user.id,
              studentsId: [session.user.id],
            },
            applicants: [],
          }),
        });

        if (res.ok) {
          alert("Project created successfully.");
          window.location.reload();
        } else {
          alert("Failed to create project.");
        }
      } catch (error) {
        console.error("Error creating project", error);
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Welcome to Your Dashboard
        </h2>

        {assignedProject ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Assigned Project</h3>
            <p className="text-lg text-lime-600 font-semibold mb-2">
              {assignedProject.title}
            </p>
            <p className="text-sm text-gray-600">
              {assignedProject.description || "No description available."}
            </p>

            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Deliverables</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold">Outline Document:</label>
                  <input
                    type="file"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) =>
                      setDeliverables({ ...deliverables, outlineDocument: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold">Extended Abstract:</label>
                  <input
                    type="file"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) =>
                      setDeliverables({ ...deliverables, extendedAbstract: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold">Final Project Report:</label>
                  <input
                    type="file"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) =>
                      setDeliverables({ ...deliverables, finalProjectReport: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold">Deadline:</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={deliverables.deadline}
                    onChange={(e) =>
                      setDeliverables({ ...deliverables, deadline: e.target.value })
                    }
                  />
                </div>
                <button
                  className="bg-lime-600 text-white px-6 py-2 rounded-md hover:bg-lime-700"
                  onClick={async () => {
                    try {
                      const res = await fetch(`../api/deliverables/${session?.user?.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(deliverables),
                      });

                      if (res.ok) {
                        alert("Deliverables updated successfully.");
                      } else {
                        alert("Failed to update deliverables.");
                      }
                    } catch (error) {
                      console.error("Error updating deliverables", error);
                    }
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">Applied Projects</h3>
            {projects.length > 0 ? (
              <ul className="space-y-4">
                {projects.map((project) => (
                  <li
                    key={project._id}
                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <h4 className="text-lg font-semibold text-lime-600">
                      {project.title}
                    </h4>
                    <p className="text-sm text-gray-700">
                      {project.description || "No description available."}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No applied projects found.</p>
            )}
          </div>
        )}
      </div>

      {/* Notifications Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Notifications</h3>
        <ul className="list-disc pl-6 text-gray-700">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <li key={index}>{notification}</li>
            ))
          ) : (
            <p>It's quiet in here...</p>
          )}
        </ul>
      </div>
    </div>
  );
}
