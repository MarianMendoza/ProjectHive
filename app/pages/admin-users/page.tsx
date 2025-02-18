"use client";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users"); // Adjust API endpoint
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = (id: string) => {
    alert(`Edit user with ID: ${id}`);
    // Implement your edit logic here
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter(user => user._id !== id));
        alert("User deleted successfully");
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("User List", 20, 10);

    const tableData = users.map(user => [user.name, user.email, user.role]);

    (doc as any).autoTable({
      head: [["Username", "Email", "Role"]],
      body: tableData,
    });

    doc.save("user_list.pdf");
  };

  const columns = [
    { name: "Username", selector: (row: any) => row.name, sortable: true },
    { name: "Email", selector: (row: any) => row.email, sortable: true },
    { name: "Role", selector: (row: any) => row.role, sortable: true },
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

      <div className="bg-white p-4 rounded-lg h-max ">
        <DataTable
          title="User Management"
          columns={columns}
          data={users}
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
