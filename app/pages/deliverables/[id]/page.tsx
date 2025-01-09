"use client";
import { useEffect, useState } from "react";


interface Deliverable {
  file: string;
  uploadedAt: string;
  deadline: string;
}

interface Deliverables {
  outlineDocument: Deliverable;
  extendedAbstract: Deliverable;
  finalProjectReport: Deliverable;
}

const DeliverablesPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [deliverables, setDeliverables] = useState<Deliverables | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  console.log(id);
  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        const res = await fetch(`../api/deliverables/${id}`);
        const data = await res.json();

        if (res.ok) {
          setDeliverables(data.deliverables);
        } else {
          setError(data.message || "Failed to fetch deliverables.");
        }
      } catch (err) {
        console.error("Error fetching deliverables:", err);
        setError("Error fetching deliverables.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverables();
  }, [id]);

  const handleFileChange = (key: keyof Deliverables, file: File) => {
    if (deliverables) {
      setDeliverables({
        ...deliverables,
        [key]: { ...deliverables[key], file: file.name },
      });
    }
  };

  const handleDeadlineChange = (key: keyof Deliverables, deadline: string) => {
    if (deliverables) {
      setDeliverables({
        ...deliverables,
        [key]: { ...deliverables[key], deadline },
      });
    }
  };

  const handleSaveChanges = async () => {
    try {
      const res = await fetch(`../api/deliverables/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deliverables),
      });

      if (res.ok) {
        alert("Deliverables updated successfully.");
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to update deliverables.");
      }
    } catch (err) {
      console.error("Error updating deliverables:", err);
      setError("Error updating deliverables.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Project Deliverables</h2>

      {deliverables && (
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(deliverables).map(([key, value]) => (
            <div key={key} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700">Upload File:</label>
                  <input
                    type="file"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    onChange={(e) =>
                      handleFileChange(key as keyof Deliverables, e.target.files?.[0] || new File([], ""))
                    }
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700">Deadline:</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={value.deadline}
                    onChange={(e) => handleDeadlineChange(key as keyof Deliverables, e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            className="bg-lime-600 text-white px-6 py-2 rounded-md hover:bg-lime-700 mt-4"
            onClick={handleSaveChanges}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliverablesPage;
