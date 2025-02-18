"use client";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";

export default function ProjectDashboard() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects"); // Adjust API endpoint
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  const handleEdit = (id: string) => {
    alert(`Edit project with ID: ${id}`);
    // Implement your edit logic here
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProjects(projects.filter((project) => project._id !== id));
        alert("Project deleted successfully");
      } else {
        alert("Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Project List", 20, 10);

    const tableData = projects.map((project) => [
      project.title,
      project.projectAssignedTo?.authorId?.name || "N/A",
      project.projectAssignedTo?.secondReaderId?.name || "N/A",
      project.projectAssignedTo?.studentsId?.map((s) => s.name).join(", ") ||
        "N/A",
    ]);

    (doc as any).autoTable({
      head: [["Project Title", "Supervisor", "Second Reader", "Students"]],
      body: tableData,
    });

    doc.save("project_list.pdf");
  };

  const columns = [
    { name: "Project Title", selector: (row: any) => row.title, sortable: true },
    {
      name: "Supervisor",
      selector: (row: any) =>
        row.projectAssignedTo?.authorId?.name || "Not Assigned",
    },
    {
      name: "Second Reader",
      selector: (row: any) =>
        row.projectAssignedTo?.secondReaderId?.name || "Not Assigned",
    },
    {
      name: "Students",
      selector: (row: any) =>
        row.projectAssignedTo?.studentsId?.map((s) => s.name).join(", ") ||
        "No Students",
    },
    {
      name: "Deliverables",
      cell: (row: any) => (
        <div className="flex flex-wrap gap-2">
          {row.deliverables?.map((deliverable) => (
            <a
              key={deliverable._id}
              href={deliverable.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              {deliverable.name}
            </a>
          )) || "No Deliverables"}
        </div>
      ),
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row._id)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Project Management</h2>

      <div className="bg-white p-4 rounded-lg">
        <DataTable
          title="Projects"
          columns={columns}
          data={projects}
          pagination
          highlightOnHover
        />
      </div>

      <div className="flex justify-center mt-6 gap-4">
        <button
          onClick={handleDownloadPDF}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Save as PDF
        </button>
        <button
          onClick={() => alert("Feature coming soon!")}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
        >
          Export as CSV
        </button>
        <button
          onClick={() => alert("Feature coming soon!")}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Print
        </button>
      </div>
    </div>
  );
}
