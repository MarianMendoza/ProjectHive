"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Deliverable, FinalReport } from "@/types/deliverable";

export default function ViewDeliverablesPage({params} : {params: {id:string}}) {
  const { data: session } = useSession();
  const {id} = params;

  const [deliverables, setDeliverables] = useState<
    Partial<Record<string, Deliverable | FinalReport>>
  >({});

  // Define allowed deliverables
  const deliverableCategories: Record<string, string> = {
    outlineDocument: "Outline Document",
    extendedAbstract: "Extended Abstract",
    finalReportProposal: "Final Report Proposal",
    finalReport: "Final Report",
  };

  useEffect(() => {
    const fetchDeliverables = async () => {

      try {
        const res = await fetch(`/api/deliverables/${id}`);
        if (res.ok) {
          const data = await res.json();
         
          console.log(data);
          // setDeliverables(filteredDeliverables);
        } else {
          console.log("No deliverables found.");
        }
      } catch (error) {
        console.error("Error fetching deliverables", error);
      }
    };

    fetchDeliverables();
  }, [id]);

  return (
    <div className="container w-full mx-auto p-6">
      <h3 className="text-2xl font-bold mb-6 text-center">
        View Deliverables Feedback
      </h3>
      <p className="text-gray-600 text-center mb-6">
        View the feedback provided by your supervisor for each deliverable.
      </p>

      {Object.entries(deliverables).map(([key, deliverable]) => (
        <div key={key} className="p-4 mb-4 bg-white rounded-lg shadow-lg">
          <h4 className="text-lg font-semibold capitalize text-lime-600">
            {deliverableCategories[key] || key.replace(/([A-Z])/g, " $1")}
          </h4>

          {deliverable.isPublished ? (
            <>
              <div className="mt-4 mb-4">
                <h3 className="text-small font-semibold text-gray-800 mb-2">
                  📋 Supervisor's Grade & Feedback
                </h3>

                {/* Display Progress Bar */}
                {deliverable.supervisorGrade !== undefined ? (
                  <div className="relative w-full bg-gray-200 rounded-lg h-6 overflow-hidden">
                    <div
                      className="h-full bg-lime-600 text-center text-white text-sm font-semibold flex items-center justify-center"
                      style={{
                        width: `${deliverable.supervisorGrade}%`,
                      }}
                    >
                      {deliverable.supervisorGrade}/100
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No grade assigned yet.
                  </p>
                )}

                {/* Feedback Section */}
                <div className="w-full p-2 border bg-gray-100 rounded-md mt-4 text-gray-700">
                  <strong>Feedback:</strong>
                  {deliverable.supervisorFeedback ? (
                    <p className="text-sm text-gray-600">
                      {Array.from(deliverable.supervisorFeedback.entries()).map(
                        ([section, feedback]) => (
                          <span key={section} className="block">
                            <strong>{section}:</strong> {feedback}
                          </span>
                        )
                      )}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No feedback provided yet.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">
              Deliverable not published yet.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
