"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Deliverable } from "@/types/deliverable";

export default function ViewDeliverablesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [deliverables, setDeliverables] = useState<{
    [key: string]: Deliverable;
  }>({
    finalReport: {
      supervisorGrade: 0,
      supervisorFeedback: "",
      isPublished: false,
    },
  });


  useEffect(() => {
    const fetchDeliverables = async () => {
      if (!projectId) return;

      try {
        const res = await fetch(`/api/deliverables?projectId=${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setDeliverables(data.deliverables);
        } else {
          console.log("No deliverables found.");
        }
      } catch (error) {
        console.error("Error fetching deliverables", error);
      } 
    };

    fetchDeliverables();
  }, [projectId]);


  return (
    <div className=" container w-full mx-auto p-6">
      <h3 className="text-2xl font-bold mb-6 text-center">View Deliverables Feedback</h3>
      <p className="text-gray-600 text-center mb-6">
        View the feedback provided by your supervisor for each deliverable.
      </p>

      {Object.entries(deliverables).map(([key, { supervisorFeedback, supervisorGrade, isPublished }]) => (
        <div key={key} className="p-4 mb-4 bg-white rounded-lg shadow-lg">
          <h4 className="text-lg font-semibold capitalize text-lime-600">
            {key.replace(/([A-Z])/g, " $1")}
          </h4>

          {isPublished ? (
            <>
              <div className="mt-4 mb-4">
                <h3 className="text-small font-semibold text-gray-800 mb-2">
                  📋 Supervisor's Grade & Feedback
                </h3>
                {supervisorGrade ? (
                  <div className="relative w-full bg-gray-200 rounded-lg h-6 overflow-hidden">
                    <div
                      className="h-full bg-lime-600 text-center text-white text-sm font-semibold flex items-center justify-center"
                      style={{
                        width: `${supervisorGrade}%`,
                      }}
                    >
                      {supervisorGrade}/100
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No grade assigned yet.</p>
                )}

                <div className="w-full p-2 border bg-gray-100 rounded-md mt-4 text-gray-700">
                  <strong>Feedback:</strong>
                  {supervisorFeedback ? (
                    <p className="text-sm text-gray-600">{supervisorFeedback}</p>
                  ) : (
                    <p className="text-gray-500 text-sm">No feedback provided yet.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">Deliverable not published yet.</p>
          )}
        </div>
      ))}
    </div>
  );
}
