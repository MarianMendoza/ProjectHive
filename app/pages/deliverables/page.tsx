"use client"
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaCloudUploadAlt, FaDownload } from "react-icons/fa";
import { useSession } from "next-auth/react";  // Import session hook
import { Deliverable } from "@/types/deliverable"; 

export default function DeliverablesPage() {
  const { data: session } = useSession();  // Access session data
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  const [deliverables, setDeliverables] = useState<{
    [key: string]: Deliverable}> 
  ({
    outlineDocument: {
      file: "",
      uploadedAt: "",
      deadline: "",
      description:
        "A one-page document consisting of a short analysis of the project in the student's own words and a broad plan of the steps to complete the work. The supervisor should give the pass mark if and only if s/he is convinced that this document demonstrates that the student has understood the FYP.",
      supervisorGrade: 0,
      supervisorFeedback: "",
      secondReaderGrade: 0,
      secondReaderFeedback: "",
    },
    extendedAbstract: {
      file: "",
      uploadedAt: "",
      deadline: "",
      description:
        "A written document of about 5 pages. It must contain a summary of the most important findings of the work undertaken. The format should allow for consistent reading, similar to a journal publication.\nThe purpose of this stage is to ensure that the student starts to write their final report in a timely fashion. The assessment and feedback should focus on the quality of the document and not on the technical quality of work per se. A pass judgment for this stage should not be construed as a promise that the work as a whole is pass-worthy.",
      supervisorGrade: 0,
      supervisorFeedback: "",
      secondReaderGrade: 0,
      secondReaderFeedback: "",
    },
    finalReport: {
      file: "",
      uploadedAt: "",
      deadline: "",
      description:
        "Report writing guidelines were given separately. Upload instructions: Prepare a zip or tar.gz archive with your report as PDF in the folder root and one sub-folder with all source code you wrote as part of your FYP. If you have any online demonstration, create a file with the name demo.html with clickable links and add it also to the root folder of the archive. Maximum file size for this upload: 70MB.",
      supervisorGrade: 0,
      supervisorFeedback: "",
      secondReaderGrade: 0,
      secondReaderFeedback: "",
    },
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [supervisorId, setSupervisorId] = useState<string | null>(null); // State to hold supervisor ID

  useEffect(() => {
    const fetchDeliverables = async () => {
      if (!projectId) return;

      try {
        const res = await fetch(`/api/deliverables?projectId=${projectId}`);
        if (res.ok) {
          const data = await res.json();
          console.log(data.deliverables);
          setSupervisorId(data.deliverables.projectId.projectAssignedTo.supervisorId?._id)


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


  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    if (!e.target.files) return;

    setDeliverables({
      ...deliverables,
      [type]: {
        ...deliverables[type as keyof typeof deliverables],
        file: e.target.files[0].name,
        uploadedAt: new Date().toISOString(),
      },
    });
  };

  const handleSaveChanges = async () => {
    if (!projectId) return;

    try {
      const res = await fetch(`/api/deliverables?projectId=${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliverables),
      });

      if (res.ok) {
        alert("Deliverables updated successfully.");
      } else {
        alert("Failed to update deliverables.");
      }
    } catch (error) {
      console.error("Error updating deliverables", error);
    }
  };

  // Check if the session user ID matches the supervisor ID
  const canSubmitGrade = session?.user?.id === supervisorId;

  if (loading)
    return <p className="text-center text-lg text-gray-600">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center mt-10 bg-cover bg-center">
      <h3 className="text-2xl font-bold mb-2 text-center">
        Manage Deliverables
      </h3>

      <div className="w-full max-w-3xl p-6">
        <p className="text-gray-600 text-center mb-6">
          Upload and manage the necessary documents for your project. Ensure all
          files are submitted before their deadlines.
        </p>

        {Object.entries(deliverables).map(
          ([key, { file, uploadedAt, deadline, description }]) => (
            <div key={key} className="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm">
              <h4 className="text-lg font-semibold capitalize text-gray-700">
                {key.replace(/([A-Z])/g, " $1")}
              </h4>

              <p className="text-sm text-gray-600">
                <strong>Due Date:</strong> {deadline || "Not set"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Last Uploaded:</strong>{" "}
                {uploadedAt ? new Date(uploadedAt).toLocaleString() : "Never"}
              </p>
              <p className="text-sm text-gray-600 mb-4">{description}</p>

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
                    <span className="text-lime-600 font-semibold">browse</span>
                  </span>
                </label>
                <input
                  type="file"
                  id={key}
                  className="hidden"
                  onChange={(e) => handleFileChange(e, key)}
                />
              </div>

              {canSubmitGrade && (
                <div className="mt-4">
                  <label className="block text-sm text-gray-700">Grade Out Of 100</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    placeholder="Enter grade"
                  />
                  <label className="block text-sm text-gray-700 mt-4">Feedback</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    placeholder="Enter feedback"
                  ></textarea>
                </div>

                
              )}
              


              <button
                disabled={!file}
                className={`flex items-center gap-2 mt-2  px-4 py-2 rounded-lg  transition w-full text-center ${
                  !file
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed "
                    : "bg-yellow-600 text-white hover:bg-yellow-700"
                }`}
              >
                <FaDownload />
                Download {file || ""}
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
