"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import PageNotFound from "@/components/PageNotFound";


export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState({
    name: "",
    email: "",
    role: "",
  });
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

  const handleEdit = (user: string) => {
    setSelectedUser(user);
    setEditedUser({ ...user });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const res = await fetch(`/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedUser),
      });
      if (res.ok) {
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? editedUser : user
          )
        );
        alert("User updated successfully");
        setIsModalOpen(false);
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter((user) => user._id !== id));
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

    const tableData = users.map((user) => [user.name, user.email, user.role]);

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
      <div className="bg-white p-4 ">
        <DataTable
          title="User Management"
          columns={columns}
          data={users}
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
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <label className="block mb-2">Username:</label>
            <textarea
              name="name"
              value={editedUser.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <label className="block mt-2 mb-2">Email:</label>
            <textarea
              name="email"
              value={editedUser.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
            <label className="block mt-2 mb-2">Role:</label>
            <select name="role" value={editedUser.role} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="Lecturer">Lecturer</option>
              <option value="Admin">Admin</option>
              <option value="Student">Student</option>
            </select>
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
