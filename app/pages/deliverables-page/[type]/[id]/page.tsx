"use client";
import { IDeliverables } from "@/types/deliverable";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";

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
  const [grade, setGrade] = useState<number>(0);
  const decodedType = decodeURIComponent(type);
  const [supervisor, isSupervisor] = useState<boolean>(false);
  const [file, setFile] = useState<string | null>(null);
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
        feedbackSource = deliverable.deliverables?.finalReport.supervisorInitialFeedback;
        setGrade(deliverable.deliverables?.finalReport?.supervisorInitialGrade || 0);
        setFile(deliverable.deliverables?.finalReport.file || null);
      } else if (isUserSecondReader) {
        feedbackSource = deliverable.deliverables?.finalReport.secondReaderInitialFeedback;
        setGrade(deliverable.deliverables?.finalReport?.secondReaderInitialGrade || 0);
        setFile(deliverable.deliverables?.finalReport.file || null);
      }
    } else if (formattedType === "finalReport") {
      if (isUserSupervisor) {
        feedbackSource = deliverable.deliverables?.[formattedType]?.supervisorFeedback;
        setGrade(deliverable.deliverables?.[formattedType]?.supervisorGrade || 0);
        setFile(deliverable.deliverables?.[formattedType]?.file || null);
      }
    } else {
      if (isUserSupervisor) {
        feedbackSource = deliverable.deliverables?.[formattedType]?.supervisorFeedback;
        setGrade(deliverable.deliverables?.[formattedType]?.supervisorGrade || 0);

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
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full sm:w-3/4 appearance-none accent-lime-500"
              style={{
                background: `linear-gradient(to right, #84cc16 ${grade}%, #f3f4f6 ${grade}%)`,
                height: "8px",
                borderRadius: "9999px",
                outline: "none",
                cursor: "pointer",
              }}
            />
            <div className="text-lg font-bold text-lime-600">{grade}/100</div>
          </div>
        </div>

        

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
                  value={value}
                  onChange={(e) => handleFeedbackChange(e, field)}
                  rows={4}
                />
                <div className="text-right text-sm text-gray-500">
                  {wordCount}/300 words
                </div>
              </div>
            );
          })}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-3 bg-lime-600 text-white rounded-full shadow-md hover:bg-lime-700 transition"
            >
              Save Feedback
            </button>
            <button
              type="button"
              className="w-full sm:w-auto px-6 py-3 bg-lime-800 text-white rounded-full shadow-md hover:bg-lime-900 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
