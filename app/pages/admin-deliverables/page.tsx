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

export default function DeliverableDashboard() {
  const { data: session } = useSession();
  const [selectedDeliverable, setSelectedDeliverable] =
    useState<Deliverable | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);

  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        const res = await fetch("/api/deliverables");
        const data = await res.json();
        console.log(data);
        setDeliverables(data);
      } catch (error) {
        console.error("Error fetching deliverables:", error);
      }
    };
    fetchDeliverables();
  }, []);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const columns = ["Project Title"];

    const rows = deliverables.map((deliverable) => [
      deliverable.projectId?.title,
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
    });

    doc.save("deliverables-list.pdf");
  };

  const handleDownloadCSV = () => {
    const filteredDeliverables = deliverables.map(({ title }) => ({
      title,
    }));

    const csv = Papa.unparse(filtereddeliverables); // Convert to CSV format
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "deliverables_data.csv";
    link.click();
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    const columns = ["Project Title"];

    const rows = deliverables.map((deliverable) => [
      deliverable.projectId.title,
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
  ];

  return (
    <div className="p-6 flex gap-4">
      <div className="bg-white h-full w-3/4 p-4 rounded-lg">
        <DataTable
          className="h-full overflow-auto w-3/4"
          title="Deliverable Management"
          columns={columns}
          data={deliverables}
          pagination
          highlightOnHover
        />

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
      </div>
    </div>
  );
}
