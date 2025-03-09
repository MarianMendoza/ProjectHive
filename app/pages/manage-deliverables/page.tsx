"use client";
import { Deliverable, IDeliverables } from "@/types/deliverable"; // Assuming IDeliverables is exported here
import { useSession } from "next-auth/react";
import {
  handleRowExpand,
  expandedRowContent,
} from "@/app/utils/ExpandableRows"; // Import functions
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Project } from "@/types/projects";
import { Row } from "jspdf-autotable";
import Link from "next/link";

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
        console.log(data);

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

  const [grades, setGrades] = useState<{ [key: string]: any }>({});

  const handleGradeChange = (
    row: any,
    field: string,
    value: any,
    type: string
  ) => {
    // Ensure the value being set is of the correct type (string or number)
    const finalValue = typeof value === "string" ? value.trim() : value;

    setGrades((prevGrades) => {
      const updatedGrades = {
        ...prevGrades,
        [row._id]: {
          ...(prevGrades[row._id] || {}),
          [field]: {
            ...(prevGrades[row._id]?.[field] || {}),
            [type]: finalValue, // Update the specific field or type of feedback within the field
          },
        },
      };
      return updatedGrades;
    });
  };

  // Update grade handler
  const handleUpdateGrade = async (deliverableId: string, updateData: any) => {
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        throw new Error(`Failed to update grades: ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Update successful:", data);
      return data;
    } catch (error) {
      console.error("Error updating grades", error);
    }
  };

  const columns = [
    {
      name: "Deliverable Title",
      selector: (row: any) => row.projectId?.title,
      sortable: true,
      width: "180px",
    },
    {
      name: "Supervisor",
      selector: (row: any) =>
        row.projectId.projectAssignedTo?.supervisorId.name || "Not Assigned",
      width: "170px",
    },
    {
      name: "Second Reader",
      selector: (row: any) =>
        row.projectId.projectAssignedTo?.secondReaderId?.name || "Not Assigned",
      width: "170px",
    },
    {
      name: "Students",
      selector: (row: any) =>
        row.projectId.projectAssignedTo?.studentsId
          ?.map((s: any) => s.name)
          .join(", ") || "No Students",
      width: "170px",
    },
    {
      name: "Outline Document Grade",
      selector: (row: any) => row.outlineDocument?.supervisorGrade || "",
      width: "120px",
      cell: (row: any) => (
        <textarea
          placeholder="N/A"
          value={
            grades[row._id]?.outlineDocument?.supervisorGrade ||
            row.outlineDocument?.supervisorGrade ||
            ""
          }
          onChange={(e) =>
            handleGradeChange(
              row,
              "outlineDocument",
              e.target.value,
              "supervisorGrade"
            )
          }
          className="w-full h-9 p-2 text-center rounded-md border border-gray-300 focus:outline-none focus:border-lime-500 transition-all resize-none"
        />
      ),
    },
    {
      name: "Extended Abstract Grade",
      selector: (row: any) => row.extendedAbstract?.supervisorGrade || "",
      width: "120px",
      cell: (row: any) => (
        <textarea
          placeholder="N/A"
          value={
            grades[row._id]?.extendedAbstract?.supervisorGrade ||
            row.extendedAbstract?.supervisorGrade ||
            ""
          }
          onChange={(e) =>
            handleGradeChange(
              row,
              "extendedAbstract",
              e.target.value,
              "supervisorGrade"
            )
          }
          className="w-full h-9 p-2 text-center rounded-md border border-gray-300 focus:outline-none focus:border-lime-500 transition-all resize-none"
        />
      ),
    },
    {
      name: "Supervisor Initial Report Grade",
      selector: (row: any) => row.finalReport?.supervisorInitialGrade || "",
      width: "120px",
      cell: (row: any) => (
        <textarea
          placeholder="N/A"
          value={
            grades[row._id]?.finalReport?.supervisorInitialGrade ||
            row.finalReport?.supervisorInitialGrade ||
            ""
          }
          onChange={(e) =>
            handleGradeChange(
              row,
              "finalReport",
              e.target.value,
              "supervisorInitialGrade"
            )
          }
          className="w-full h-9 p-2 text-center rounded-md border border-gray-300 focus:outline-none focus:border-lime-500 transition-all resize-none"
        />
      ),
    },
    {
      name: "Second Reader Initial Report Grade",
      selector: (row: any) => row.finalReport?.secondReaderInitialGrade || "",
      width: "120px",
      cell: (row: any) => (
        <textarea
          placeholder="N/A"
          value={
            grades[row._id]?.finalReport?.secondReaderInitialGrade ||
            row.finalReport?.secondReaderInitialGrade ||
            ""
          }
          onChange={(e) =>
            handleGradeChange(
              row,
              "finalReport",
              e.target.value,
              "secondReaderInitialGrade"
            )
          }
          className="w-full h-9 p-2 text-center rounded-md border border-gray-300 focus:outline-none focus:border-lime-500 transition-all resize-none"
        />
      ),
    },
    {
      name: "Final Report Grade",
      selector: (row: any) => row.finalReport?.supervisorGrade || "",
      width: "120px",
      cell: (row: any) => (
        <textarea
          placeholder="N/A"
          value={
            grades[row._id]?.finalReport?.supervisorGrade ||
            row.finalReport?.supervisorGrade ||
            ""
          }
          onChange={(e) =>
            handleGradeChange(
              row,
              "finalReport",
              e.target.value,
              "supervisorGrade"
            )
          }
          className="w-full h-9 p-2 text-center rounded-md border border-gray-300 focus:outline-none focus:border-lime-500 transition-all resize-none"
        />
      ),
    },

    {
      name: "Actions",
      cell: (row: any) => (
        <div className="flex items-center space-x-2">
          <button
            className="bg-lime-600 text-white px-3 py-2 rounded-md hover:bg-lime-700 flex items-center justify-center"
            onClick={() => handleUpdateGrade(row._id, grades[row._id])}
          >
            Update
          </button>

          <button className="bg-lime-800 text-white px-3 py-2 rounded-md hover:bg-lime-900 flex items-center justify-center">
            <Link
              href={`/pages/deliverables?projectId=${row._id}`}
              title="View Deliverables"
            >
              View
            </Link>
          </button>
        </div>
      ),
      minWidth: "200px",
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
        <div className="w-max">
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
    </div>
  );
}
