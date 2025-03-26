"use client";
import { IDeliverables } from "@/types/deliverable";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";
import { useSocket } from "@/app/provider";

export default function DeliverablePage({
  params,
}: {
  params: { id: string; type: string };
}) {
  const { id, type } = params;
  const socket = useSocket();
  const { data: session } = useSession();
  const [isViewingCounterpart, setIsViewingCounterpart] = useState(false);
  const [counterpartFeedback, setCounterpartFeedback] = useState<
    typeof feedback | null
  >(null);
  const [counterpartGrade, setCounterpartGrade] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deliverable, setDeliverables] = useState<IDeliverables | null>(null);
  const [grade, setGrade] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("");

  const decodedType = decodeURIComponent(type);
  const [supervisor, isSupervisor] = useState<boolean>(false);
  const [file, setFile] = useState<string | null>(null);
  const [secondReader, isSecondReader] = useState<boolean>(false);
  const formattedType = decodedType
    .toLowerCase()
    .replace(/\s(.)/g, (match) => match.toUpperCase())
    .replace(/\s+/g, "");
  const isFinalReportSecondReaderViewOnly =
    secondReader && formattedType === "finalReport";

  const [feedback, setFeedback] = useState({
    Analysis: "",
    Design: "",
    Implementation: "",
    Writing: "",
    Evaluation: "",
    "Overall Achievement": "",
  });

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

        setDeliverables(data);
      } catch (err) {
        console.error("Error fetching deliverable:", err);
        setError("An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverables();
  }, [id, type]);

  useEffect(() => {
    if (!deliverable || !session) return;

    const project = deliverable.deliverables?.projectId?.projectAssignedTo;
    const userId = session.user.id.toString();

    const isUserSupervisor = project?.supervisorId?._id === userId;
    const isUserSecondReader = project?.secondReaderId?._id === userId;

    isSupervisor(isUserSupervisor);
    isSecondReader(isUserSecondReader);

    let feedbackSource = null;

    if (formattedType === "provisionalReport") {
      if (isUserSupervisor) {
        feedbackSource =
          deliverable.deliverables?.finalReport.supervisorInitialFeedback;
        setGrade(
          deliverable.deliverables?.finalReport?.supervisorInitialGrade || 0
        );
        setFile(deliverable.deliverables?.finalReport.file || null);
      } else if (isUserSecondReader) {
        feedbackSource =
          deliverable.deliverables?.finalReport.secondReaderInitialFeedback;
        setGrade(
          deliverable.deliverables?.finalReport?.secondReaderInitialGrade || 0
        );
        setFile(deliverable.deliverables?.finalReport.file || null);
      }
    } else if (formattedType === "finalReport") {
      feedbackSource =
        deliverable.deliverables?.[formattedType]?.supervisorFeedback;
      setGrade(deliverable.deliverables?.[formattedType]?.supervisorGrade || 0);
      setFile(deliverable.deliverables?.[formattedType]?.file || null);
    } else {
      if (isUserSupervisor) {
        feedbackSource =
          deliverable.deliverables?.[formattedType]?.supervisorFeedback;
        setGrade(
          deliverable.deliverables?.[formattedType]?.supervisorGrade || 0
        );
        setFile(deliverable.deliverables?.[formattedType]?.file || null);
      }
    }

    if (feedbackSource) {
      setFeedback({
        Analysis: feedbackSource.Analysis || "",
        Design: feedbackSource.Design || "",
        Implementation: feedbackSource.Implementation || "",
        Writing: feedbackSource.Writing || "",
        Evaluation: feedbackSource.Evaluation || "",
        "Overall Achievement": feedbackSource.OverallAchievement || "",
      });
    }
  }, [deliverable, session]);

  const handleSaveFeedback = async () => {
    if (!deliverable || !session) return;

    try {
      const updateData: any = {};
      const isUserSupervisor = supervisor;
      const isUserSecondReader = secondReader;

      if (formattedType === "provisionalReport") {
        if (isUserSupervisor) {
          updateData["finalReport.supervisorInitialFeedback"] = feedback;
          updateData["finalReport.supervisorInitialGrade"] = grade;
        } else if (isUserSecondReader) {
          updateData["finalReport.secondReaderInitialFeedback"] = feedback;
          updateData["finalReport.secondReaderInitialGrade"] = grade;
        }
      } else if (formattedType === "finalReport") {
        if (isUserSupervisor) {
          updateData[`${formattedType}.supervisorFeedback`] = feedback;
          updateData[`${formattedType}.supervisorGrade`] = grade;
        }
      } else {
        if (isUserSupervisor) {
          updateData[`${formattedType}.supervisorFeedback`] = feedback;
          updateData[`${formattedType}.supervisorGrade`] = grade;
        }
      }

      const res = await fetch(`/api/deliverables/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error("Failed to update deliverables.");
      }
      alert("Saved feedback!");
    } catch (error) {
      console.error(error);
      alert("An error occurred while submitting feedback.");
    }
  };

  const handlePublish = () => {
    if (formattedType === "finalReport") {
      setIsModalOpen(true);
    } else {
      handleConfirmSubmit();
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      const updateData: any = {};
      const userId = session.user.id;
      const projectId = id;
      const isUserSupervisor = supervisor;
      const isUserSecondReader = secondReader;

      if (formattedType === "provisionalReport") {
        if (isUserSupervisor) {
          updateData["finalReport.supervisorInitialSubmit"] = true;
          const receiversId = [
            deliverable.deliverables.projectId.projectAssignedTo.secondReaderId
              ._id,
          ];
          const type = "SubmitSupervisor";

          if (socket) {
            socket.emit("sendNotification", {
              userId,
              receiversId,
              projectId,
              type,
            });
          }
        } else if (isUserSecondReader) {
          updateData["finalReport.secondReaderInitialSubmit"] = true;
          const receiversId = [
            deliverable.deliverables.projectId.projectAssignedTo.supervisorId
              ._id,
          ];
          const type = "SubmitSecondReader";

          if (socket) {
            socket.emit("sendNotification", {
              userId,
              receiversId,
              projectId,
              type,
            });
          }
        }
      } else if (formattedType === "finalReport") {
        if (!userName) {
          alert("Please enter your name to sign.");
          return;
        }
        if (isUserSupervisor) {
          updateData["finalReport.supervisorSigned"] = true;
          const userId = session.user.id;
          const receiversId = [
            deliverable.deliverables.projectId.projectAssignedTo.secondReaderId
              ._id,
          ];
          const projectId = id;
          const type = "SupervisorSigned";

          if (socket) {
            socket.emit("sendNotification", {
              userId,
              receiversId,
              projectId,
              type,
            });
          }
        } else if (isUserSecondReader) {
          updateData["finalReport.secondReaderSigned"] = true;
          const userId = session.user.id;
          const receiversId = [
            deliverable.deliverables.projectId.projectAssignedTo.supervisorId
              ._id,
          ];
          const projectId = id;
          const type = "SecondReaderSigned";

          if (socket) {
            socket.emit("sendNotification", {
              userId,
              receiversId,
              projectId,
              type,
            });
          }
        }

        const supervisorSigned =
          deliverable?.deliverables?.finalReport?.supervisorSigned ||
          (isUserSupervisor && session.user.name === userName);

        const secondReaderSigned =
          deliverable?.deliverables?.finalReport?.secondReaderSigned ||
          (isUserSecondReader && session.user.name === userName);

        if (supervisorSigned && secondReaderSigned) {
          updateData["finalReport.isPublished"] = true;

          const receiversId =
            deliverable.deliverables.projectId.projectAssignedTo.studentsId;
          const type = "finalReportPublished";

          if (socket) {
            socket.emit("sendNotification", {
              userId,
              receiversId,
              projectId,
              type,
            });
          }
        }
      } else {
        if (isUserSupervisor) {
          updateData[`${formattedType}.isPublished`] = true;
          let type = "";

          switch (formattedType) {
            case "outlineDocument":
              type = "outlineDocumentPublished";
              break;
            case "extendedAbstract":
              type = "extendedAbstractPublished";
              break;
            default:
              type = "";
              break;
          }
        }
      }

      const res = await fetch(`/api/deliverables/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error("Failed to publish feedback.");
      }

      alert("Feedback successfully published!");
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("An error occurred during publishing.");
    }
  };

  const handleFeedbackChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    field: string
  ) => {
    setFeedback({
      ...feedback,
      [field]: e.target.value,
    });
  };

  const handleDownload = (fileName: string): void => {
    const link: HTMLAnchorElement = document.createElement("a");
    link.href = fileName;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white  p-6 sm:p-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-lime-800">
          {deliverable?.deliverables.projectId?.title}
        </h1>
        <h2 className="text-base sm:text-lg text-center text-gray-500 mb-8">
          {decodedType}
        </h2>
       

        <div className="flex justify-center gap-6">
          {file ? (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => handleDownload(file)}
                className="flex items-center gap-2 px-5 py-2 bg-lime-700 text-white font-medium rounded-full shadow-md hover:bg-lime-800 transition"
              >
                <FaDownload className="text-white" />
                Download Document
              </button>
            </div>
          ) : (
            <div className="flex justify-center mb-6">
              <button
                disabled
                className="flex items-center gap-2 px-5 py-2 bg-gray-300 text-gray-600 font-medium rounded-full cursor-not-allowed"
              >
                <FaDownload />
                File not available
              </button>
            </div>
          )}

          {formattedType === "provisionalReport" && (
            <div className="flex justify-center mb-6">
              {supervisor &&
                deliverable?.deliverables?.finalReport
                  ?.secondReaderInitialSubmit && (
                  <button
                    className={`px-5 py-2 rounded-full transition font-medium ${
                      isViewingCounterpart
                        ? "bg-lime-700 hover:bg-lime-800 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                    }`}
                    onClick={() => {
                      if (isViewingCounterpart) {
                        setCounterpartFeedback(null);
                        setCounterpartGrade(null);
                        setIsViewingCounterpart(false);
                      } else {
                        const srFeedback =
                          deliverable.deliverables.finalReport
                            .secondReaderInitialFeedback;
                        const srGrade =
                          deliverable.deliverables.finalReport
                            .secondReaderInitialGrade;
                        setCounterpartFeedback(srFeedback);
                        setCounterpartGrade(srGrade);
                        setIsViewingCounterpart(true);
                      }
                    }}
                  >
                    {isViewingCounterpart
                      ? "Back to Your Feedback"
                      : "View Second Reader Feedback"}
                  </button>
                )}

              {secondReader &&
                deliverable?.deliverables?.finalReport
                  ?.supervisorInitialSubmit && (
                  <button
                    className={`px-5 py-2 rounded-full transition font-medium ${
                      isViewingCounterpart
                        ? "bg-lime-700 hover:bg-lime-800 text-white"
                        : "bg-gray-300 hover:bg-gray-400 text-gray-800"
                    }`}
                    onClick={() => {
                      if (isViewingCounterpart) {
                        setCounterpartFeedback(null);
                        setCounterpartGrade(null);
                        setIsViewingCounterpart(false);
                      } else {
                        const spFeedback =
                          deliverable.deliverables.finalReport
                            .supervisorInitialFeedback;
                        const spGrade =
                          deliverable.deliverables.finalReport
                            .supervisorInitialGrade;
                        setCounterpartFeedback(spFeedback);
                        setCounterpartGrade(spGrade);
                        setIsViewingCounterpart(true);
                      }
                    }}
                  >
                    {isViewingCounterpart
                      ? "Back to Your Feedback"
                      : "View Supervisor Feedback"}
                  </button>
                )}
            </div>
          )}
        </div>

        {/* Grade Slider */}
        <div className="mb-10">
          <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2 text-center">
            Grade (out of 100)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-center">
            <input
              type="range"
              min="0"
              max="100"
              value={isViewingCounterpart ? counterpartGrade ?? 0 : grade}
              disabled={
                isFinalReportSecondReaderViewOnly || isViewingCounterpart
              }
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full sm:w-3/4 appearance-none accent-lime-500"
              style={{
                background: `linear-gradient(to right, #84cc16 ${
                  isViewingCounterpart ? counterpartGrade ?? 0 : grade
                }%, #f3f4f6 ${
                  isViewingCounterpart ? counterpartGrade ?? 0 : grade
                }%)`,
                height: "8px",
                borderRadius: "9999px",
                outline: "none",
                cursor:
                  isFinalReportSecondReaderViewOnly || isViewingCounterpart
                    ? "not-allowed"
                    : "pointer",
              }}
            />
            <div className="text-lg font-bold text-lime-600">
              {isViewingCounterpart ? counterpartGrade ?? 0 : grade}/100
            </div>
          </div>
        </div>

        {isViewingCounterpart && (
          <div className="text-center text-md mb-6 ">
            You are currently viewing{" "}
            {supervisor ? "Second Reader's" : "Supervisor's"} feedback.
          </div>
        )}

        {/* Feedback Form */}
        <form className="space-y-10">
          {Object.entries(feedback).map(([field, value]) => {
            const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

            return (
              <div key={field} className="space-y-3">
                <label className="block text-base sm:text-lg font-semibold text-gray-700">
                  {field}
                </label>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 transition"
                  value={
                    isViewingCounterpart
                      ? counterpartFeedback?.[field] ?? ""
                      : value
                  }
                  onChange={(e) => handleFeedbackChange(e, field)}
                  rows={4}
                  readOnly={
                    isFinalReportSecondReaderViewOnly || isViewingCounterpart
                  }
                />
                <div className="text-right text-sm text-gray-500">
                  {wordCount}/300 words
                </div>
              </div>
            );
          })}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            {!isFinalReportSecondReaderViewOnly && !isViewingCounterpart && (
              <button
                onClick={() => handleSaveFeedback()}
                type="button"
                className="w-full sm:w-auto px-6 py-3 bg-lime-600 text-white rounded-full shadow-md hover:bg-lime-700 transition"
              >
                Save Feedback
              </button>
            )}

            {!isViewingCounterpart && (
              <button
                onClick={() => handlePublish()}
                type="button"
                className="w-full sm:w-auto px-6 py-3 bg-lime-800 text-white rounded-full shadow-md hover:bg-lime-900 transition"
              >
                Publish
              </button>
            )}
          </div>
        </form>
      </div>
      {isModalOpen && formattedType === "finalReport" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
            <p className="text-sm text-gray-600 mb-4">
              Please type your name to confirm your signature on this final
              report.
            </p>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="bg-lime-600 text-white px-4 py-2 rounded hover:bg-lime-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
