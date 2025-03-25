"use client";
import { IDeliverables } from "@/types/deliverable";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function DeliverablePage({
  params,
}: {
  params: { id: string; type: string };
}) {
  const { id, type } = params;
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deliverable, setDeliverables] = useState<IDeliverables | null>(null);
  const decodedType = decodeURIComponent(type);
  const [supervisor, isSupervisor] = useState<boolean>(false);
  const [secondReader, isSecondReader] = useState<boolean>(false);
  const formattedType = decodedType
    .toLowerCase()
    .replace(/\s(.)/g, (match) => match.toUpperCase())
    .replace(/\s+/g, "");

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
        console.log(deliverable);

        const setSupervisor =
          deliverable?.deliverables?.projectId?.projectAssignedTo.supervisorId
            ._id == session?.user.id.toString();
        isSupervisor(setSupervisor);

        const setSecondReader =
          deliverable?.deliverables?.projectId?.projectAssignedTo.secondReaderId
            ._id == session?.user.id.toString();
        isSecondReader(setSecondReader);

        if (supervisor) {
          setFeedback({
            Analysis:
              deliverable?.deliverables?.[formattedType].supervisorFeedback
                .Analysis,
            Design:
              deliverable?.deliverables?.[formattedType].supervisorFeedback
                .Design,
            Implementation:
              deliverable?.deliverables?.[formattedType].supervisorFeedback
                .Implementation,
            Writing:
              deliverable?.deliverables?.[formattedType].supervisorFeedback
                .Writing,
            Evaluation:
              deliverable?.deliverables?.[formattedType].supervisorFeedback
                .Evaluation,
            "Overall Achievement":
              deliverable?.deliverables?.[formattedType].supervisorFeedback
                .OverallAchievement,
          });
        }

        console.log(deliverable);
      } catch (err) {
        console.error("Error fetching deliverable:", err);
        setError("An error occurred.");
      } finally {
        setLoading(false);
      }
    };
    

    fetchDeliverables();
  }, [id, type]);

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: string) => {
    setFeedback({
      ...feedback,
      [field]: e.target.value,
    });
  };


  return (
    <div>
      <h1>Project ID: {id}</h1>
      <h2>Type: {decodedType}</h2>

      <form className="space-y-6">
        {Object.entries(feedback).map(([field, value]) => (
          <div key={field} className="space-y-2">
            <label className="block text-lg font-medium text-gray-700">
              {field}
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md"
              value={value}
              onChange={(e) => handleFeedbackChange(e, field)}
              rows={4}
            />
          </div>
        ))}

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            type="button"
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            Save Feedback
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
