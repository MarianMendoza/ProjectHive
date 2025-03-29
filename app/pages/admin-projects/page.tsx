"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Project } from "@/types/projects";
import { User } from "@/types/users";
import PageNotFound from "@/components/PageNotFound";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Programme } from "@/types/programme";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";

export default function ProjectDashboard() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editedProject, setEditedProject] = useState<Project | null>(null);

  const [newProgramme, setNewProgramme] = useState("");
  const [programme, setProgramme] = useState<Programme[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        const filteredProjects = data.filter((project: Project) => {
       
          const matchesSearchQuery =
            searchQuery === "" ||
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.projectAssignedTo?.authorId?.name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase());
            
              return matchesSearchQuery;

        });
        
        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    const fetchProgramme = async () => {
      try {
        const res = await fetch("/api/programmes");
        const data = await res.json();
        setProgramme(data);
      } catch (error) {
        console.error("Error fetching programmes:", error);
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
    fetchProgramme();
    fetchProjects();
    fetchUsers();
  }, [searchQuery]);

  const handleAddProgrammes = async () => {
    try {
      const res = await fetch("/api/programmes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProgramme }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(result.message || "Programme added successfully.");
        setProgramme((prevProgrammes) => [
          ...prevProgrammes,
          { name: newProgramme },
        ]);
        setNewProgramme("");
      } else {
        alert("Failed to add programme");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      alert("An error occurred while adding the tag.");
    }
  };

  const handleRemoveProgrammes = async (id: string) => {
    if (!confirm("Are you sure you want to delete this programmes?")) return;
    if (!id) {
      console.error("Programme ID is missing");
      return;
    }
    try {
      const res = await fetch(`/api/programmes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProgramme(
          programme.filter((currentProgramme) => currentProgramme._id !== id)
        );
        alert("Programme deleted successfully");
      } else {
        alert("Failed to delete tag");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const columns = [
      "Project Title",
      "Supervisor",
      "Second-Reader",
      "Student(s)",
      "OutlineDocument",
      "Extended Abstract",
      "FinalReport",
    ];

    const rows = projects.map((project) => [
      project.title,
      project.projectAssignedTo.supervisorId?.name || "Not Assigned",
      project.projectAssignedTo.secondReaderId?.name || "Not Assigned",
      project.projectAssignedTo.studentsId
        ?.map((student) => student.name)
        .join(", ") || "No Students",
      project.deliverables.outlineDocument?.file ? "Uploaded" : "N/A",
      project.deliverables.extendedAbstract?.file ? "Uploaded" : "N/A",
      project.deliverables.finalReport?.file ? "Uploaded" : "N/A",
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
      students:
        projectAssignedTo.studentsId
          ?.map((student) => student.name)
          .join(", ") || "No Students",
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
    const columns = [
      "Project Title",
      "Supervisor",
      "Second-Reader",
      "Student(s)",
      "Deliverables",
    ];

    const rows = projects.map((project) => [
      project.title,
      project.projectAssignedTo.supervisorId?.name || "Not Assigned", // Ensure we get the name, fallback if null
      project.projectAssignedTo.secondReaderId?.name || "Not Assigned", // Same for second reader
      project.projectAssignedTo.studentsId
        ?.map((student) => student.name)
        .join(", ") || "No Students", // Join student names
      "", // Placeholder for Deliverables
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
      const response = await fetch(
        `/api/get-deliverables?projectId=${projectId}`
      );
      const data = await response.json();

      if (!response.ok || !data.fileUrls) {
        throw new Error(data.error || "Failed to fetch deliverables");
      }

      const { outlineDocument, extendedAbstract, finalReport } = data.fileUrls;
      const deliverablesToDownload = [
        outlineDocument,
        extendedAbstract,
        finalReport,
      ].filter(Boolean);

      if (deliverablesToDownload.length === 0) {
        alert("No deliverables available for download.");
        return;
      }

      deliverablesToDownload.forEach((fileUrl) => {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.setAttribute(
          "download",
          fileUrl.split("/").pop() || "deliverable"
        );
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
      width: "180px",
    },
    {
      name: "Supervisor",
      selector: (row: Project) =>
        row.projectAssignedTo?.supervisorId?.name || "Not Assigned",
      width: "170px",
    },
    {
      name: "Second Reader",
      selector: (row: Project) =>
        row.projectAssignedTo?.secondReaderId?.name || "Not Assigned",
      width: "170px",
    },
    {
      name: "Students",
      selector: (row: Project) =>
        row.projectAssignedTo?.studentsId?.map((s) => s.name).join(", ") ||
        "No Students",
      width: "170px",
    },
    {
      name: "Outline Document",
      selector: (row: Project) =>
        row.deliverables?.outlineDocument?.file ? "✅" : "❌",
      cell: (row: any) => (
        <div style={{ textAlign: "center", fontSize: "1.5rem", width: "100%" }}>
          {row.deliverables?.outlineDocument?.file ? "✅" : "❌"}
        </div>
      ),
      center: true,
      width: "90px",
    },
    {
      name: "Extended Abstract",
      selector: (row: Project) =>
        row.deliverables?.extendedAbstract?.file ? "✅" : "❌",
      cell: (row: any) => (
        <div style={{ textAlign: "center", fontSize: "1.5rem", width: "100%" }}>
          {row.deliverables?.extendedAbstract?.file ? "✅" : "❌"}
        </div>
      ),
      center: true,
      width: "90px",
    },
    {
      name: "Final Report",
      selector: (row: Project) =>
        row.deliverables?.finalReport?.file ? "✅" : "❌",
      cell: (row: any) => (
        <div style={{ textAlign: "center", fontSize: "1.5rem", width: "100%" }}>
          {row.deliverables?.finalReport?.file ? "✅" : "❌"}
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
            className="bg-emerald-800 text-white px-3 py-1 rounded hover:bg-emerald-900"
          >
            Download
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
    <div className="p-6 flex gap-4">
      <div className="bg-white h-full w-3/4 p-4 rounded-lg">
      <h1 className="text-xl mb-2">Project Management</h1>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Projects..."
          className="w-1/2 p-2 mb-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 transition duration-200 ease-in-out"
        />
        <DataTable
          className="h-full overflow-auto w-3/4"
          columns={columns}
          data={projects}
          pagination
          highlightOnHover
        />

        <div className="flex mt-6 gap-4">
          <button
            onClick={handleDownloadPDF}
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800"
          >
            Save as PDF
          </button>

          <button
            onClick={handleDownloadCSV}
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800"
          >
            Save as CSV
          </button>

          <button
            onClick={handlePrint}
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800"
          >
            Print
          </button>
        </div>
      </div>
      {/* Save PDF,CSV */}

      <div className="bg-white h-full mb-4 p-4 w-1/4">
        <h2 className="text-lg mb-4 mt-8 text-gray-800">Add Programmes</h2>

        <div className="flex justify-between gap-3 mb-6">
          <input
            type="text"
            placeholder="Enter Programmes e.g. BSc"
            value={newProgramme}
            onChange={(e) => setNewProgramme(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg w-full sm:w-2/3 h-10 focus:outline-none focus:ring-2 focus:ring-emerald-700 transition duration-300"
          />
          <button
            onClick={handleAddProgrammes}
            className="bg-emerald-800 h-10 text-sm text-white w-1/3 sm:w-1/4 px-4 py-2 rounded-lg hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition duration-300"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {programme.map((programme, index) => (
            <div
              key={index}
              className="flex items-center bg-emerald-200 text-emerald-900 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition duration-300"
            >
              <span>{programme.name}</span>
              <button
                onClick={() => handleRemoveProgrammes(programme._id)}
                className="ml-2 text-emerald-900 hover:text-red-600 transition duration-300"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
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
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-emerald-600 text-white px-4 py-2 rounded"
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
