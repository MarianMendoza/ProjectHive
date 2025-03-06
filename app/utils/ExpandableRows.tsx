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
  console.log("Row", row);
  const [supervisorFeedback, setSupervisorFeedback] = useState({
    outlineDocument: {
      Analysis: row.data.outlineDocument.supervisorFeedback?.Analysis || "",
      Design: row.data.outlineDocument.supervisorFeedback?.Design || "",
      Implementation: row.data.outlineDocument.supervisorFeedback?.Implementation|| "",
      Writing: row.data.outlineDocument.supervisorFeedback?.Writing|| "",
      Evaluation: row.data.outlineDocument.supervisorFeedback?.Evaluation|| "",
      OverallAchievement:
        row.data.supervisorFeedback?.outlineDocument?.OverallAchievement || "",
    },
    extendedAbstract: {
      Analysis: row.data.supervisorFeedback?.extendedAbstract?.Analysis,
      Design: row.data.supervisorFeedback?.extendedAbstract?.Design,
      Implementation: row.data.supervisorFeedback?.extendedAbstract?.Implementation,
      Writing: row.data.supervisorFeedback?.extendedAbstract?.Writing,
      Evaluation: row.data.supervisorFeedback?.extendedAbstract?.Evaluation,
      OverallAchievement:
        row.data.supervisorFeedback?.extendedAbstract?.OverallAchievement,
    },
    finalReport: {
      Analysis: row.supervisorFeedback?.finalReport?.Analysis,
      Design: row.supervisorFeedback?.finalReport?.Design,
      Implementation: row.supervisorFeedback?.finalReport?.Implementation,
      Writing: row.supervisorFeedback?.finalReport?.Writing,
      Evaluation: row.supervisorFeedback?.finalReport?.Evaluation,
      OverallAchievement:
        row.supervisorFeedback?.finalReport?.OverallAchievement,
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

  console.log(supervisorFeedback);


  let feedbackText;

  const handleFeedbackChange = (
    documentType: string,
    key: string,
    value: string
  ) => {
    setSupervisorFeedback((prev) => ({
      ...prev,
      [documentType]: {
        ...prev[documentType],
        [key]: value, // Update the specific field under the correct document type
      },
    }));
  };

  const handleSubmitFeedback = async (deliverableType: string) => {
    let feedbackText = "";
    const rowId = row.data._id;

    // Get the feedback for the specified deliverable type
    const feedbackForDeliverable = supervisorFeedback[deliverableType];

    const updateData = {
      [deliverableType]: {
        supervisorFeedback: feedbackForDeliverable,
      },
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
        throw new Error("Failed too update deliverables.");
      }

      const result = await res.json();
      alert(`Feedback submitted successfully for ${deliverableType}.`);
      console.log("Update  deliverables:", result);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred while submitting feedback.");
    }

    // Check if the deliverable type exists in the supervisorFeedback state
    if (feedbackForDeliverable) {
      for (const [key, value] of Object.entries(feedbackForDeliverable)) {
        feedbackText += `${key}: ${value}\n\n`; // Concatenate feedback for each key
      }
    } else {
      feedbackText = "Invalid deliverable type!";
    }

    // Show the feedback in an alert
    // alert(`Submitted Feedback for ${deliverableType}:\n\n${feedbackText}`);
  };

  return (
    <div>
      {/* Outline Document Section */}
      <div className="border-b-2 p-2 border-gray-200 ">
        <div className="flex  items-center justify-between">
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
            className="p-2 text-sm bg-lime-800 text-white rounded-lg hover:bg-lime-900 focus:outline-none focus:ring-2 focus:ring-lime-500"
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
                  value={
                    supervisorFeedback.outlineDocument[key] ??
                    "Write feedback in here.."
                  }
                  placeholder="Write feedback in here...."
                  onChange={(e) =>
                    handleFeedbackChange("outlineDocument", key, e.target.value)
                  }
                  className="p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
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
                  value={
                    supervisorFeedback.extendedAbstract[
                      key as keyof typeof supervisorFeedback.extendedAbstract
                    ]
                  }
                  onChange={(e) =>
                    handleFeedbackChange(
                      "extendedAbstract",
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
        <div className="flex  items-center justify-between">
          <button
            onClick={() => setReportOpen((prev) => !prev)}
            className="gap-2 text-left flex text-black font-semibold text-sm"
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

          <button
            onClick={() => handleSubmitFeedback("finalReport")}
            className="p-2 text-sm bg-lime-800 text-white rounded-lg hover:bg-lime-900 focus:outline-none focus:ring-2 focus:ring-lime-500"
          >
            Submit Feedback
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

              <button
                onClick={() => handleSubmitFeedback("finalReport")}
                className="p-2 text-sm bg-lime-800 text-white rounded-lg hover:bg-lime-900 focus:outline-none focus:ring-2 focus:ring-lime-500"
              >
                Submit Feedback
              </button>
            </div>

            {isInitialReportOpen && (
              <div className="max-h-96 overflow-y-auto space-y-4">
                {Object.keys(supervisorFeedback.finalReport).map((key) => (
                  <div key={key} className="my-2">
                    <label className="block font-medium">{key}:</label>
                    <textarea
                      value={
                        supervisorFeedback.finalReport[
                          key as keyof typeof supervisorFeedback.finalReport
                        ]
                      }
                      onChange={(e) =>
                        handleFeedbackChange("finalReport", key, e.target.value)
                      }
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
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

              <button
                onClick={() => handleSubmitFeedback("finalReport")}
                className="p-2 text-sm bg-lime-800 text-white rounded-lg hover:bg-lime-900 focus:outline-none focus:ring-2 focus:ring-lime-500"
              >
                Submit Feedback
              </button>
            </div>
          </>
        )}

        {isSubmitReportOpen && (
          <div className="max-h-96 overflow-y-auto space-y-4">
            {Object.keys(supervisorFeedback.finalReport).map((key) => (
              <div key={key} className="my-2">
                <label className="block font-medium">{key}:</label>
                <textarea
                  value={
                    supervisorFeedback.finalReport[
                      key as keyof typeof supervisorFeedback.finalReport
                    ]
                  }
                  onChange={(e) =>
                    handleFeedbackChange("finalReport", key, e.target.value)
                  }
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500"
                  rows={4}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
