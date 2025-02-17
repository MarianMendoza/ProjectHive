"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaCloudUploadAlt, FaDownload } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { Deliverable } from "@/types/deliverable";
import PageNotFound from "@/components/PageNotFound";
import { useSocket } from "@/app/provider";

export default function DeliverablesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [deliverablesId, setDeliverablesId] = useState<string | null>(null);
  const [showModalPublish, setShowModalPublish] = useState<boolean>(false);
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
  const [supervisorId, setSupervisorId] = useState<string | null>(null);
  const [secondReaderId, setSecondReaderId] = useState<string | null>(null);
  const [studentsId, setStudentsId] = useState<string[]>([]);

  useEffect(() => {
    const fetchDeliverables = async () => {
      if (!projectId) return;

      try {
        const res = await fetch(`/api/deliverables?projectId=${projectId}`);
        if (res.ok) {
          const data = await res.json();
          // console.log(data)

          setStudentsId(
            data.deliverables.projectId.projectAssignedTo.studentsId
          );
          // console.log(studentsId);
          setSupervisorId(
            data.deliverables.projectId.projectAssignedTo.supervisorId?._id
          );

          setSecondReaderId(
            data.deliverables.projectId.projectAssignedTo.secondReaderId?._id
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
  }, [projectId]);

  const closeModal = () => {
    setShowModalPublish(false);
  };

  const openModal = async (deliverableType: Deliverable) => {
    setShowModalPublish(true);
    setDeliverableType(deliverableType.toString());
  };

  const handleSubmitGrade = async (
    id: String,
    deliverableType: Deliverable
  ): Promise<void> => {
    const gradeInput = document.getElementById(
      `grade-${deliverableType}`
    ) as HTMLInputElement;
    const feedbackInput = document.getElementById(
      `feedback-${deliverableType}`
    ) as HTMLTextAreaElement;

    if (!gradeInput || !feedbackInput) {
      console.error("Grade or feedback input is not found.");
      return;
    }

    const grade = gradeInput ? Number(gradeInput.value) : 0;
    const feedback = feedbackInput ? feedbackInput.value : "";

    if (grade < 0 || grade > 100) {
      alert("Must mark grade in range (0-100)!");
      return;
    }



    let receiversId;
    let type;

    let updateData = {};

    if (userId == supervisorId) {
      receiversId = [secondReaderId];
      type = "SubmitSupervisor";      
      updateData = {
        [`${deliverableType}.supervisorGrade`]: grade,
        [`${deliverableType}.supervisorFeedback`]: feedback,
      };
    }
    if (userId == secondReaderId) {
      receiversId = [supervisorId];
      type = "SubmitSecondReader";      
      updateData = {
        [`${deliverableType}.secondReaderGrade`]: grade,
        [`${deliverableType}.secondReaderFeedback`]: feedback,
      };
    }

    try {
      const res = await fetch(`/api/deliverables/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      if (res.ok) {
        console.log(updateData);

        alert("Grade submitted successfully.");

        if (userId == supervisorId) {
          setDeliverables((prev) => ({
            ...prev,
            [deliverableType]: {
              ...prev[deliverableType],
              supervisorGrade: grade,
              supervisorFeedback: feedback,
            },
          }));
        }
        if (userId == secondReaderId) {
          setDeliverables((prev) => ({
            ...prev,
            [deliverableType]: {
              ...prev[deliverableType],
              secondReaderGrade: grade,
              secondReaderFeedback: feedback,
            },
          }));
        }

        if (socket) {
          socket.emit("sendNotification", {
            userId,
            receiversId,
            projectId,
            type,
          });
        } else {
          console.error("Socket is not initialized");
        }
      } else {
        alert("Failed to submit grade.");
      }
    } catch (error) {
      console.error("Error submitting grade:", error);
    }
  };

  const handlePublishGrade = async (id: String): Promise<void> => {
    const updateData = {
      [`${DeliverableType}.isPublished`]: true,
    };

    const userId = session?.user.id;
    const receiversId = studentsId;
    const type = "GradesPublished";

    if (socket) {
      socket.emit("sendNotification", {
        userId,
        receiversId,
        projectId,
        type,
      });
    } else {
      console.error("Socket is not initialized");
    }
    try {
      const res = await fetch(`/api/deliverables/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setShowModalPublish(false);
      } else {
        alert("Failed to submit grade.");
      }
      return;
    } catch (error) {
      console.error("Error submitting grade:", error);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    deliverableType: string
  ) => {
    if (!e.target.files) return;

    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    formData.append("projectId", projectId!);
    formData.append("deliverableType", deliverableType);
    formData.append("deliverablesId", deliverablesId!);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setDeliverables((prevDeliverables) => ({
          ...prevDeliverables,
          [deliverableType]: {
            ...prevDeliverables[
              deliverableType as keyof typeof prevDeliverables
            ],
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
    }
  };

  const handleDownload = (fileName: string): void => {
    const link: HTMLAnchorElement = document.createElement("a");
    link.href = fileName;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // const canSubmitGrade = session?.user?.id === supervisorId;
  const isStudent = session?.user?.role === "Student";
  const isSupervisor = session?.user?.id === supervisorId;
  const isSecondReader = session?.user?.id === secondReaderId;

  // if ( userId != secondReaderId || userId != supervisorId) {
  //   return <PageNotFound></PageNotFound>;
  // }
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
          Manage Deliverables
        </h3>

        <div className="w-full max-w-4xl p-6">
          <p className="text-gray-600 text-center mb-6">
            Upload and manage the necessary documents for your project. Ensure
            all files are submitted before their deadlines.
          </p>

          {Object.entries(deliverables).map(
            ([
              key,
              { file, uploadedAt, description, isPublished },
            ]) => (
              <div key={key} className="p-4 mb-4 bg-white rounded-lg shadow-lg">
                <h4 className="text-lg font-semibold capitalize text-lime-600">
                  {key.replace(/([A-Z])/g, " $1")}
                </h4>

                <p className="text-sm text-gray-600">
                  <strong>Due Date:</strong> { "" || "Not set"}
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

                    <p className="w-full p-2 border bg-gray-100 rounded-md mt-4 text-gray-700">
                      <strong>Feedback: </strong>
                      {deliverables?.[key]?.supervisorFeedback ? (
                        deliverables[key].supervisorFeedback
                      ) : (
                        <span className="text-gray-500">
                          Yet to be published
                        </span>
                      )}
                    </p>

                    {key == "finalReport" && (
                      <div className="mt-4 mb-4">
                        <h3 className="text-small font-semibold text-gray-800 mb-2">
                          📋 Second Readers's Grade & Feedback
                        </h3>

                        {deliverables?.[key]?.secondReaderGrade ? (
                          <div className="relative w-full bg-gray-200 rounded-lg h-6 overflow-hidden">
                            <div
                              className="h-full bg-lime-600 text-center text-white text-sm font-semibold flex items-center justify-center transition-all"
                              style={{
                                width: `${deliverables[key].secondReaderGrade}%`,
                              }}
                            >
                              {deliverables[key].secondReaderGrade}/100
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Yet to be published
                          </p>
                        )}

                        <p className="w-full p-2 border bg-gray-100 rounded-md mt-4 text-gray-700">
                          <strong>Feedback: </strong>
                          {deliverables?.[key]?.secondReaderFeedback ? (
                            deliverables[key].secondReaderFeedback
                          ) : (
                            <span className="text-gray-500">
                              Yet to be published
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {isStudent && (
                  <div className="w-full p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-lime-600 text-center">
                    <label
                      htmlFor={key}
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <div className="flex flex-col items-center mb-2 ">
                        <span role="img" aria-label="file" className="text-2xl">
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
                  </div>
                )}

                {isSecondReader && (
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

                    <p className="w-full p-2 border bg-gray-100 rounded-md mt-4 text-gray-700">
                      <strong>Feedback: </strong>
                      {deliverables?.[key]?.supervisorFeedback ? (
                        deliverables[key].supervisorFeedback
                      ) : (
                        <span className="text-gray-500">
                          Yet to be published
                        </span>
                      )}
                    </p>

                    {key == "finalReport" && (
                      <div className="mt-4">
                        <p>{}</p>
                        <label className="block text-sm text-gray-700">
                          Grade Out Of 100
                        </label>
                        
                        <input
                          id={`grade-${key}`}
                          type="number"
                          min="0"
                          max="100"
                          className="w-full p-2 border border-gray-300 rounded-md mt-2"
                          placeholder="Enter grade"
                          defaultValue={
                            deliverables?.[key]?.secondReaderGrade || ""
                          }
                        />
                        <label className="block text-sm text-gray-700 mt-4">
                          Feedback
                        </label>
                        <textarea
                          id={`feedback-${key}`}
                          className="w-full p-2 border border-gray-300 rounded-md mt-2"
                          placeholder="Enter feedback"
                          defaultValue={
                            deliverables?.[key]?.secondReaderFeedback || ""
                          }
                        ></textarea>
                        <div className="flex  gap-3">
                          <button
                            className="bg-lime-600 px-4  py-2 justify-start text-white text-center rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out"
                            onClick={() =>
                              handleSubmitGrade(
                                deliverablesId?.toString()!,
                                key as unknown as Deliverable
                              )
                            }
                          >
                            Submit
                          </button>
                          <button
                            className="bg-cyan-600 px-4  py-2 justify-start text-white text-center rounded-lg hover:bg-cyan-700 transition duration-200 ease-in-out"
                            onClick={() =>
                              openModal(key as unknown as Deliverable)
                            }
                          >
                            Publish
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isSupervisor && (
                  <div className="mt-4">
                    <p>{}</p>

                    {key == "finalReport" && (
                      <div className="mt-4 mb-4">
                        <h3 className="text-small font-semibold text-gray-800 mb-2">
                          📋 Second Reader's Grade & Feedback
                        </h3>

                        {deliverables?.[key]?.secondReaderGrade ? (
                          <div className="relative w-full bg-gray-200 rounded-lg h-6 overflow-hidden">
                            <div
                              className="h-full bg-lime-600 text-center text-white text-sm font-semibold flex items-center justify-center transition-all"
                              style={{
                                width: `${deliverables[key].secondReaderGrade}%`,
                              }}
                            >
                              {deliverables[key].secondReaderGrade}/100
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            Yet to be published
                          </p>
                        )}

                        <p className="w-full p-2 border bg-gray-100 rounded-md mt-4 text-gray-700">
                          <strong>Feedback: </strong>
                          {deliverables?.[key]?.secondReaderFeedback ? (
                            deliverables[key].secondReaderFeedback
                          ) : (
                            <span className="text-gray-500">
                              Yet to be published
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                    <label className="block text-sm text-gray-700">
                      Grade Out Of 100
                    </label>
                    <input
                      id={`grade-${key}`}
                      type="number"
                      min="0"
                      max="100"
                      className="w-full p-2 border border-gray-300 rounded-md mt-2"
                      placeholder="Enter grade"
                      defaultValue={deliverables?.[key]?.supervisorGrade || ""}
                    />
                    <label className="block text-sm text-gray-700 mt-4">
                      Feedback
                    </label>
                    <textarea
                      id={`feedback-${key}`}
                      className="w-full p-2 border border-gray-300 rounded-md mt-2"
                      placeholder="Enter feedback"
                      defaultValue={
                        deliverables?.[key]?.supervisorFeedback || ""
                      }
                    ></textarea>
                    <div className="flex  gap-3">
                      <button
                        className="bg-lime-600 px-4  py-2 justify-start text-white text-center rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out"
                        onClick={() =>
                          handleSubmitGrade(
                            deliverablesId?.toString()!,
                            key as unknown as Deliverable
                          )
                        }
                      >
                        Submit
                      </button>
                      <button
                        className="bg-cyan-600 px-4  py-2 justify-start text-white text-center rounded-lg hover:bg-cyan-700 transition duration-200 ease-in-out"
                        onClick={() => openModal(key as unknown as Deliverable)}
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                )}

                <button
                  disabled={!file}
                  className={`flex items-center gap-2 mt-2 px-4 py-2 rounded-lg transition w-full text-center ${
                    !file
                      ? "bg-gray-400 text-gray-700 cursor-not-allowed "
                      : "bg-teal-700 text-white hover:bg-teal-800"
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

        {showModalPublish && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
              <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
                Confirm Publish Grades
              </h2>
              <p className="text-center text-gray-700 mb-6">
                Confirming this action will show the assigned student(s) the
                grade saved for this document.
              </p>
              <div className="flex justify-between">
                <button
                  onClick={closeModal}
                  className="bg-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handlePublishGrade(deliverablesId?.toString()!)
                  }
                  className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition duration-200 ease-in-out"
                >
                  Confirm Publish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
