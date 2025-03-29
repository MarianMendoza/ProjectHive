"use client";

import { IProjects } from "@/app/models/Projects";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { IDeliverables } from "@/types/deliverable";

export default function ProjectPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: session } = useSession();
  const [project, setProject] = useState<IProjects | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [secondReader, isSecondReader] = useState<boolean>(false);
  const [deliverable, setDeliverables] = useState<IDeliverables | null>(null);
  const [supervisor, isSupervisor] = useState<boolean>(false);
  const [grades, setGrades] = useState({
    outlineGrade: null,
    abstractGrade: null,
    finalSupervisorGrade: null,
    finalSupervisorInitialGrade: null,
    finalSecondReaderInitialGrade: null,
  });
  const [initialFeedbackReady, setInitialFeedbackReady] = useState(false);
  const [finalFeedbackReady, setFinalFeedbackReady] = useState(false);

  const [feedbackReady, setFeedbackReady] = useState(false);

  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        const res = await fetch(`/api/deliverables/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setError("Failed to fetch deliverable.");
          setLoading(false);
          return;
        }

        const fetched = data.deliverables;
        setDeliverables(fetched);

        setGrades({
          outlineGrade: fetched?.outlineDocument?.supervisorGrade ?? null,
          abstractGrade: fetched?.extendedAbstract?.supervisorGrade ?? null,
          finalSupervisorGrade: fetched?.finalReport?.supervisorGrade ?? null,
          finalSupervisorInitialGrade:
            fetched?.finalReport?.supervisorInitialGrade ?? null,
          finalSecondReaderInitialGrade:
            fetched?.finalReport?.secondReaderInitialGrade ?? null,
        });

        const isInitialFeedbackReady =
          fetched?.finalReport?.supervisorInitialSubmit &&
          fetched?.finalReport?.secondReaderInitialSubmit;

        const isFinalSubmitted = fetched?.finalReport?.supervisorSigned;

        setInitialFeedbackReady(isInitialFeedbackReady);
        setFinalFeedbackReady(isFinalSubmitted);
        setFeedbackReady(fetched?.finalReport?.supervisorSubmit ?? false);
      } catch (err) {
        console.error("Error fetching deliverable:", err);
        setError("An error occurred.");
      } finally {
        setLoading(false);
      }
    };
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
    fetchDeliverables();
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
  console.log(deliverable);

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
    <div className="container mx-auto p-10 flex flex-col  items-start justify-center gap-10">
      {/* Project Details */}
      <div className="w-full bg-white">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          {project.title}
        </h1>

        <div className="w-full">
          <h2 className="text-xl font-medium text-gray-700 text-center mb-4">
            Deliverables
          </h2>

          <div className="flex flex-wrap justify-center gap-4">
            {(supervisor
              ? [
                  "Outline Document",
                  "Extended Abstract",
                  "Provisional Report",
                  "Final Report",
                ]
              : ["Provisional Report", "Final Report"]
            ).map((doc) => {
              const isFinalReport = doc === "Final Report";
              const supervisorHasSigned =
                deliverable?.finalReport?.supervisorSigned === true;

              const isDisabled =
                secondReader && isFinalReport && !supervisorHasSigned;

              return (
                <Link
                  key={doc}
                  href={
                    !isDisabled ? `/pages/deliverables-page/${doc}/${id}` : "#"
                  }
                  className={`px-6 py-3 rounded-full font-medium shadow-md duration-200 ease-in-out ${
                    isDisabled
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-700 text-white hover:bg-emerald-800"
                  }`}
                  onClick={(e) => {
                    if (isDisabled) e.preventDefault(); // prevent navigation if disabled
                  }}
                >
                  {doc}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="mt-6 bg-white p-6 rounded-xl">
          <h2 className="text-lg font-bold mb-6 text-gray-800 text-center">
          Grades Summary
          </h2>

          <div className="flex flex-col md:flex-row flex-wrap gap-6 justify-center items-center">
            {[
              {
                label: "Outline Document",
                value: grades.outlineGrade,
                show: !secondReader,
              },
              {
                label: "Extended Abstract",
                value: grades.abstractGrade,
                show: !secondReader,
              },
              {
                label: "Supervisor Provisional Grade",
                value: grades.finalSupervisorInitialGrade,
                show: !secondReader || initialFeedbackReady,
              },
              {
                label: "Second Reader Provisional Grade",
                value: grades.finalSecondReaderInitialGrade,
                show: !supervisor || initialFeedbackReady,
              },
              {
                label: "Final Supervisor Grade",
                value: grades.finalSupervisorGrade,
                show: !secondReader || finalFeedbackReady,
              },
            ]
              .filter((item) => item.show)
              .map((item, index) => {
                const value = item.value;

                const getColor = () => {
                  if (value === null || value === undefined)
                    return "bg-gray-200 text-gray-500";
                  if (value >= 70) return "bg-emerald-300 text-emerald-900";
                  if (value >= 50) return "bg-teal-200 text-teal-800"; 
                  if (value >= 1) return "bg-orange-200 text-orange-800"; 
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

        <div className="space-y-8">
          <div className="flex gap-4 items-center mb-4">
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
    </div>
  );
}
