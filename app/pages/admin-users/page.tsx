"use client";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import PageNotFound from "@/components/PageNotFound";
import { User } from "@/types/users";
import { Domain } from "@/types/domain";
import { Tag } from "@/types/tag";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const tableRef = useRef<HTMLTableElement>(null);
  const [tag, setTag] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [newTag, setNewTag] = useState("");
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedUser, setEditedUser] = useState({
    name: "",
    email: "",
    role: "",
    assigned: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();

        const filteredUsers = data.filter((user: User) => {
          const matchesSearchQuery = searchQuery === "" || user.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearchQuery;

        });
        setUsers(filteredUsers);

      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchDomains = async () => {
      try {
        const res = await fetch("/api/allowed-domains");
        const data = await res.json();
        setDomains(data);
      } catch (error) {
        console.error("Error fetching domains:", error);
      }
    };
    fetchDomains();

    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        const data = await res.json();
        setTag(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
    fetchUsers();

  }, [searchQuery]);

  const handleAddTags = async () => {
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTag }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(result.message || "Tag added successfully.");
        setTag((prevTags) => [...prevTags, { name: newTag }]);
        setNewTag("");
      } else {
        alert("Failed to add tag");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      alert("An error occurred while adding the tag.");
    }
  };

  const handleRemoveTags = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    if (!id) {
      console.error("Tag ID is missing");
      return;
    }
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTag(tag.filter((currentTag) => currentTag._id !== id));
        alert("Tag deleted successfully");
      } else {
        alert("Failed to delete tag");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  const handleAddDomain = async () => {
    try {
      // Send the domain to the backend API
      const res = await fetch("/api/allowed-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain }),
      });

      if (res.ok) {
        const result = await res.json();
        alert(result.message || "Domain added successfully");
        setDomains((prevDomains) => [...prevDomains, { domain: newDomain }]);
        setNewDomain(""); // Clear input
      } else {
        const errorResult = await res.json();
        alert(errorResult.message || "Failed to add domain");
      }
    } catch (error) {
      console.error("Error adding domain:", error);
      alert("An error occurred while adding the domain.");
    }
  };

  const handleDeleteDomain = async (id: string) => {
    if (!confirm("Are you sure you want to delete this domain?")) return;
    if (!id) {
      console.error("Domain ID is missing");
      return;
    }
    try {
      const res = await fetch(`/api/allowed-domains/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDomains(domains.filter((domain) => domain._id !== id));
        alert("Domain deleted successfully");
      } else {
        alert("Failed to delete domain");
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
    }
  };

  const handleEditUser = (user: string) => {
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

  const handleDeleteUser = async (id: string) => {
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
    const columns = ["Name", "Email", "Role"]; // Simple array of headers

    const rows = users.map((user) => [user.name, user.email, user.role]);

    autoTable(doc, {
      head: [columns],
      body: rows,
    });

    doc.save("user-list.pdf");
  };

  const handleDownloadCSV = () => {
    const filteredUsers = users.map(({ name, email, role }) => ({
      name,
      email,
      role,
    }));

    const csv = Papa.unparse(filteredUsers); // Convert to CSV format
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "users_data.csv";
    link.click();
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    const columns = ["Name", "Email", "Role"]; // Simple array of headers

    const rows = users.map((user) => [user.name, user.email, user.role]);

    autoTable(doc, {
      head: [columns], // Column headers
      body: rows,
    });

    // Open the PDF in a new tab for printing
    const pdfUrl = doc.output("bloburl");
    window.open(pdfUrl, "_blank"); // Open in a new tab
  };

  const columns = [
    { name: "Username", selector: (row: any) => row.name, sortable: true },
    { name: "Email", selector: (row: any) => row.email, sortable: true },
    { name: "Role", selector: (row: any) => row.role, sortable: true },
    {
      name: "Course",
      selector: (row: any) => row.tag || "N/A",
      sortable: true,
    },

    {
      name: "Actions",
      cell: (row: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditUser(row)}
            className="bg-emerald-700 text-white px-3 py-1 rounded hover:bg-emerald-700"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteUser(row._id)}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const domainColumns = [
    { name: "Domain", selector: (row: any) => row.domain, sortable: true },
    {
      name: "Actions",
      cell: (row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleDeleteDomain(row._id)}
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
    <div className="p-6 flex flex-col lg:col-span-2 lg:flex-row gap-6">
      <div className="bg-white p-4 rounded-lg shadow w-full lg:w-1/2">
        <h1 className="text-xl font-semibold mb-4 text-gray-800">User Management</h1>
  
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Users..."
          className="w-full p-2 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-700 transition"
        />
  
        <div ref={tableRef}>
          <DataTable
            className="h-full"
            columns={columns}
            data={users}
            pagination
            highlightOnHover
          />
        </div>
  
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={handleDownloadPDF}
            className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800"
          >
            Save as PDF
          </button>
          <button
            onClick={handleDownloadCSV}
            className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800"
          >
            Save as CSV
          </button>
          <button
            onClick={handlePrint}
            className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800"
          >
            Print
          </button>
        </div>
      </div>
  
      <div className="bg-white p-4 rounded-lg shadow w-full lg:w-1/2">
        <h2 className="text-lg mb-4 font-semibold text-gray-800">Add Email Domains</h2>
  
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Enter domain (e.g., example.com)"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <button
            onClick={handleAddDomain}
            className="bg-emerald-800 text-white px-4 py-2 rounded-lg hover:bg-emerald-900"
          >
            Add
          </button>
        </div>
  
        <div className="border rounded-lg overflow-hidden shadow-sm mb-8">
          <div className="bg-white p-4">
            <DataTable
              className="h-full"
              columns={domainColumns}
              data={domains}
              pagination
              highlightOnHover
            />
          </div>
        </div>
  
        <h2 className="text-lg mb-4 font-semibold text-gray-800 mt-4">Add Tags</h2>
  
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Enter Course e.g Computer Science"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <button
            onClick={handleAddTags}
            className="bg-emerald-800 text-white px-4 py-2 rounded-lg hover:bg-emerald-900"
          >
            Add
          </button>
        </div>
  
        <div className="flex flex-wrap gap-2 mb-4">
          {tag.map((tag, index) => (
            <div
              key={index}
              className="flex items-center bg-emerald-100 text-emerald-900 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition"
            >
              <span>{tag.name}</span>
              <button
                onClick={() => handleRemoveTags(tag._id)}
                className="ml-2 text-emerald-900 hover:text-red-700"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
  
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
  
            <label className="block mb-2">Username:</label>
            <textarea
              name="name"
              value={editedUser.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
  
            <label className="block mt-4 mb-2">Email:</label>
            <textarea
              name="email"
              value={editedUser.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
  
            <label className="block mt-4 mb-2">Role:</label>
            <select
              name="role"
              value={editedUser.role}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="Lecturer">Lecturer</option>
              <option value="Admin">Admin</option>
              <option value="Student">Student</option>
            </select>
  
            <label className="block mt-4 mb-2">Assigned:</label>
            <select
              name="assigned"
              value={editedUser.assigned}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
  
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800"
              >
                Confirm Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}
