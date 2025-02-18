"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import PageNotFound from "@/components/PageNotFound";

export default function ProjectDashboard() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editedProject, setEditedProject] = useState({
    title: "",
    supervisor : "",
    secondReader: "",
    students: []
  })
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

  const handleEdit = (project: string) => {
    setSelectedProject(project);
    setEditedProject({ ...project});
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const res = await fetch(`/api/projects/${selectedProject._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProject),
      });
      if (res.ok) {
        setProjects(
          projects.map((Project) =>
            project._id === selectedProject._id ? editedProject : project
          )
        );
        alert("Project updated successfully");
        setIsModalOpen(false);
      } else {
        alert("Failed to update Project");
      }
    } catch (error) {
      console.error("Error updating Project:", error);
    }
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
    { name: "Project Title", selector: (row: any) => row.title, sortable: true, style: {
      whiteSpace: "normal", 
      wordWrap: "break-word", 
      maxWidth: "auto",
    }, },
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
            className="bg-lime-500 text-white px-3 py-1 rounded hover:bg-lime-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

   if (!session || session.user.role !== "Admin") {
        return <PageNotFound />;
      }

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

      <div className="flex mt-6 gap-4">
        <button
          onClick={handleDownloadPDF}
          className="bg-lime-500 text-white px-4 py-2 rounded-lg hover:bg-lime-600"
        >
          Save as PDF
        </button>
        <button
          onClick={() => alert("Feature coming soon!")}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          Print
        </button>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
            <label className="block mb-2">Project:</label>
            <textarea
              name="title"
              value={editedProject.title}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <label className="block mt-2 mb-2">Supervisor:</label>
            <textarea
              name="supervisor"
              value={editedProject.supervisor}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <label className="block mt-2 mb-2">Second Reader:</label>
            <textarea
              name="secondReader"
              value={editedProject.secondReader}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
                        <label className="block mt-2 mb-2">Students:</label>
            <textarea
              name="secondReader"
              value={editedProject.students}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
           
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveChanges}
                className="bg-lime-500 text-white px-4 py-2 rounded hover:bg-lime-600"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
