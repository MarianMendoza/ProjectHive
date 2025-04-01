"use client";
import Notification from "./Notifications";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [deadlines, setDeadlines] = useState({
    outlineDocumentDeadline: "",
    extendedAbstractDeadline: "",
    finalReportDeadline: "",
    openDayDate: "",
    pastProjectDate: "",
  });

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const res = await fetch("/api/deadlines");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatDate = (isoString: string) =>
            isoString ? isoString.split("T")[0] : "";

          setDeadlines({
            outlineDocumentDeadline: formatDate(
              data[0].outlineDocumentDeadline
            ),
            extendedAbstractDeadline: formatDate(
              data[0].extendedAbstractDeadline
            ),
            finalReportDeadline: formatDate(data[0].finalReportDeadline),
            openDayDate: formatDate(data[0].openDayDate),
            pastProjectDate: formatDate(data[0].pastProjectDate),
          });
        } else {
          console.error("No deadlines found in API response");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchDeadlines();
  }, []);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setDeadlines({ ...deadlines, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const storedLogo = localStorage.getItem("logo");
    if (storedLogo) {
      setLogoPreview(storedLogo);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        localStorage.setItem("logo", base64); // Save logo
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        localStorage.setItem("ucc-logo", base64); // Save logo
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/deadlines`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deadlines),
      });
      console.log(deadlines);

      if (res.ok) {
        console.log("Success");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      alert("An error occurred while updating deadlines.");
    }
  };

  return (
    <>
      <div className="mb-6">
        <img
          src={"/iStock-1208275903.jpg"}
          alt="Student Dashboard Banner"
          className="w-screen h-64 object-cover rounded-b-lg "
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-6 px-4 mb-6">
        {/* Console Section */}
        <div className="w-full md:w-2/3 bg-white p-6 space-y-6 rounded-lg ">
          <h3 className="text-xl font-semibold text-gray-900">Admin Console</h3>

          {/* Deadline Fields */}
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Set Deadlines
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.entries(deadlines).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-800">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace("Date", " Deadline")
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </label>
                  <input
                    type="date"
                    name={key}
                    value={value}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="bg-teal-700 px-4 py-2 text-white rounded-lg hover:bg-teal-800 transition"
              >
                Save Dates
              </button>
            </form>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-1/3 mt-6 md:mt-20 p-3 bg-white rounded-lg ">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload University Logo
          </h3>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="w-full p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 text-center"
          >
            <label
              htmlFor="logo-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-2">📁</span>
              <span className="text-sm text-gray-500">
                Drag & drop logo here or{" "}
                <span className="text-emerald-700 font-semibold">browse</span>
              </span>
            </label>
            <input
              type="file"
              id="logo-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {logoPreview ? (
            <div>
              <p className="text-gray-500 text-sm text-center mt-4">
                Uploaded Logo
              </p>
              <div className="m-2 flex justify-center">
                <img
                  src={logoPreview}
                  alt="Uploaded Logo"
                  className="h-20 object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm mt-4 text-center">
              No logo uploaded yet.
            </div>
          )}

          <div className="mt-6 grid gap-4">
            <Link
              href={"/pages/admin-users"}
              className="w-full bg-emerald-700 text-white py-4 rounded-lg hover:bg-emerald-800 transition text-center"
            >
              🐝 Manage Users
            </Link>
            <Link
              href={"/pages/admin-projects"}
              className="w-full bg-emerald-700 text-white py-4 rounded-lg hover:bg-emerald-800 transition text-center"
            >
              📁 Manage Projects
            </Link>
            <Link
              href={"/pages/admin-deliverables"}
              className="w-full bg-emerald-700 text-white py-4 rounded-lg hover:bg-emerald-800 transition text-center"
            >
              📝 Manage Deliverables
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
