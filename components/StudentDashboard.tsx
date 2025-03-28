"use client";
import { useEffect, useState } from "react";
import { Project } from "@/types/projects";
import { useSession } from "next-auth/react";
import Notifications from "./Notifications";
import Link from "next/link";

import DataTable from "react-data-table-component";
import WithdrawButton from "./WithdrawButton";
import { IDeliverables } from "@/types/deliverable";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [authoredProjects, setAuthoredProjects] = useState<Project[]>([]);

  const [assignedProject, setAssignedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [deliverable, setDeliverables] = useState<IDeliverables | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [grades, setGrades] = useState({
    outlineGrade: null,
    abstractGrade: null,
    finalReportGrade: null,
  });

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

    const fetchDeliverables = async () => {
      try {
        const res = await fetch(`/api/deliverables/${assignedProject?._id}`);
        const data = await res.json();

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const fetched = data.deliverables;
        setDeliverables(fetched);

        setGrades({
          outlineGrade: fetched?.outlineDocument?.supervisorGrade ?? null,
          abstractGrade: fetched?.extendedAbstract?.supervisorGrade ?? null,
          finalReportGrade: fetched?.finalReport?.supervisorGrade ?? null,
        });
      } catch (err) {
        console.error("Error fetching deliverable:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverables();
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
            className="bg-emerald-700 text-white px-3 py-2 rounded-md hover:bg-emerald-800 text-xs flex justify-center w-[90px]"
          >
            ✏️ Edit
          </Link>

          {/* Delete */}
          <button
            onClick={() => confirmDelete(row._id)}
            title="Delete Project"
            className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 text-xs flex items-center justify-center w-[90px]"
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
          src="/iStock-1208275903.jpg"
          alt="Student Dashboard Banner"
          className="w-full h-64 object-cover rounded-b-xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            {assignedProject ? (
              <div className="bg-white rounded-xl  p-6">
                <h2 className="text-2xl font-bold text-emerald-800 mb-4">
                  {assignedProject.title}
                </h2>

                <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-emerald-100">
                  <h2 className="text-lg font-bold mb-6 text-gray-700 text-center">
                    🍯 Grades Summary
                  </h2>
                  <div className="flex flex-col md:flex-row flex-wrap gap-6 justify-center items-center">
                    {[
                      {
                        label: "Outline Document",
                        value: grades.outlineGrade,
                        show: true,
                      },
                      {
                        label: "Extended Abstract",
                        value: grades.abstractGrade,
                        show: true,
                      },
                      {
                        label: "Final Report",
                        value: grades.finalReportGrade,
                        show: true,
                      },
                    ]
                      .filter((item) => item.show)
                      .map((item, index) => {
                        const value = item.value;
                        const getColor = () => {
                          if (value === null || value === undefined)
                            return "bg-gray-200 text-gray-500";
                          if (value >= 70) return "bg-emerald-300 text-emerald-900";
                          if (value >= 50)
                            return "bg-teal-200 text-teal-800";
                          if (value >= 1)
                            return "bg-orange-200 text-orange-800";
                          return "bg-gray-200 text-gray-500";
                        };

                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center space-y-2 w-28 text-center"
                          >
                            <div
                              className={`w-24 h-24 ${getColor()} flex items-center justify-center font-bold text-lg`}
                              style={{
                                clipPath:
                                  "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                              }}
                            >
                              {value !== null && value !== undefined
                                ? `${value}`
                                : "N/A"}
                            </div>
                            <span className="text-xs text-gray-600 font-medium leading-tight">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href={`/pages/deliverables/${assignedProject.deliverables._id}`}
                    className="bg-emerald-800 hover:bg-emerald-800 text-white px-6 py-2 rounded-full shadow transition"
                  >
                    📁 View Deliverables
                  </Link>
                  <WithdrawButton
                    projectId={assignedProject._id}
                    className="bg-orange-700 hover:bg-orange-800 text-white px-6 py-2 rounded-full shadow transition"
                  />
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                  {["Supervisor", "Second Reader", "Students"].map(
                    (role, i) => {
                      const data =
                        role === "Supervisor"
                          ? assignedProject.projectAssignedTo.supervisorId?.name
                          : role === "Second Reader"
                          ? assignedProject.projectAssignedTo.secondReaderId
                              ?.name
                          : assignedProject.projectAssignedTo.studentsId
                              .map((s) => s.name)
                              .join(", ");

                      return (
                        <div
                          key={i}
                          className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-100"
                        >
                          <p className="text-md font-semibold text-gray-800">
                            {role}:
                          </p>
                          <p className="text-sm text-gray-600">
                            {data || (
                              <span className="italic text-gray-400">
                                Not Assigned
                              </span>
                            )}
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Abstract
                  </h3>
                  <p className="text-sm text-gray-600">
                    {assignedProject.abstract || "No abstract available."}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-gray-600">
                    {assignedProject.description || "No description available."}
                  </p>
                </div>

                <div className="mt-10">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    📂 Authored Projects
                  </h3>
                  <DataTable
                    columns={columns}
                    data={authoredProjects}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    responsive
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    📂 Authored Projects
                  </h3>
                  <Link
                    href="/pages/create-project"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg transition"
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

                <div className="mt-10">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    📋 Applied Projects
                  </h3>

                  {projects.length > 0 ? (
                    <ul className="space-y-4">
                      {projects.map((project) => (
                        <li
                          key={project._id}
                          className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
                        >
                          <h4 className="text-lg font-semibold text-emerald-700">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
              Confirm Deletion
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to delete this project?
            </p>
            <div className="flex justify-between">
              <button
                onClick={closeModal}
                className="bg-gray-200 text-black px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => projectToDelete && handleDelete(projectToDelete)}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
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
