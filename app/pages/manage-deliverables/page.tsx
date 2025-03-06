"use client";
import { Deliverable, IDeliverables } from "@/types/deliverable"; // Assuming IDeliverables is exported here
import { useSession } from "next-auth/react";
import {handleRowExpand,expandedRowContent} from "@/app/utils/ExpandableRows"; // Import functions
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Project } from "@/types/projects";

export default function ManageDeliverable() {
  const { data: session } = useSession();
  const [deliverables, setDeliverables] = useState<IDeliverables[]>([]); // Use IDeliverables instead of Deliverable
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [secondReaderDeliverables, setSecondReaderDeliverables] = useState<
    Project[]
  >([]);
  const [showSecondReader, setShowSecondReader] = useState(false);

  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        const res = await fetch("/api/deliverables");
        const data = await res.json();

        const filteredDeliverables = data.filter(
          (deliverable: IDeliverables) => {
            const isSupervisor =
              deliverable.projectId?.projectAssignedTo?.supervisorId._id ===
              session?.user.id;

            return isSupervisor;
          }
        );

        const secondReaderDeliverables = data.filter(
          (deliverable: IDeliverables) => {
            return (
              deliverable.projectId?.projectAssignedTo.secondReaderId?._id.toString() ===
              session?.user.id
            );
          }
        );
        setSecondReaderDeliverables(secondReaderDeliverables);
        setDeliverables(filteredDeliverables);
        // console.log(data);
      } catch (error) {
        console.error("Error fetching deliverables:", error);
      }
    };

    if (session?.user.id) {
      fetchDeliverables();
    }
  }, [session?.user.id]);

  const columns = [
    {
      name: "Deliverable Title",
      selector: (row: IDeliverables) => row.projectId?.title,
      sortable: true,
      width: "180px",
    },
    {
      name: "Supervisor",
      selector: (row: IDeliverables) =>
        row.projectId.projectAssignedTo?.supervisorId.name || "Not Assigned",
      width: "170px",
    },
    {
      name: "Second Reader",
      selector: (row: IDeliverables) =>
        row.projectId.projectAssignedTo?.secondReaderId?.name || "Not Assigned",
      width: "170px",
    },
    {
      name: "Students",
      selector: (row: IDeliverables) =>
        row.projectId.projectAssignedTo?.studentsId
          ?.map((s) => s.name)
          .join(", ") || "No Students",
      width: "170px",
    },
    {
      name: "Outline Document Grade",
      selector: (row: IDeliverables) =>
        row.outlineDocument?.supervisorGrade !== null
          ? row.outlineDocument?.supervisorGrade
          : "Not Graded",
      width: "100px",
    },
    {
      name: "Extended Abstract Grade",
      selector: (row: IDeliverables) =>
        row.extendedAbstract?.supervisorGrade !== null
          ? row.extendedAbstract?.supervisorGrade
          : "Not Graded",
      width: "100px",
    },
    {
      name: "Supervisor Initial Report Grade ",
      selector: (row: IDeliverables) =>
        row.finalReport?.supervisorInitialGrade !== null
          ? row.finalReport?.supervisorInitialGrade
          : "Not Graded",
      width: "100px",
    },
    {
      name: "Second Reader Initial Report Grade",
      selector: (row: IDeliverables) =>
        row.finalReport?.secondReaderInitialGrade !== null
          ? row.finalReport?.secondReaderInitialGrade
          : "Not Graded",
      width: "100px",
    },
    {
      name: "Final Report Grade",
      selector: (row: IDeliverables) =>
        row.finalReport?.supervisorGrade !== null
          ? row.finalReport?.supervisorGrade
          : "Not Graded",
      width: "100px",
    },
    
    

  ];

  const handleRowExpandClick = (row: IDeliverables) => {
    handleRowExpand(row, expandedRows, setExpandedRows);
  };

  const filteredDeliverables = showSecondReader
    ? secondReaderDeliverables
    : deliverables;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl text-center">
        {showSecondReader ? "Second Reader Deliverables" : "Deliverables"}
      </h1>
      <div className="p-2 w-auto mt-2 col-span-3">
        <button
          onClick={() => {
            setShowSecondReader(!showSecondReader);
          }}
          className={`px-1 py-2 rounded-lg text-sm transition duration-200 ${
            showSecondReader
              ? "bg-lime-700 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          Second Reader Deliverables
        </button>
        <DataTable
          columns={columns}
          data={filteredDeliverables}
          expandableRows
          expandOnRowClicked
          onRowClicked={handleRowExpandClick}
          expandableRowsComponent={(row) => expandedRowContent({ row })}
          expandableRowExpanded={(row) => expandedRows.includes(row._id)}
        />
      </div>
    </div>
  );
}
