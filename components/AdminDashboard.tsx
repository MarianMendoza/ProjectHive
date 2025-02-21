"use client";
import Notification from "./Notifications";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
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
          const formatDate = (isoString: string) => isoString ? isoString.split("T")[0] : "";

          setDeadlines({
            outlineDocumentDeadline: formatDate(data[0].outlineDocumentDeadline),
            extendedAbstractDeadline: formatDate(data[0].extendedAbstractDeadline),
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

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setDeadlines({...deadlines, [e.target.name]: e.target.value})
  }

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
      console.log(deadlines)

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

      <div className="flex justify-between mb-6 col-span-3">
        {/* Console Section */}
        <div className="w-2/3 bg-white p-6 space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Admin Console</h3>

          {/* Navigation buttons */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Link 
            href = {"/pages/admin-users"}
            className="w-full bg-lime-800 text-white py-4 rounded-lg hover:bg-lime-900 transition duration-300 text-center flex items-center justify-center space-x-3">
              🐝 Manage Users
            </Link>
            <Link 
            href = {"/pages/admin-projects"}
            className="w-full bg-lime-800 text-white py-4 rounded-lg hover:bg-lime-900 transition duration-300 text-center flex items-center justify-center space-x-3">
              📁 Manage Projects
            </Link>
          </div>

          {/* Deadline Fields */}
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Set Deadlines
            </h3>

            {/* Deadline input fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {Object.entries(deadlines).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace("Date", " Deadline")
                      .split(' ') 
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ')}
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
                className="bg-lime-800 px-4 py-2 text-white rounded-lg hover:bg-lime-900 transition"
              >
                Submit
              </button>
            </form>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="w-1/3 mt-10">
          <Notification />
        </div>
      </div>
    </>
  );
}
