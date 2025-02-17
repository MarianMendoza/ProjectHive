"use client";
import { useEffect, useState } from "react";
import { Project } from "@/types/projects";
import { useSession } from "next-auth/react";
import Notifications from "./Notifications";
import Link from "next/link";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [assignedProject, setAssignedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!session?.user?.id) {
        console.log("Session user ID is not available.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          const appliedProjects = data.filter((project: Project) =>
            project.applicants.some(
              (applicant) => applicant.studentId?._id === session.user.id
            )
          );

          setProjects(appliedProjects);

          const assigned = appliedProjects.find((project: Project) =>
            project.projectAssignedTo.studentsId.some(
              (student) => student?._id === session.user.id
            )
          );

          setAssignedProject(assigned);
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

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div className="mb-6">
        <img
          src={"/iStock-1208275903.jpg"}
          alt="Student Dashboard Banner"
          className="w-screen h-64 object-cover rounded-b-lg "
        />
      </div>
      <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {assignedProject ? (
            <div className="bg-white">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Assigned Project
              </h3>
              <p className="text-lg text-lime-600 font-semibold mb-4">
                {assignedProject.title}
              </p>

              {/* Supervisor, Second Reader, and Students in One Row */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex-1">
                  <p className="text-md font-semibold text-gray-800">
                    Supervisor:
                  </p>
                  <p className="text-sm text-gray-600">
                    {assignedProject.projectAssignedTo.supervisorId?.name || (
                      <span>Not Assigned</span>
                    )}
                  </p>
                </div>

                <div className="flex-1">
                  <p className="text-md font-semibold text-gray-800">
                    Second Reader:
                  </p>
                  <p className="text-sm text-gray-600">
                    {assignedProject.projectAssignedTo.secondReaderId?.name || (
                      <span>Not Assigned</span>
                    )}
                  </p>
                </div>

                <div className="flex-1">
                  <p className="text-md font-semibold text-gray-800">
                    Students:
                  </p>
                  <p className="list-inside text-sm text-gray-600">
                    {assignedProject.projectAssignedTo.studentsId.length > 0 ? (
                      assignedProject.projectAssignedTo.studentsId.map(
                        (student) => <li key={student._id}>{student.name}</li>
                      )
                    ) : (
                      <p>No Students Assigned</p>
                    )}
                  </p>
                </div>
              </div>

              {/* Project Description */}
              <div className="mb-6">
                <p className="text-md font-semibold text-gray-800">
                  Description:
                </p>
                <p className="text-sm text-gray-600">
                  {assignedProject.description || "No description available."}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Link
                  href={`/pages/deliverables?projectId=${assignedProject._id}`}
                  className="bg-lime-800 text-white px-6 py-2 rounded-lg hover:bg-lime-900 transition duration-200"
                >
                  📝 Manage Deliverables
                </Link>
                <button className="bg-orange-500 mr-3 p-2 justify-start text-white text-center rounded-lg hover:bg-orange-600 transition duration-200 ease-in-out">
                  Withdraw
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Applied Projects
                </h3>
                <Link
                  href="/pages/create-project"
                  className="bg-lime-600 text-white px-6 py-3 rounded-lg hover:bg-lime-700 transition duration-200"
                >
                  Create New Project
                </Link>
              </div>

              {projects.length > 0 ? (
                <ul className="space-y-4">
                  {projects.map((project) => (
                    <li
                      key={project._id}
                      className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200"
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
        <div className="md:col-span-1">
          <Notifications />
        </div>
      </div>
    </>
  );
}
