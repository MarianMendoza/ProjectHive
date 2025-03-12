"use client";
import { useSession } from "next-auth/react";
import { SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { Project } from "@/types/projects";
import Deadline from "@/app/models/Deadlines";
import WithdrawButton from "./WithdrawButton";
import DataTable from "react-data-table-component";

export default function LecturerDashboard() {
  const { data: session, status } = useSession(); // Get session data
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showSecondReader, setShowSecondReader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [secondReaderProjects, setSecondReaderProjects] = useState<Project[]>(
    []
  );
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovalStatus = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          const data = await response.json();

          if (response.ok) {
            setIsApproved(data.user.approved); // Assumes API response has an approved field
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

  const fetchProjects = async () => {
    if (status === "authenticated" && session?.user.id) {
      try {
        const res = await fetch("/api/projects");

        if (res.ok) {
          const data = await res.json();
          const filteredProjects = data.filter((project: Project) => {
            const isSupervisor =
              project.projectAssignedTo.supervisorId?._id.toString() === session.user.id;
          
            const matchesSearchQuery =
              searchQuery === "" ||
              project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              project.projectAssignedTo?.authorId?.name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());
          
            return isSupervisor && matchesSearchQuery;
          });
          

          const secondReaderFiltered = data.filter((project: Project) => {
            return (
              project.projectAssignedTo.secondReaderId?._id.toString() ===
              session.user.id
            );
          });

          setSecondReaderProjects(secondReaderFiltered);
          setProjects(filteredProjects);
        } else {
          console.error("Error fetching projects");
        }
      } catch (error) {
        console.error("Error fetching projects");
      }
    }
    console.log(projects);
    setLoadingProjects(false);
  };

  const handleSearchChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setSearchQuery(e.target.value);
    fetchProjects();
  };

  const fetchDeadlines = async () => {
    try {
      const deadlineres = await fetch("/api/deadlines");
      const deadlinedata = await deadlineres.json();

      if (deadlinedata && deadlinedata.length > 0) {
        // Ensure both dates are correctly parsed as Date objects
        const pastProjectDate = new Date(deadlinedata[0].pastProjectDate);
        // console.log("Deadline:", pastProjectDate);

        const archived = projects.filter((project: Project) => {
          const projectDate = new Date(project.createdAt);
          // console.log("ProjectDate", projectDate);
          return projectDate < pastProjectDate;
        });

        const active = projects.filter((project: Project) => {
          const projectDate = new Date(project.createdAt);
          return projectDate >= pastProjectDate; // Active if createdAt is after or equal to pastProjectDate
        });
        setActiveProjects(active);
        setArchivedProjects(archived);
      } else {
        console.error("No deadlines found in API response.");
      }
    } catch (error) {
      console.error("Error fetching the deadlines:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [session, status,searchQuery]);

  useEffect(() => {
    if (projects.length > 0) {
      fetchDeadlines();
    }
  }, [projects]);

  const closeModal = () => {
    setShowModal(false);
    setProjectToDelete(null);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
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

  const filteredProjects = showArchived
    ? archivedProjects
    : showSecondReader
    ? secondReaderProjects
    : projects;

  const columns = [
    {
      name: "Project Title",
      selector: (row:Project) => row.title,
      sortable: true,
      minWidth: "180px",
      cell: (row:Project) => (
        <span className="font-medium text-gray-800">{row.title}</span>
      ),
    },
    {
      name: "Created At",
      selector: (row:Project) =>
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
      selector: (row:Project) =>
        row.projectAssignedTo.supervisorId?.name || "Not Assigned",
      sortable: true,
      minWidth: "140px",
    },
    {
      name: "Second Reader",
      selector: (row:Project) =>
        row.projectAssignedTo.secondReaderId?.name || "Not Assigned",
      sortable: true,
      minWidth: "140px",
    },
    {
      name: "Students",
      selector: (row:Project) => (
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
      cell: (row:Project) => (
        <div className="flex items-center space-x-2">
          {/* View Deliverables */}
          <Link
            href={`/pages/deliverables/${row.deliverables._id}`}
            title="View Deliverables"
            className="bg-lime-800 text-white px-3 py-2 rounded-md hover:bg-lime-900 text-xs flex items-center justify-center w-[90px]"
          >
            📝 View
          </Link>

          {/* Edit */}
          <Link
            href={`/pages/update-project/${row._id}`}
            title="Edit Project"
            className="bg-lime-600 text-white px-3 py-2 rounded-md hover:bg-lime-700 text-xs flex justify-center w-[90px]"
          >
            ✏️ Edit
          </Link>

          <WithdrawButton
            projectId={row._id}
            className="bg-amber-500  text-white px-3 py-2 flex rounded-md hover:bg-amber-600 text-xs items-center justify-center w-[90px]"
          />

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

  return (
    <>
      <div className="mb-6">
        <img
          src={"/iStock-1208275903.jpg"}
          alt="Student Dashboard Banner"
          className="w-screen h-64 object-cover rounded-b-lg "
        />
      </div>
      <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {isApproved ? (
          <>
            {/* Notifications and Project Progress Section - Positioned at the top */}
            <div className="flex justify-between mb-6 col-span-3">
              <div className="w-full bg-white p-6">
                <div className="col-span-3 flex justify-between items-center ">
                  <div className="flex justify-between gap-3">
                    <button className="bg-lime-600 text-sm text-white px-2 py-2 rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out">
                      <Link href="/pages/create-project">
                        Create New Project
                      </Link>
                    </button>
                    <button className="bg-lime-800 text-sm text-white px-2 py-2 rounded-lg hover:bg-lime-900 transition duration-200 ease-in-out">
                      <Link href="/pages/manage-deliverables">
                        Manage Deliverables
                      </Link>
                    </button>
                  </div>
                </div>
                {/* Your Projects Section */}
                <div className="bg-white shadow-lg p-2 w-auto mt-2 col-span-3">
                  <h3 className="text-lg font-bold text-center text-gray-800">
                    {showArchived
                      ? "Archived Projects"
                      : showSecondReader
                      ? "Second Reader Projects"
                      : "Your Projects"}
                  </h3>
                  <div className=" justify-between flex ">
                    <div className="flex justify-between px-1 py-1 gap-2">
                      <button
                        onClick={() => {
                          setShowArchived(!showArchived);
                          setShowSecondReader(false); // Ensure only one toggle is active
                        }}
                        className={`px-1 py-1 rounded-lg text-sm transition duration-200 ${
                          showArchived
                            ? "bg-lime-700 text-white"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                       Archived Projects
                      </button>

                      <button
                        onClick={() => {
                          setShowSecondReader(!showSecondReader);
                          setShowArchived(false); // Ensure only one toggle is active
                        }}
                        className={`px-1 py-2 rounded-lg text-sm transition duration-200 ${
                          showSecondReader
                            ? "bg-lime-700 text-white"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                       Second Reader Projects
                      </button>
                    </div>

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Projects..."
                      className="w-1/3 px-1 py-0.5 mt-1 mb-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-600 transition duration-200 ease-in-out"
                    />
                  </div>
                  <DataTable
                    columns={columns}
                    data={filteredProjects}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    responsive
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-red-600">
            Waiting for admin approval. Please check back later.
          </h2>
        )}

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
      </div>
    </>
  );
}
