"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaCloudUploadAlt, FaDownload } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { Deliverable } from "@/types/deliverable";
import PageNotFound from "@/components/PageNotFound";
import { useSocket } from "@/app/provider";
import React from "react";

export default function DeliverablesPage() {
  const [dragging, setDragging] = useState(false);
  const [deadlines, setDeadlines] = useState({
    outlineDocumentDeadline: "",
    extendedAbstractDeadline: "",
    finalReportDeadline: "",
  });

  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [deliverablesId, setDeliverablesId] = useState<string | null>(null);
  const userId = session?.user.id;
  const socket = useSocket();
  const [DeliverableType, setDeliverableType] = useState<string | null>(null);

  const [deliverables, setDeliverables] = useState<{
    [key: string]: Deliverable;
  }>({
    outlineDocument: {
      file: "",
      uploadedAt: "",
      description:
        "A one-page document consisting of a short analysis of the project in the student's own words and a broad plan of the steps to complete the work. The supervisor should give the pass mark if and only if s/he is convinced that this document demonstrates that the student has understood the FYP.",
      supervisorGrade: 0,
      supervisorFeedback: "",
      isPublished: false,
    },
    extendedAbstract: {
      file: "",
      uploadedAt: "",
      description:
        "A written document of about 5 pages. It must contain a summary of the most important findings of the work undertaken. The format should allow for consistent reading, similar to a journal publication.\nThe purpose of this stage is to ensure that the student starts to write their final report in a timely fashion. The assessment and feedback should focus on the quality of the document and not on the technical quality of work per se. A pass judgment for this stage should not be construed as a promise that the work as a whole is pass-worthy.",
      supervisorGrade: 0,
      supervisorFeedback: "",
      isPublished: false,
    },
    finalReport: {
      file: "",
      uploadedAt: "",
      description:
        "Report writing guidelines were given separately. Upload instructions: Prepare a zip or tar.gz archive with your report as PDF in the folder root and one sub-folder with all source code you wrote as part of your FYP. If you have any online demonstration, create a file with the name demo.html with clickable links and add it also to the root folder of the archive. Maximum file size for this upload: 70MB.",
      supervisorGrade: 0,
      supervisorFeedback: "",
      secondReaderGrade: 0,
      secondReaderFeedback: "",
      isPublished: false,
    },
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [studentsId, setStudentsId] = useState<string[]>([]);

  useEffect(() => {
    const fetchDeliverables = async () => {
      if (!projectId) return;

      try {
        const res = await fetch(`/api/deliverables?projectId=${projectId}`);
        if (res.ok) {
          const data = await res.json();

          setStudentsId(
            data.deliverables.projectId.projectAssignedTo.studentsId
          );
          

          const allowedKeys = [
            "outlineDocument",
            "extendedAbstract",
            "finalReport",
          ];
          const filteredData = Object.fromEntries(
            Object.entries(data.deliverables).filter(([key]) =>
              allowedKeys.includes(key)
            )
          );
          const updatedData = Object.fromEntries(
            Object.entries(filteredData).map(([key, value]) => [
              key,
              {
                ...value,
                description: deliverables[key]?.description || "",
              },
            ])
          );

          setDeliverables(updatedData);
          console.log(updatedData);
          setDeliverablesId(data.deliverables._id);
        } else {
          console.log("No deliverables found.");
        }
      } catch (error) {
        console.error("Error fetching deliverables", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverables();

    const fetchDeadlines = async () => {
      try {
        const deadlineres = await fetch("/api/deadlines");
        const deadlinedata = await deadlineres.json();
        if (Array.isArray(deadlinedata) && deadlinedata.length > 0) {
          const formatDate = (isoString: string) =>
            isoString ? isoString.split("T")[0] : "";

          setDeadlines({
            outlineDocumentDeadline: formatDate(
              deadlinedata[0].outlineDocumentDeadline
            ),
            extendedAbstractDeadline: formatDate(
              deadlinedata[0].extendedAbstractDeadline
            ),
            finalReportDeadline: formatDate(
              deadlinedata[0].finalReportDeadline
            ),
          });
        } else {
          console.error("No deadlines found in API response.");
        }
      } catch (error) {
        console.error("Error fetching the deadlines:", error);
      }
    };
    fetchDeadlines();
  }, [projectId]);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    deliverableType: string
  ) => {
    const formData = new FormData();
    let file;

    if (!e.target.files) return;

    // Check if projectId and deliverablesId are defined
    if (!projectId || !deliverablesId) {
      alert("Missing project or deliverable ID");
      return;
    }

    file = e.target.files[0];

    formData.append("file", file);
    formData.append("projectId", projectId);
    formData.append("deliverableType", deliverableType);
    formData.append("deliverablesId", deliverablesId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log(data);

        setDeliverables((prevDeliverables) => ({
          ...prevDeliverables,
          [deliverableType]: {
            ...(prevDeliverables[deliverableType] || {}),
            file: data.fileUrl,
            uploadedAt: new Date().toISOString(),
          },
        }));

        alert("File uploaded successfully!");
      } else {
        alert("Failed to upload file.");
      }
    } catch (error) {
      console.error("Error uploading file", error);
      alert("There was an error uploading the file. Please try again.");
    }
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    deliverableType: string
  ) => {
    e.preventDefault();
    setDragging(false);

    const formData = new FormData();
    let file;

    if (e.dataTransfer.files.length === 0) return;

    file = e.dataTransfer.files[0];

    if (!projectId || !deliverablesId) {
      alert("Missing project or deliverable ID");
      return;
    }

    formData.append("file", file);
    formData.append("projectId", projectId);
    formData.append("deliverableType", deliverableType);
    formData.append("deliverablesId", deliverablesId);
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log(data);

          setDeliverables((prevDeliverables) => ({
            ...prevDeliverables,
            [deliverableType]: {
              ...(prevDeliverables[deliverableType] || {}),
              file: data.fileUrl,
              uploadedAt: new Date().toISOString(),
            },
          }));

          alert("File uploaded successfully!");
        } else {
          alert("Failed to upload file.");
        }
      };

      xhr.onerror = () => {
        alert("There was an error uploading the file. Please try again.");
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Error uploading file", error);
      alert("There was an error uploading the file. Please try again.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDownload = (fileName: string): void => {
    const link: HTMLAnchorElement = document.createElement("a");
    link.href = fileName;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isStudent = session?.user?.role === "Student";

  if (loading)
    return <p className="text-center text-lg text-gray-600">Loading...</p>;

  return (
    <>
      <div className="mb-6">
        <img
          src={"/iStock-1208275903.jpg"}
          alt="Student Dashboard Banner"
          className="w-screen h-64 object-cover rounded-b-lg "
        />
      </div>
      <div className="flex flex-col items-center justify-center mt-10 bg-cover bg-center">
        <h3 className="text-2xl font-bold mb-2 text-center">
          View Deliverables
        </h3>
    
        <div className="w-full max-w-4xl p-6">
          <p className="text-gray-600 text-center mb-6">
            Upload and manage the necessary documents for your project. Ensure
            all files are submitted before their deadlines.
          </p>

          {Object.entries(deliverables).map(
            ([key, { file, uploadedAt, description, isPublished }]) => (
              <div key={key} className="p-4 mb-4 bg-white rounded-lg shadow-lg">
                <h4 className="text-lg font-semibold capitalize text-lime-600">
                  {key.replace(/([A-Z])/g, " $1")}
                </h4>

                <p className="text-sm text-gray-600">
                  <strong>Deadline:</strong>{" "}
                  {deadlines?.[key + "Deadline"] ?? "Not set"}
                </p>

                <p className="text-sm text-gray-600">
                  <strong>Last Uploaded:</strong>{" "}
                  {uploadedAt ? new Date(uploadedAt).toLocaleString() : "Never"}
                </p>
                <p className="text-sm text-gray-600 mb-4">{description}</p>

                {isPublished == true && isStudent && (
                  <div className="mt-4 mb-4">
                    <h3 className="text-small font-semibold text-gray-800 mb-2">
                      📋 Supervisor's Grade & Feedback
                    </h3>

                    {deliverables?.[key]?.supervisorGrade ? (
                      <div className="relative w-full bg-gray-200 rounded-lg h-6 overflow-hidden">
                        <div
                          className="h-full bg-lime-600 text-center text-white text-sm font-semibold flex items-center justify-center transition-all"
                          style={{
                            width: `${deliverables[key].supervisorGrade}%`,
                          }}
                        >
                          {deliverables[key].supervisorGrade}/100
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Yet to be published
                      </p>
                    )}

                    <div className="w-full p-2 border bg-gray-100 rounded-md mt-4 text-gray-700">
                      <strong>Feedback:</strong>
                      {deliverables?.[key]?.supervisorFeedback ? (
                        <ul className="mt-2 space-y-2">
                          {Object.entries(
                            deliverables[key].supervisorFeedback
                          ).map(([category, feedback]) => (
                            <li key={category}>
                              <strong>{category}:</strong>{" "}
                              {feedback || (
                                <span className="text-gray-500">
                                  No feedback provided
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-500">
                          Yet to be published
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {isStudent &&
                  deadlines?.[key + "Deadline"] &&
                  new Date(deadlines[key + "Deadline"]) >= new Date() && (
                    <div
                      onDrop={(e) => handleDrop(e, key)}
                      className="w-full p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-lime-600 text-center"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <label
                        htmlFor={key}
                        className="cursor-pointer flex flex-col items-center justify-center"
                      >
                        <div className="flex flex-col items-center mb-2 ">
                          <span
                            role="img"
                            aria-label="file"
                            className="text-2xl"
                          >
                            📁
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Drag & drop files here or{" "}
                          <span className="text-lime-600 font-semibold">
                            browse
                          </span>
                        </span>
                      </label>
                      <input
                        type="file"
                        id={key}
                        className="hidden"
                        onChange={(e) => handleFileChange(e, key)}
                      />
                      <div className="mt-4"></div>
                    </div>
                  )}

                <button
                  disabled={!file}
                  className={`flex items-center gap-2 mt-2 px-4 py-2 rounded-lg transition w-full text-center ${
                    !file
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed "
                      : "bg-lime-700 text-white hover:bg-lime-800"
                  }`}
                  onClick={() => handleDownload(file)}
                >
                  <FaDownload />
                  {"Download File" || "File not available"}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
