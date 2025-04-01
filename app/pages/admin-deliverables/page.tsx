"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Deliverable } from "@/types/deliverable";
import PageNotFound from "@/components/PageNotFound";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Programme } from "@/types/programme";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { Project } from "@/types/projects";
import { User } from "@/types/users";

export default function DeliverableDashboard() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery]= useState<string>("");
  const [selectedDeliverable, setSelectedDeliverable] =
    useState<Deliverable | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        const res = await fetch("/api/deliverables");
        const data = await res.json();

        const filteredDeliverables = data.filter((deliverable: Deliverable) => {
         
          const matchesSearchQuery =
            searchQuery === "" ||
            deliverable.projectId.title.toLowerCase().includes(searchQuery.toLowerCase()) 

            return matchesSearchQuery;
        })
        setDeliverables(filteredDeliverables);
      } catch (error) {
        console.error("Error fetching deliverables:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users"); // Fetch users
        const data = await res.json();
        console.log(data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();

       
        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchDeliverables();
    fetchUsers();
    fetchProjects();
  }, [searchQuery]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const columns = [
      "Project Title",
      "Students",
      "StudentsId",
      "Outline Document Grade",
      "Extended Abstract",
      "Provisional Second-Reader Final Grades",
      "Provisional Supervisor Final Grades",
      "Final Grades",
    ];

    const rows = deliverables.map((deliverable) => [
      deliverable.projectId?.title,
      deliverable.projectId?.projectAssignedTo?.studentsId
        ?.map((student: string) => student.name)
        .join(",") || "No Students",
      deliverable.projectId.projectAssignedTo?.studentsId
        ?.map((s) => {
          const student = users.find((user) => user._id === s._id); // Match user ID
          return student?.email.split("@")[0] || "Unknown"; // Extract email username
        })
        .join(", ") || "No Students",
      deliverable.outlineDocument.supervisorGrade || "N/A",
      deliverable.extendedAbstract.supervisorGrades || "N/A",
      deliverable.finalReport.secondReaderInitialGrade || "N/A",
      deliverable.finalReport.supervisorInitialGrade || "N/A",
      deliverable.finalReport.supervisorGrade || "N/A",
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
    });

    doc.save("deliverables-list.pdf");
  };

  const handleDownloadCSV = () => {
    if (!deliverables.length) {
      alert("No data available to download.");
      return;
    }

    const filteredDeliverables = deliverables.map((row) => ({
      "Project Title": row.projectId?.title || "N/A",
      Supervisor:
        row.projectId?.projectAssignedTo?.supervisorId || "No Supervisor",
      Students:
        row.projectId?.projectAssignedTo?.studentsId
          ?.map((s) => s.name)
          .join(", ") || "No Students",
      "Student Email":
        row.projectId?.projectAssignedTo?.studentsId
          ?.map((s) => {
            const student = users.find((user) => user._id === s._id);
            return student?.email || "N/A";
          })
          .join(", ") || "No Emails",
      "Outline Document Submitted": row.outlineDocument?.file ? "Yes" : "No",
      "Extended Abstract Submitted": row.extendedAbstract?.file ? "Yes" : "No",
      "Final Report Submitted": row.finalReport?.file ? "Yes" : "No",
      "Outline Document Grade": row.outlineDocument?.supervisorGrade || "N/A",
      "Extended Document Grade": row.extendedAbstract?.supervisorGrade || "N/A",
      "Second-Reader Provisional Grade":
        row.finalReport?.secondReaderInitialGrade || "N/A",
      "Supervisor Provisional Grade":
        row.finalReport?.supervisorInitialGrade || "N/A",
      "Final Grade": row.finalReport?.supervisorGrade || "N/A",
    }));

    const csv = Papa.unparse(filteredDeliverables); // Convert JSON to CSV
    const blob = new Blob([csv], { type: "text/csv" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "deliverables_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up
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

  const handlePrint = () => {
    const doc = new jsPDF();
    const columns = [
      "Project Title",
      "Supervisor",
      "Students",
      "StudentsId",
      "Outline Document Grade",
      "Extended Abstract",
      "Provisional Second-Reader Final Grades",
      "Provisional Supervisor Final Grades",
      "Final Grades",
    ];

    const rows = deliverables.map((deliverable) => [
      deliverable.projectId?.title,
      deliverable.projectId?.projectAssignedTo?.supervisorId || "No Supervisor",
      deliverable.projectId?.projectAssignedTo?.studentsId
        ?.map((student: string) => student.name)
        .join(",") || "No Students",
      deliverable.projectId.projectAssignedTo?.studentsId
        ?.map((s) => {
          const student = users.find((user) => user._id === s._id); // Match user ID
          return student?.email.split("@")[0] || "Unknown"; // Extract email username
        })
        .join(", ") || "No Students",
      deliverable.outlineDocument.supervisorGrade || "N/A",
      deliverable.extendedAbstract.supervisorGrades || "N/A",
      deliverable.finalReport.secondReaderInitialGrade || "N/A",
      deliverable.finalReport.supervisorInitialGrade || "N/A",
      deliverable.finalReport.supervisorGrade || "N/A",
    ]);
    autoTable(doc, {
      head: [columns],
      body: rows,
    });

    const pdfUrl = doc.output("bloburl");
    window.open(pdfUrl, "_blank"); // Open in a new tab
  };

  const columns = [
    {
      name: "Project Title",
      selector: (row: Deliverable) => row.projectId.title,
      sortable: true,
      width: "180px",
    },
    {
      name: "Supervisor",
      selector: (row: Project) =>
        row.projectId.projectAssignedTo?.supervisorId.name,
      width: "170px",
    },
    {
      name: "Students",
      selector: (row: Project) =>
        row.projectId.projectAssignedTo?.studentsId
          ?.map((s) => s.name)
          .join(", ") || "No Students",
      width: "170px",
    },
    {
      name: "Student Id",
      selector: (row: Project) =>
        row.projectId.projectAssignedTo?.studentsId
          ?.map((s) => {
            const student = users.find((user) => user._id === s._id); // Match user ID
            return student?.email.split("@")[0] || "Unknown"; // Extract email username
          })
          .join(", ") || "No Students",
      width: "170px",
    },
    {
      name: "Outline Document",
      selector: (row: Deliverable) => (row.outlineDocument?.file ? "✅" : "❌"),
      cell: (row: any) => (
        <div style={{ textAlign: "center", fontSize: "1.5rem", width: "100%" }}>
          {row.outlineDocument?.file ? "✅" : "❌"}
        </div>
      ),
      center: true,
      width: "90px",
    },
    {
      name: "Extended Abstract",
      selector: (row: Deliverable) =>
        row.extendedAbstract?.file ? "✅" : "❌",
      cell: (row: any) => (
        <div style={{ textAlign: "center", fontSize: "1.5rem", width: "100%" }}>
          {row.extendedAbstract?.file ? "✅" : "❌"}
        </div>
      ),
      center: true,
      width: "90px",
    },
    {
      name: "Final Report",
      selector: (row: Deliverable) => (row.finalReport?.file ? "✅" : "❌"),
      cell: (row: any) => (
        <div style={{ textAlign: "center", fontSize: "1.5rem", width: "100%" }}>
          {row.finalReport?.file ? "✅" : "❌"}
        </div>
      ),
      center: true,
      width: "90px",
    },
    {
      name: "Outline Document Grade",
      selector: (row: Deliverable) =>
        row.outlineDocument?.supervisorGrade || "N/A",
      sortable: true,
      width: "90px",
    },
    {
      name: "Extended Document Grade",
      selector: (row: Deliverable) =>
        row.extendedAbstract?.supervisorGrade || "N/A",
      sortable: true,
      width: "90px",
    },
    {
      name: "Second-Reader Final Provisional Grade",
      selector: (row: Deliverable) =>
        row.finalReport?.secondReaderInitialGrade || "N/A",
      sortable: true,
      width: "90px",
    },
    {
      name: "Supervisor Final Provisional Grade",
      selector: (row: Deliverable) =>
        row.finalReport?.supervisorInitialGrade || "N/A",
      sortable: true,
      width: "90px",
    },
    {
      name: "Final Grade",
      selector: (row: Deliverable) => row.finalReport?.supervisorGrade || "N/A",
      sortable: true,
      width: "90px",
    },
    {
      name: "Actions",
      cell: (row: Project) => (
        <div className="flex gap-2">
          <button
            onClick={() => downloadDeliverables(row.projectId._id)}
            className="bg-emerald-800 text-white px-3 py-1 rounded hover:bg-emerald-900"
          >
            Download
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6">
      <div className="bg-white w-full lg:max-w-none p-6 rounded-lg">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Deliverables Management</h1>
  
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Deliverables..."
            className="w-full sm:w-1/2 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 transition"
          />
        </div>
  
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={deliverables}
            pagination
            highlightOnHover
          />
        </div>
  
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-6">
          <button
            onClick={handleDownloadPDF}
            className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 w-full sm:w-auto text-center"
          >
            Save as PDF
          </button>
  
          <button
            onClick={handleDownloadCSV}
            className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 w-full sm:w-auto text-center"
          >
            Save as CSV
          </button>
  
          <button
            onClick={handlePrint}
            className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 w-full sm:w-auto text-center"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
  
  
}
