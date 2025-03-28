"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function ViewFeedbackPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const { id } = params;
  const searchParams = useSearchParams();
  const feedbackType = searchParams.get("feedbackType");
  const [filteredDeliverable, setFilteredDeliverable] = useState<any>(null);

  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        const res = await fetch(`/api/deliverables/${id}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Deliverables Data:", data);

          const selectedFeedback = data.deliverables.finalReport[feedbackType];
          setFilteredDeliverable(selectedFeedback);
        } else {
          console.log("No deliverables found.");
        }
      } catch (error) {
        console.error("Error fetching deliverables:", error);
      }
    };

    fetchDeliverables();
  }, [id, feedbackType]);

  return (
    <div className="container w-full mx-auto p-6">
      <h3 className="text-2xl font-bold mb-6 text-center text-emerald-800">
        View Feedback
      </h3>

      {/* Show feedback if available */}
      {filteredDeliverable ? (
        <div className="w-full p-4 rounded-lg text-gray-800">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3">
            {feedbackType === "supervisorInitialFeedback" &&
              "Supervisor's Initial Feedback"}
            {feedbackType === "supervisorFeedback" &&
              "Supervisor's Final Feedback"}
            {feedbackType === "secondReaderInitialFeedback" &&
              "Second Reader's Initial Feedback"}
          </h3>

          {/* Feedback List */}
          <div className="space-y-3">
            {Object.entries(filteredDeliverable).map(([section, feedback]) => (
              <div key={section} className="border-b pb-2">
                <strong className="text-gray-800">{section}:</strong>
                <p className="mt-1 text-gray-800">
                  {feedback?.trim() ? (
                    feedback
                  ) : (
                    <span className="text-gray-500">No feedback provided</span>
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* Grades Section */}
          {feedbackType === "supervisorFeedback" &&
            deliverables?.finalReport?.supervisorGrade !== undefined && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-800 mb-2">
                  Final Grade:
                </h3>
                <div className="relative w-full bg-gray-200 rounded-lg h-6 overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 text-center text-white text-sm font-semibold flex items-center justify-center"
                    style={{
                      width: `${deliverables.finalReport.supervisorGrade}%`,
                    }}
                  >
                    {deliverables.finalReport.supervisorGrade}/100
                  </div>
                </div>
              </div>
            )}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center">
          No feedback available.
        </p>
      )}
    </div>
  );
}
