import { Deliverable } from "@/types/deliverable";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { IDeliverables } from "../models/Deliverables";

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

export const expandedRowContent = ({ row }: { row: IDeliverables }) => {
  // console.log("Row", row.data.finalReport.supervisorFeedback.Analysis);
  // console.log("Row", row.data.finalReport.supervisorInitialFeedback.Analysis);
  console.log(row);
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
      Analysis: row.data.extendedAbstract.supervisorFeedback.Analysis,
      Design: row.data.extendedAbstract.supervisorFeedback.Design,
      Implementation:
        row.data.extendedAbstract.supervisorFeedback.Implementation,
      Writing: row.data.extendedAbstract.supervisorFeedback.Writing,
      Evaluation: row.data.extendedAbstract.supervisorFeedback.Evaluation,
      "Overall Achievement":
        row.data.extendedAbstract.supervisorFeedback.OverallAchievement,
    },
    finalReport: {
      supervisorInitialFeedback: {
        Analysis: row.data.finalReport?.supervisorInitialFeedback.Analysis,
        Design: row.data.finalReport?.supervisorInitialFeedback.Design,
        Implementation:
          row.data.finalReport?.supervisorInitialFeedback.Implementation,
        Writing: row.data.finalReport?.supervisorInitialFeedback.Writing,
        Evaluation: row.data.finalReport?.supervisorInitialFeedback.Evaluation,
        "Overall Achievement":
          row.data.finalReport?.supervisorInitialFeedback.OverallAchievement,
      },
      supervisorFeedback: {
        Analysis: row.data.finalReport?.supervisorFeedback.Analysis,
        Design: row.data.finalReport?.supervisorFeedback.Design,
        Implementation: row.data.finalReport?.supervisorFeedback.Implementation,
        Writing: row.data.finalReport?.supervisorFeedback.Writing,
        Evaluation: row.data.finalReport?.supervisorFeedback.Evaluation,
        "Overall Achievement":
          row.data.finalReport?.supervisorFeedback.OverallAchievement,
      },
    },
  });

  const [secondReaderFeedback, setsecondReaderFeedback] = useState({
    finalReport: {
      Analysis: row.secondReaderInitialFeedback?.finalReport?.Analysis,
      Design: row.secondReaderInitialFeedback?.finalReport?.Design,
      Implementation:
        row.secondReaderInitialFeedback?.finalReport?.Implementation,
      Writing: row.secondReaderInitialFeedback?.finalReport?.Writing,
      Evaluation: row.secondReaderInitialFeedback?.finalReport?.Evaluation,
      OverallAchievement:
        row.secondReaderInitialFeedback?.finalReport?.OverallAchievement,
    },
  });

  const [isOutlineOpen, setOutlineOpen] = useState(false);
  const [isAbstractOpen, setAbstractOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const [isInitialReportOpen, setInitialReportOpen] = useState(false);
  const [isSubmitReportOpen, setSubmitReportOpen] = useState(false);

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

  const viewDeliverableInitial = async (deliverableId: string) => {
    alert(deliverableId);
    return;
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

        updateData = {
          [`${deliverableType}.${feedbackType}`]: feedback, // Update only the specific field
        };
        console.log(feedback);
      } else {
        feedback = supervisorFeedback?.[deliverableType] || {};
        updateData = {
          [`${deliverableType}.supervisorFeedback`]: {
            ...feedback,
          },
        };
      }
      console.log("Update Data", updateData);

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

          <button
            onClick={() => handleSubmitFeedback("outlineDocument")}
            className="p-2 text-sm bg-lime-800 text-white rounded-lg hover:bg-lime-900 "
          >
            Submit Feedback
          </button>
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
                  className="p-2 w-full border rounded-md focus:outline-none focus:ring-lime-500"
                  rows={4}
                ></textarea>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extended Abstract Section */}
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

          <button
            onClick={() => handleSubmitFeedback("extendedAbstract")}
            className="p-2 text-sm bg-lime-800 text-white rounded-lg hover:bg-lime-900 focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            Submit Feedback
          </button>
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
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                  rows={4}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Final Section */}
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
                  onClick={() => viewDeliverableInitial("")}
                  className="p-2 text-sm bg-lime-700 text-white rounded-lg hover:bg-lime-800 "
                >
                  View Feedback
                </button>

                <button
                  onClick={() =>
                    handleSubmitFeedback(
                      "finalReport",
                      "supervisorInitialFeedback"
                    )
                  }
                  className="p-2 text-sm bg-lime-800 text-white rounded-lg hover:bg-lime-900 "
                >
                  Submit Feedback
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
                      className="w-full p-2 border rounded-md "
                      rows={4}
                    />
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
              <div></div>

              <button
                onClick={() =>
                  handleSubmitFeedback("finalReport", "supervisorFeedback")
                }
                className="p-2 text-sm bg-lime-800 text-white rounded-lg hover:bg-lime-900 "
              >
                Submit Feedback
              </button>
            </div>
          </>
        )}

        {isSubmitReportOpen && (
          <div className="max-h-96 overflow-y-auto space-y-4">
            {Object.keys(supervisorFeedback.finalReport.supervisorFeedback).map(
              (key) => (
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
                    className="w-full p-2 border rounded-md "
                    rows={4}
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
