"use client";

import { IProjects } from "@/app/models/Projects";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: session } = useSession();
  const [project, setProject] = useState<IProjects | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [secondReader, isSecondReader] = useState<boolean>(false);
  const [supervisor, isSupervisor] = useState<boolean>(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProject(data.project);
        } else {
          setError("Failed to fetch project data.");
        }
      } catch (error) {
        setError("Error fetching project data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [id]);

  useEffect(() => {
    if (!project || !session?.user?.id) return;

    if (project.projectAssignedTo?.supervisorId?._id === session.user.id) {
      isSupervisor(true);
      isSecondReader(false);
    } else if (
      project.projectAssignedTo?.secondReaderId?._id === session.user.id
    ) {
      isSecondReader(true);
      isSupervisor(false);
    }
  }, [project, session]);

  const handleGradingClick = (documentName: string) => {
    alert(`Start grading the ${documentName}`);
  };

  const handleDownloadClick = (documentName: string) => {
    alert(`Download ${documentName}`);
    // Add logic to download the document here
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-8 text-red-500">Project not found.</div>
    );
  }

  return (
    <div className="container mx-auto p-10 flex flex-col lg:flex-row items-start justify-center gap-10">
      {/* Project Details */}
      <div className="w-full lg:w-3/4 bg-white">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          {project.title}
        </h1>

        <div className="space-y-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <h2 className="text-xl font-medium text-gray-700 ">Status</h2>
              <p
                className={`px-4 py-1 rounded-full ${
                  project.status
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {project.status ? "Open" : "Closed"}
              </p>
            </div>
            <div className="flex gap-2">
              <h2 className="text-xl font-medium text-gray-700">Visibility</h2>
              <p
                className={`px-4 py-1 rounded-full ${
                  project.visibility === "Public"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {project.visibility}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-medium text-gray-700 mb-4">
              Assigned Users
            </h2>

            <div className="space-y-4">
              {supervisor && (
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-700">Second Reader</h3>
                  <p className="text-gray-600">
                    {project.projectAssignedTo?.secondReaderId
                      ? project.projectAssignedTo.secondReaderId.name
                      : "No second reader assigned"}
                  </p>
                </div>
              )}

              {secondReader && (
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-700">Supervisor</h3>
                  <p className="text-gray-600">
                    {project.projectAssignedTo?.supervisorId
                      ? project.projectAssignedTo.supervisorId.name
                      : "No supervisor assigned"}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-700">Student</h3>
                <ul className="text-gray-600">
                  {project?.projectAssignedTo?.studentsId?.length > 0 ? (
                    project?.projectAssignedTo?.studentsId?.map(
                      (student: any) => (
                        <li key={student._id} className="mb-2">
                          {student.name}
                        </li>
                      )
                    )
                  ) : (
                    <li>No students assigned.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          <h2 className="text-xl font-medium text-gray-700 mb-2">Abstract</h2>
          <p className="text-gray-600">{project.abstract}</p>

          <h2 className="text-xl font-medium text-gray-700 mb-2">
            Description
          </h2>
          <p className="text-gray-600">{project.description}</p>
        </div>
      </div>

      {/* Grading Deliverables */}
      <div className="w-full lg:w-1/4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Deliverables
        </h2>

        <div className="space-y-6">
          {(supervisor
            ? [
                "Outline Document",
                "Further Abstract",
                "Provisional Report",
                "Final Report",
              ]
            : ["Provisional Report", "Final Report"]
          ).map((doc) => (
            <div
              key={doc}
              className="bg-gray-100 p-6 text-center mb-5 rounded-lg shadow-lg flex justify-between items-center flex-col sm:flex-row gap-4"
            >
              <div className="w-full sm:w-auto">
                <h3 className="text-lg font-semibold text-gray-700">{doc}</h3>
                <div className="flex gap-2 w-auto justify-center">
                  <button
                    onClick={() => handleGradingClick(doc)}
                    className="bg-lime-600 text-white px-2 py-1 rounded-lg hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-600 flex-1"
                  >
                    Start Grading
                  </button>
                  <button
                    onClick={() => handleDownloadClick(doc)}
                    className="bg-gray-600 text-white px-2 py-1 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 flex-1"
                  >
                    Download Document
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
