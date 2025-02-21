"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Project } from "@/types/projects";
import { User } from "@/types/users";
import PageNotFound from "@/components/PageNotFound";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

export default function ProjectDashboard() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editedProject, setEditedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        console.log(data);
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const users = await res.json();
        setLecturers(users.filter((user: User) => user.role === "Lecturer"));
      } catch (error) {
        console.error("Error fetching Users:", error);
      }
    };

    fetchProjects();
    fetchUsers();
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const columns = ["Project Title", "Supervisor", "Second-Reader", "Student(s)", "OutlineDocument", "Extended Abstract", "FinalReport"];
  
    const rows = projects.map((project) => [
      project.title, 
      project.projectAssignedTo.supervisorId?.name || "Not Assigned",  
      project.projectAssignedTo.secondReaderId?.name || "Not Assigned", 
      project.projectAssignedTo.studentsId?.map(student => student.name).join(", ") || "No Students",
      project.deliverables.outlineDocument?.file ?  "Uploaded" : "N/A",
      project.deliverables.extendedAbstract?.file ?  "Uploaded" : "N/A",
      project.deliverables.finalReport?.file ?  "Uploaded" : "N/A",
    ]);
  
    autoTable(doc, {
      head: [columns], 
      body: rows,  
    });
  
    doc.save("project-list.pdf");
  };

  const handleDownloadCSV = () => {
    const filteredProjects = projects.map(({ title, projectAssignedTo }) => ({
      title,
      supervisor: projectAssignedTo.supervisorId?.name || "Not Assigned",
      secondReader: projectAssignedTo.secondReaderId?.name || "Not Assigned",
      students: projectAssignedTo.studentsId?.map(student => student.name).join(", ") || "No Students"
    }));
  
    const csv = Papa.unparse(filteredProjects); // Convert to CSV format
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "projects_data.csv";
    link.click();
  };
  
  


  const handlePrint = () => {
    const doc = new jsPDF();
    const columns = ["Project Title", "Supervisor", "Second-Reader", "Student(s)", "Deliverables"];
  
    const rows = projects.map((project) => [
      project.title, 
      project.projectAssignedTo.supervisorId?.name || "Not Assigned",  // Ensure we get the name, fallback if null
      project.projectAssignedTo.secondReaderId?.name || "Not Assigned", // Same for second reader
      project.projectAssignedTo.studentsId?.map(student => student.name).join(", ") || "No Students", // Join student names
      ""  // Placeholder for Deliverables
    ]);
  
    autoTable(doc, {
      head: [columns],
      body: rows,  
    });
  
    const pdfUrl = doc.output("bloburl");
    window.open(pdfUrl, "_blank"); // Open in a new tab
  };
  

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    const applicants = project.applicants || [];
    const students = applicants.map((applicant) => applicant.studentId);
    setStudents(students);
    setEditedProject({ ...project });
    setIsModalOpen(true);
    fetchDeliverables(project._id);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!editedProject) return;

    setEditedProject((prev) => ({
      ...prev!,
      projectAssignedTo: {
        ...prev!.projectAssignedTo,
        [name]: value === "" ? null : value, // Handle unassigning properly
      },
    }));
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!editedProject) return;

    const selectedIds = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );

    const updatedStudents = selectedIds.length === 0 ? [] : selectedIds;

    setEditedProject((prev) => ({
      ...prev!,
      projectAssignedTo: {
        ...prev!.projectAssignedTo,
        studentsId: updatedStudents,
      },
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedProject || !editedProject) return;
    console.log(editedProject);

    try {
      const res = await fetch(`/api/projects/${selectedProject._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProject),
      });

      if (res.ok) {
        const updatedProject = await res.json();
        setProjects((prev) =>
          prev.map((project) =>
            project._id === selectedProject._id ? updatedProject : project
          )
        );

        alert("Project updated successfully");
        setIsModalOpen(false);
      } else {
        alert("Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
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

  const downloadDeliverables = async (projectId: string) => {
    try {
      const response = await fetch(`/api/get-deliverables?projectId=${projectId}`);
      const data = await response.json();
  
      if (!response.ok || !data.fileUrls) {
        throw new Error(data.error || "Failed to fetch deliverables");
      }
  
      const { outlineDocument, extendedAbstract, finalReport } = data.fileUrls;
      const deliverablesToDownload = [outlineDocument, extendedAbstract, finalReport].filter(Boolean);
  
      if (deliverablesToDownload.length === 0) {
        alert("No deliverables available for download.");
        return;
      }
  
      deliverablesToDownload.forEach((fileUrl) => {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute("download", fileUrl.split("/").pop() || "deliverable");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  
      alert("Deliverables downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download deliverables.");
    }
  };
  
  
  

  const columns = [
    {
      name: "Project Title",
      selector: (row: Project) => row.title,
      sortable: true,
    },
    {
      name: "Supervisor",
      selector: (row: Project) =>
        row.projectAssignedTo?.supervisorId?.name || "Not Assigned",
    },
    {
      name: "Second Reader",
      selector: (row: Project) =>
        row.projectAssignedTo?.secondReaderId?.name || "Not Assigned",
    },
    {
      name: "Students",
      selector: (row: Project) =>
        row.projectAssignedTo?.studentsId?.map((s) => s.name).join(", ") ||
        "No Students",
    },
    {
      name: "Outline Document",
      selector: (row: Project) =>
        row.deliverables.outlineDocument?.file ? "✅" : "❌",
      cell: (row: any) => (
        <div style={{ textAlign: "center", fontSize: "1.5rem", width: "100%"}}>
          {row.deliverables.outlineDocument?.file ? "✅" : "❌"}
        </div>
      ),
      center: true,
      width: "90px",
    },
    {
      name: "Extended Abstract",
      selector: (row: Project) =>
        row.deliverables.extendedAbstract?.file ? "✅" : "❌",
      cell: (row: any) => (
        <div style={{ textAlign: "center", fontSize: "1.5rem", width: "100%"}}>
          {row.deliverables.extendedAbstract?.file ? "✅" : "❌"}
        </div>
      ),
      center: true,
      width: "90px", 
    },
    {
      name: "Final Report",
      selector: (row: Project) =>
        row.deliverables.finalReport?.file ? "✅" : "❌",
      cell: (row: any) => (
        <div style={{ textAlign: "center", fontSize: "1.5rem", width: "100%"}}>
          {row.deliverables.finalReport?.file ? "✅" : "❌"}
        </div>
      ),
      center: true,
      width: "90px", 
    },
    {
      name: "Actions",
      cell: (row: Project) => (
        <div className="flex gap-2">
          <button
            onClick={() => downloadDeliverables(row._id)}
            className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600"
          >
            Download
          </button>
          <button
            onClick={() => handleEdit(row)}
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
    <div className="p-6 h-max">
      <div className="bg-white h-full p-4 rounded-lg">
        <DataTable
          className="h-full"
          title="Project Management"
          columns={columns}
          data={projects}
          pagination
          highlightOnHover
        />
      </div>
       {/* Save PDF,CSV */}
       <div className="flex mt-6 gap-4">
          <button
            onClick={handleDownloadPDF}
            className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700"
          >
            Save as PDF
          </button>

          <button
            onClick={handleDownloadCSV}
            className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700"
          >
            Save as CSV
          </button>

          <button
            onClick={handlePrint}
            className="bg-lime-600 text-white px-4 py-2 rounded-lg hover:bg-lime-700"
          >
            Print
          </button>
        </div>

      {isModalOpen && editedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>

            <label className="block mt-2 mb-2">Supervisor:</label>
            <select
              name="supervisorId"
              value={editedProject.projectAssignedTo?.supervisorId || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Unassign</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer._id} value={lecturer._id}>
                  {lecturer.name}
                </option>
              ))}
            </select>

            <label className="block mt-2 mb-2">Second Reader:</label>
            <select
              name="secondReaderId"
              value={editedProject.projectAssignedTo?.secondReaderId || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Unassign</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer._id} value={lecturer._id}>
                  {lecturer.name}
                </option>
              ))}
            </select>

            <label className="block mt-2 mb-2">Students:</label>
            <select
              multiple
              name="studentsId"
              value={
                editedProject.projectAssignedTo?.studentsId?.map(
                  (student) => student._id
                ) || []
              }
              onChange={handleStudentChange}
              className="w-full p-2 border rounded"
            >
              {students
                .filter((student) => student && student._id) // Ensure student is valid and has _id
                .map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
            </select>

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-lime-500 text-white px-4 py-2 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
