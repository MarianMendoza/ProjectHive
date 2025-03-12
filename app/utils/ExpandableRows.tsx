import { Deliverable } from "@/types/deliverable";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { IDeliverables } from "../models/Deliverables";
import { useSocket } from "@/app/provider";

export const handleRowExpand = (
  row: Deliverable,
  expandedRows: string[],
  setExpandedRows: React.Dispatch<React.SetStateAction<string[]>>
): void => {
  const isRowExpanded = expandedRows.includes(row.id);
  if (isRowExpanded) {
    setExpandedRows(expandedRows.filter((id) => id !== row.id)); // Collapse the row
  } else {
    setExpandedRows([...expandedRows, row.id]); // Expand the row
  }
};

export const expandedRowContent = ({
  row,
  showSecondReader,
}: {
  row: IDeliverables;
  showSecondReader: boolean;
}) => {
  const socket = useSocket();
  const { data: session } = useSession();
  const [supervisorFeedback, setSupervisorFeedback] = useState({
    outlineDocument: {
      Analysis: row.data.outlineDocument.supervisorFeedback?.Analysis,
      Design: row.data.outlineDocument.supervisorFeedback?.Design,
      Implementation:
        row.data.outlineDocument.supervisorFeedback?.Implementation,
      Writing: row.data.outlineDocument.supervisorFeedback?.Writing,
      Evaluation: row.data.outlineDocument.supervisorFeedback?.Evaluation,
      "Overall Achievement":
        row.data.outlineDocument.supervisorFeedback?.OverallAchievement,
    },
    extendedAbstract: {
      Analysis: row.data.extendedAbstract.supervisorFeedback?.Analysis,
      Design: row.data.extendedAbstract.supervisorFeedback?.Design,
      Implementation:
        row.data.extendedAbstract.supervisorFeedback?.Implementation,
      Writing: row.data.extendedAbstract.supervisorFeedback?.Writing,
      Evaluation: row.data.extendedAbstract.supervisorFeedback?.Evaluation,
      "Overall Achievement":
        row.data.extendedAbstract.supervisorFeedback?.OverallAchievement,
    },
    finalReport: {
      supervisorInitialFeedback: {
        Analysis: row.data.finalReport?.supervisorInitialFeedback?.Analysis,
        Design: row.data.finalReport?.supervisorInitialFeedback?.Design,
        Implementation:
          row.data.finalReport?.supervisorInitialFeedback?.Implementation,
        Writing: row.data.finalReport?.supervisorInitialFeedback?.Writing,
        Evaluation: row.data.finalReport?.supervisorInitialFeedback?.Evaluation,
        "Overall Achievement":
          row.data.finalReport?.supervisorInitialFeedback?.OverallAchievement,
      },
      supervisorFeedback: {
        Analysis: row.data.finalReport?.supervisorFeedback?.Analysis,
        Design: row.data.finalReport?.supervisorFeedback?.Design,
        Implementation:
          row.data.finalReport?.supervisorFeedback?.Implementation,
        Writing: row.data.finalReport?.supervisorFeedback?.Writing,
        Evaluation: row.data.finalReport?.supervisorFeedback?.Evaluation,
        "Overall Achievement":
          row.data.finalReport?.supervisorFeedback?.OverallAchievement,
      },
    },
  });

  const [secondReaderFeedback, setSecondReaderFeedback] = useState({
    finalReport: {
      secondReaderInitialFeedback: {
        Analysis: row.data.finalReport?.secondReaderInitialFeedback?.Analysis,
        Design: row.data.finalReport?.secondReaderInitialFeedback?.Design,
        Implementation:
          row.data.finalReport?.secondReaderInitialFeedback?.Implementation,
        Writing: row.data.finalReport?.secondReaderInitialFeedback?.Writing,
        Evaluation:
          row.data.finalReport?.secondReaderInitialFeedback?.Evaluation,
        "Overall Achievement":
          row.data.finalReport?.secondReaderInitialFeedback?.OverallAchievement,
      },
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOutlineOpen, setOutlineOpen] = useState(false);
  const [isAbstractOpen, setAbstractOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const [isInitialReportOpen, setInitialReportOpen] = useState(false);
  const [isSubmitReportOpen, setSubmitReportOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");

  const handleOpenModal = (userType: string) => {
    setIsModalOpen(true);
    setUserType(userType);
    setUserName("");
  };

  const handleConfirmSubmit = async (
    deliverableType: string,
    feedbackType?: string
  ) => {
    const rowId = row.data._id;
    let updateData = {};
    let feedback = {};

    if (userName === session?.user.name) {
      if (userType === "supervisor") {
        updateData = {
          [`${deliverableType}.${feedbackType}`]: feedback,
          [`${deliverableType}.supervisorSubmit`]: true,
          [`${deliverableType}.supervisorSigned`]: true,
        };

        const userId = session?.user.id;
        const receiversId = [
          row.data.projectId.projectAssignedTo.secondReaderId._id,
        ];
        const projectId = row.data.projectId._id;
        const type = "SupervisorSigned";

        if (socket) {
          socket.emit("sendNotification", {
            userId,
            receiversId,
            projectId,
            type,
          });
        }
      } else {
        updateData = {
          [`${deliverableType}.secondReaderSigned`]: true,
        };

        const userId = session?.user.id;
        const receiversId = [
          row.data.projectId.projectAssignedTo.supervisorId._id,
        ];
        const projectId = row.data.projectId._id;
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
    } else {
      alert("Username does not match.");
      setIsModalOpen(false);
    }
    try {
      const res = await fetch(`/api/deliverables/${rowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error("Failed to update deliverables.");
      }

      const result = await res.json();
      console.log("Updated deliverables:", result);

      handleSubmitFeedback("finalReport", "supervisorFeedback");

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating supervisor signature:", error);
      alert("An error occurred while submitting feedback.");
    }
  };

  const handleFeedbackChange = (
    documentType: string,
    feedbackCategory: string | undefined, // feedbackCategory could be undefined
    key: string,
    value: string
  ) => {
    setSupervisorFeedback((prev) => ({
      ...prev,
      [documentType]: {
        ...prev[documentType], // Preserve the existing document (e.g., outlineDocument, finalReport, etc.)
        // If there's no feedbackCategory, just update the field directly
        ...(feedbackCategory
          ? {
              [feedbackCategory]: {
                ...prev[documentType]?.[feedbackCategory], // Preserve existing feedback
                [key]: value, // Update the specific field
              },
            }
          : {
              [key]: value, // If there's no feedbackCategory, just update the key directly
            }),
      },
    }));
  };

  const handleSecondReaderFeedbackChange = (
    documentType: string,
    feedbackCategory: string | undefined, // feedbackCategory could be undefined
    key: string,
    value: string
  ) => {
    setSecondReaderFeedback((prev) => ({
      ...prev,
      [documentType]: {
        ...prev[documentType],
        ...(feedbackCategory
          ? {
              [feedbackCategory]: {
                ...prev[documentType]?.[feedbackCategory],
                [key]: value,
              },
            }
          : {
              [key]: value,
            }),
      },
    }));
  };

  const handleSubmitFeedback = async (
    deliverableType: string,
    feedbackType?: string // Specify type
  ) => {
    const rowId = row.data._id;
    let feedback = {};
    let updateData = {};

    try {
      if (deliverableType === "finalReport") {
        feedback = supervisorFeedback?.[deliverableType]?.[feedbackType] || {};

        if (feedbackType === "supervisorInitialFeedback") {
          updateData = {
            [`${deliverableType}.${feedbackType}`]: feedback,
            [`${deliverableType}.supervisorInitialSubmit`]: true,
          };

          const userId = session?.user.id;
          const receiversId = [
            row.data.projectId.projectAssignedTo.secondReaderId._id,
          ];
          const projectId = row.data.projectId._id;
          const type = "SubmitSupervisor";

          if (socket) {
            socket.emit("sendNotification", {
              userId,
              receiversId,
              projectId,
              type,
            });
          }
        } else {
          updateData = {
            [`${deliverableType}.${feedbackType}`]: feedback,
          };
        }
      } else {
        feedback = supervisorFeedback?.[deliverableType] || {};
        updateData = {
          [`${deliverableType}.supervisorFeedback`]: {
            ...feedback,
          },
        };
        console.log(updateData);
      }

      const res = await fetch(`/api/deliverables/${rowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error("Failed to update deliverables.");
      }

      const result = await res.json();

      console.log("Updated deliverables:", result);
    } catch (error) {
      alert("An error occurred while submitting feedback.");
    }
  };

  const handlePublish = async (deliverableType: string) => {
    const rowId = row.data._id;

    const updateData = {
      [`${deliverableType}.isPublished`]: true,
    };

    try {
      const res = await fetch(`/api/deliverables/${rowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error("Failed to update deliverables.");
      }

      let type = "";

      switch (deliverableType) {
        case "outlineDocument":
          type = "outlineDocumentPublished";
          break;
        case "extendedAbstract":
          type = "extendedAbstractPublished";
          break;
        case "finalReport":
          type = "finalReportPublished";
          break;
        default:
          type = "";
          break;
      }

      const userId = session?.user.id;
      const students = row.data.projectId.projectAssignedTo.studentsId || [];
      const receiversId = students.map((student: any) => student._id);
      const projectId = row.data.projectId._id;

      if (socket) {
        socket.emit("sendNotification", {
          userId,
          receiversId,
          projectId,
          type,
        });
      }

      alert(`This has published grades for ${deliverableType}.`);
    } catch (error) {
      alert("An error occurred while submitting feedback.");
    }
  };

  const handleSecondReaderSubmitFeedback = async (
    deliverableType: string,
    feedbackType?: string // Specify type
  ) => {
    const rowId = row.data._id;
    let feedback = {};
    let updateData = {};

    try {
      if (deliverableType === "finalReport") {
        feedback =
          secondReaderFeedback?.[deliverableType]?.[feedbackType] || {};

        if (feedbackType === "secondReaderInitialFeedback") {
          updateData = {
            [`${deliverableType}.${feedbackType}`]: feedback,
            [`${deliverableType}.secondReaderInitialSubmit`]: true,
          };

          const userId = session?.user.id;
          const receiversId = [
            row.data.projectId.projectAssignedTo.supervisorId._id,
          ];
          const projectId = row.data.projectId._id;
          const type = "SubmitSecondReader";

          if (socket) {
            socket.emit("sendNotification", {
              userId,
              receiversId,
              projectId,
              type,
            });
          }
        } else {
          updateData = {
            [`${deliverableType}.${feedbackType}`]: feedback,
          };
        }

        // console.log(feedback);
      } else {
        feedback = secondReaderFeedback?.[deliverableType] || {};
        updateData = {
          [`${deliverableType}.secondReaderFeedback`]: {
            ...feedback,
          },
        };
      }

      const res = await fetch(`/api/deliverables/${rowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error("Failed to update deliverables.");
      }

      const result = await res.json();

      console.log("Updated deliverables:", result);
    } catch (error) {
      alert("An error occurred while submitting feedback.");
    }
  };

  return (
    <div>
      {/* Outline Document Section */}
      {!showSecondReader && (
        <div className="border-b-2 p-2 border-gray-200 ">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setOutlineOpen((prev) => !prev)}
              className="gap-2 text-left flex text-black font-semibold text-sm"
            >
              <span className="ml-2">
                {isOutlineOpen ? (
                  <ChevronDown className="h-5 w-5 text-black" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-black" />
                )}
              </span>{" "}
              <span>Outline Document</span>
            </button>

            <div className="flex justify-between gap-2">
              <button
                onClick={() => handleSubmitFeedback("outlineDocument")}
                className="p-2 text-sm bg-lime-500 text-white rounded-lg hover:bg-lime-600 "
              >
                Submit Feedback
              </button>
              <button
                onClick={() => handlePublish("outlineDocument")}
                className="p-2 text-sm bg-orange-400 text-white rounded-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Publish
              </button>
            </div>
          </div>

          {isOutlineOpen && (
            <div className="max-h-96 overflow-y-auto m-2 space-y-6">
              {Object.keys(supervisorFeedback.outlineDocument).map((key) => (
                <div key={key}>
                  <label className="block">{key}:</label>
                  <textarea
                    placeholder="Write feedback in here..."
                    value={
                      supervisorFeedback.outlineDocument[
                        key as keyof typeof supervisorFeedback.outlineDocument
                      ] || ""
                    }
                    onChange={(e) =>
                      handleFeedbackChange(
                        "outlineDocument",
                        undefined,
                        key,
                        e.target.value
                      )
                    }
                    className="p-2 w-full border rounded-md focus:outline-none"
                    rows={4}
                    maxLength={1500}
                  ></textarea>
                  <div className="text-right text-sm text-gray-500 mt-2">
                    {(supervisorFeedback.outlineDocument[key] || "").length}
                    /1500 characters
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!showSecondReader && (
        <div className="border-b-2 p-2 border-gray-200 ">
          <div className="flex  items-center justify-between">
            <button
              onClick={() => setAbstractOpen((prev) => !prev)}
              className="gap-2 text-left flex text-black font-semibold text-sm"
            >
              <span className="ml-2">
                {isAbstractOpen ? (
                  <ChevronDown className="h-5 w-5 text-black" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-black" />
                )}
              </span>{" "}
              <span>Extended Abstract</span>
            </button>
            <div className="flex justify-between gap-2">
              <button
                onClick={() => handleSubmitFeedback("extendedAbstract")}
                className="p-2 text-sm bg-lime-500 text-white rounded-lg hover:bg-lime-600 focus:outline-none focus:ring-2 focus:ring-lime-500"
              >
                Submit Feedback
              </button>
              <button
                onClick={() => handlePublish("extendedAbstract")}
                className="p-2 text-sm bg-orange-400 text-white rounded-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Publish
              </button>
            </div>
          </div>

          {isAbstractOpen && (
            <div className="max-h-96 overflow-y-auto space-y-4">
              {Object.keys(supervisorFeedback.extendedAbstract).map((key) => (
                <div key={key} className="my-2">
                  <label className="block font-medium">{key}:</label>
                  <textarea
                    placeholder="Write feedback in here..."
                    value={
                      supervisorFeedback.extendedAbstract[
                        key as keyof typeof supervisorFeedback.extendedAbstract
                      ] || ""
                    }
                    onChange={(e) =>
                      handleFeedbackChange(
                        "extendedAbstract",
                        undefined,
                        key,
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-md focus:outline-none"
                    rows={4}
                    maxLength={1500}
                  />
                  <div className="text-right text-sm text-gray-500 mt-2">
                    {(supervisorFeedback.extendedAbstract[key] || "").length}
                    /1500 characters
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!showSecondReader && (
        <div className="border-b-2 p-2 border-gray-200 ">
          <div className="flex my-2 items-center justify-between">
            <button
              onClick={() => setReportOpen((prev) => !prev)}
              className="gap-2 text-left flex mb- text-black font-semibold text-sm"
            >
              <span className="ml-2">
                {isReportOpen ? (
                  <ChevronDown className="h-5 w-5 text-black" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-black" />
                )}
              </span>{" "}
              <span>Final Report</span>
            </button>
          </div>

          {isReportOpen && (
            <>
              <div className="flex my-2 items-center justify-between">
                <button
                  onClick={() => setInitialReportOpen((prev) => !prev)}
                  className="gap-2  text-left flex text-lime-900 font-semibold text-sm"
                >
                  <span className="ml-2">
                    {isInitialReportOpen ? (
                      <ChevronDown className="h-5 w-5 text-lime-900" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-lime-900" />
                    )}
                  </span>{" "}
                  <span>Provisional Report Grades</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleSubmitFeedback(
                        "finalReport",
                        "supervisorInitialFeedback"
                      )
                    }
                    className="p-2 text-sm bg-lime-500 text-white rounded-lg hover:bg-lime-600 "
                  >
                    Submit Feedback
                  </button>
                  <button
                    disabled={
                      !row.finalReport?.supervisorInitialSubmit ||
                      !row.finalReport?.secondReaderInitialSubmit
                    }
                    className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                      !row.finalReport?.supervisorInitialSubmit &&
                      !row.finalReport?.secondReaderInitialSubmit
                        ? "bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                        : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <Link
                      href={`/pages/view-feedback/${row.data._id}?feedbackType=secondReaderInitialFeedback`}
                    >
                      View Feedback
                    </Link>
                  </button>
                </div>
              </div>

              {isInitialReportOpen && (
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {Object.keys(
                    supervisorFeedback.finalReport.supervisorInitialFeedback
                  ).map((key) => (
                    <div key={key} className="my-2">
                      <label className="block font-medium">{key}:</label>
                      <textarea
                        placeholder="Write feedback in here..."
                        value={
                          supervisorFeedback.finalReport
                            .supervisorInitialFeedback[
                            key as keyof typeof supervisorFeedback.finalReport.supervisorInitialFeedback
                          ]
                        }
                        onChange={(e) =>
                          handleFeedbackChange(
                            "finalReport",
                            "supervisorInitialFeedback",
                            key,
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md focus:outline-none"
                        rows={4}
                        maxLength={1500}
                      />
                      <div className="text-right text-sm text-gray-500 mt-2">
                        {
                          (
                            supervisorFeedback.finalReport
                              .supervisorInitialFeedback[key] || ""
                          ).length
                        }
                        /1500 characters
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex my-2 items-center justify-between">
                <button
                  onClick={() => setSubmitReportOpen((prev) => !prev)}
                  className="gap-2 text-left flex text-lime-900 font-semibold text-sm"
                >
                  <span className="ml-2">
                    {isSubmitReportOpen ? (
                      <ChevronDown className="h-5 w-5 text-lime-900" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-lime-900" />
                    )}
                  </span>{" "}
                  <span>Final Report Grades</span>
                </button>
                <div className="flex justify-around gap-2">
                  <button
                    onClick={() => handleOpenModal("supervisor")}
                    className="p-2 text-sm bg-lime-500 text-white rounded-lg hover:bg-lime-600 "
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={() => handlePublish("finalReport")}
                    className="p-2 text-sm bg-orange-400 text-white rounded-lg hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    Publish
                  </button>
                </div>
              </div>
            </>
          )}

          {isSubmitReportOpen && (
            <div className="max-h-96 overflow-y-auto space-y-4">
              {Object.keys(
                supervisorFeedback.finalReport.supervisorFeedback
              ).map((key) => (
                <div key={key} className="my-2">
                  <label className="block font-medium">{key}:</label>
                  <textarea
                    placeholder="Write feedback in here..."
                    value={
                      supervisorFeedback.finalReport.supervisorFeedback[
                        key as keyof typeof supervisorFeedback.finalReport.supervisorFeedback
                      ]
                    }
                    onChange={(e) =>
                      handleFeedbackChange(
                        "finalReport",
                        "supervisorFeedback",
                        key,
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-md focus:outline-none"
                    rows={4}
                    maxLength={1500}
                  />
                  <div className="text-right text-sm text-gray-500 mt-2">
                    {
                      (
                        supervisorFeedback.finalReport.supervisorFeedback[
                          key
                        ] || ""
                      ).length
                    }
                    /1500 characters
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Second Reader */}

      {showSecondReader && (
        <div>
          <div className="border-b-2 p-2 border-gray-200 ">
            <div className="flex my-2 items-center justify-between">
              <button
                onClick={() => setReportOpen((prev) => !prev)}
                className="gap-2 text-left flex mb- text-black font-semibold text-sm"
              >
                <span className="ml-2">
                  {isReportOpen ? (
                    <ChevronDown className="h-5 w-5 text-black" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-black" />
                  )}
                </span>{" "}
                <span>Final Report</span>
              </button>
            </div>

            {isReportOpen && (
              <>
                <div className="flex my-2 items-center justify-between">
                  <button
                    onClick={() => setInitialReportOpen((prev) => !prev)}
                    className="gap-2  text-left flex text-lime-900 font-semibold text-sm"
                  >
                    <span className="ml-2">
                      {isInitialReportOpen ? (
                        <ChevronDown className="h-5 w-5 text-lime-900" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-lime-900" />
                      )}
                    </span>{" "}
                    <span>Provisional Report Grades</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleSecondReaderSubmitFeedback(
                          "finalReport",
                          "secondReaderInitialFeedback"
                        )
                      }
                      className="p-2 text-sm bg-lime-500 text-white rounded-lg hover:bg-lime-600 "
                    >
                      Submit Feedback
                    </button>
                    <button
                      disabled={
                        !row.finalReport?.supervisorInitialSubmit ||
                        !row.finalReport?.secondReaderInitialSubmit
                      }
                    >
                      <Link
                        className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                          !row.finalReport?.supervisorInitialSubmit &&
                          !row.finalReport?.secondReaderInitialSubmit
                            ? "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                            : "bg-gray-400 text-gray-600 cursor-not-allowed"
                        }`}
                        href={`/pages/view-feedback/${row.data._id}?feedbackType=supervisorInitialFeedback`}
                      >
                        View Feedback
                      </Link>
                    </button>
                  </div>
                </div>

                {isInitialReportOpen && (
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {Object.keys(
                      secondReaderFeedback.finalReport
                        .secondReaderInitialFeedback
                    ).map((key) => (
                      <div key={key} className="my-2">
                        <label className="block font-medium">{key}:</label>
                        <textarea
                          placeholder="Write feedback in here..."
                          value={
                            secondReaderFeedback.finalReport
                              .secondReaderInitialFeedback[
                              key as keyof typeof secondReaderFeedback.finalReport.secondReaderInitialFeedback
                            ]
                          }
                          onChange={(e) =>
                            handleSecondReaderFeedbackChange(
                              "finalReport",
                              "secondReaderInitialFeedback",
                              key,
                              e.target.value
                            )
                          }
                          className="w-full p-2 border rounded-md focus:outline-none"
                          rows={4}
                          maxLength={1500}
                        />
                        <div className="text-right text-sm text-gray-500 mt-2">
                          {
                            (
                              secondReaderFeedback.finalReport
                                .secondReaderInitialFeedback[key] || ""
                            ).length
                          }
                          /1500 characters
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex my-2 items-center justify-between">
                  <p className="gap-2 text-left flex text-lime-900 font-semibold text-sm">
                    Final Report Grades
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={row.finalReport?.supervisorSubmit}
                      onClick={() => handleOpenModal("secondReader")}
                      className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                        row.finalReport?.supervisorSubmit
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed" // Styles for disabled button
                          : "bg-teal-500 hover:bg-teal-600 text-white cursor-pointer" // Styles for enabled button
                      }`}
                    >
                      Sign Off
                    </button>

                    <button
                      disabled={row.finalReport?.supervisorSubmit}
                      className={`p-2 text-sm rounded-lg transition-all duration-200 ${
                        row.finalReport?.supervisorSubmit
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed" // Styles for disabled button
                          : "bg-orange-500 hover:bg-orange-600 text-white cursor-pointer" // Styles for enabled button
                      }`}
                    >
                      <Link
                        href={`/pages/view-feedback/${row.data._id}?feedbackType=supervisorFeedback`}
                      >
                        View Feedback
                      </Link>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
            <p className="text-sm text-gray-600 mb-4">
              Please type your name to confirm submission.
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
                onClick={() =>
                  handleConfirmSubmit("finalReport", "supervisorFeedback")
                }
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
};
