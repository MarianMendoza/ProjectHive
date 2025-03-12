"use client";
import { useEffect, useState } from "react";
import { Project } from "@/types/projects";
import { useSession } from "next-auth/react";
import Notifications from "./Notifications";
import Link from "next/link";

import DataTable from "react-data-table-component";
import WithdrawButton from "./WithdrawButton";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [authoredProjects, setAuthoredProjects] = useState<Project[]>([]);

  const [assignedProject, setAssignedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!session?.user?.id) {
        console.log("Session user ID is not available.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/projects");
        const data = await res.json();

        if (res.ok) {
          console.log(data);
          const appliedProjects = data.filter((project: Project) =>
            project.applicants.some(
              (applicant) => applicant.studentId?._id === session.user.id
            )
          );

          setProjects(appliedProjects);

          const assigned = appliedProjects.find((project: Project) =>
            project.projectAssignedTo.studentsId.some(
              (student) =>
                (typeof student === "string" ? student : student?._id) ===
                session.user.id
            )
          );
          setAssignedProject(assigned);

          const authored = data.filter(
            (project: Project) =>
              project.projectAssignedTo.authorId._id === session.user.id
          );
          console.log(authored);
          setAuthoredProjects(authored);
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

  const closeModal = () => {
    setShowModal(false);
    setProjectToDelete(null);
  };

  const confirmDelete = (id: string) => {
    setProjectToDelete(id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setShowModal(false);
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });

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

  const columns = [
    {
      name: "Project Title",
      selector: (row: Project) => row.title,
      sortable: true,
      minWidth: "180px",
      cell: (row: Project) => (
        <span className="font-medium text-gray-800">{row.title}</span>
      ),
    },
    {
      name: "Created At",
      selector: (row: Project) =>
        new Date(row.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      sortable: true,
      minWidth: "140px",
    },
    {
      name: "Supervisor",
      selector: (row: Project) =>
        row.projectAssignedTo.supervisorId?.name || "Not Assigned",
      sortable: true,
      minWidth: "140px",
    },
    {
      name: "Second Reader",
      selector: (row: Project) =>
        row.projectAssignedTo.secondReaderId?.name || "Not Assigned",
      sortable: true,
      minWidth: "140px",
    },
    {
      name: "Students",
      selector: (row: Project) => (
        <div className="text-sm">
          {row.projectAssignedTo.studentsId.length > 0 ? (
            row.projectAssignedTo.studentsId.map((student) => (
              <p key={student._id} className="text-gray-700">
                {student.name}
              </p>
            ))
          ) : (
            <p className="text-gray-500">No Students Assigned</p>
          )}
        </div>
      ),
      minWidth: "250px",
    },
    {
      name: "Actions",
      cell: (row: Project) => (
        <div className="flex items-center space-x-2">
          {/* Edit */}
          <Link
            href={`/pages/update-project/${row._id}`}
            title="Edit Project"
            className="bg-lime-600 text-white px-3 py-2 rounded-md hover:bg-lime-700 text-xs flex justify-center w-[90px]"
          >
            ✏️ Edit
          </Link>

          {/* Delete */}
          <button
            onClick={() => confirmDelete(row._id)}
            title="Delete Project"
            className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 text-xs flex items-center justify-center w-[90px]"
          >
            🗑️ Delete
          </button>
        </div>
      ),
      minWidth: "400px",
    },
  ];

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
        <div className="md:col-span-4">
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

              <div className="mt-6 flex gap-3 mb-6">
                <Link
                  href={`/pages/deliverables/${assignedProject.deliverables._id}`}
                  className="bg-lime-800 text-white px-6 py-2 rounded-lg hover:bg-lime-900 transition duration-200"
                >
                  📝 View Deliverables
                </Link>
                <WithdrawButton
                  projectId={assignedProject._id}
                  className={
                    "bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition duration-200"
                  }
                />
              </div>

              <DataTable
                title="Authored Projects"
                columns={columns}
                data={authoredProjects}
                pagination
                highlightOnHover
                pointerOnHover
                responsive
              />
            </div>
          ) : (
            <div>
              <div className="flex justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                  Authored Projects
                </h3>
              <Link
                  href="/pages/create-project"
                  className="bg-lime-600 text-white px-6 py-3 rounded-lg hover:bg-lime-700 transition duration-200"
                >
                  Create New Project
                </Link>
                </div>
              <DataTable
                columns={columns}
                data={authoredProjects}
                pagination
                highlightOnHover
                pointerOnHover
                responsive
              />
              <div className=" mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Applied Projects
                </h3>
             
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
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
              Confirm Deletion
            </h2>
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
    </>
  );
}
