"use client";
import Notification from "./Notifications";
import React from "react";

export default function AdminDashboard() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    const outlineDocumentDate = (e.target as any).outlineDocumentDate.value;
    const abstractDate = (e.target as any).abstractDate.value;
    const finalReportDate = (e.target as any).finalReportDate.value;
    const openDayDate = (e.target as any).openDayDate.value;

    const updateData = {
        outlineDocumentDeadline: new Date(outlineDocumentDate).toISOString().split('T')[0],
        extendedAbstractDeadline: new Date(abstractDate).toISOString().split('T')[0],
        finalReportDeadline: new Date(finalReportDate).toISOString().split('T')[0],
        openDayDate: new Date(openDayDate).toISOString().split('T')[0],
      };
      

    try {
        const res = await fetch(`/api/deadlines`,{
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
        });

        if (res.ok){
            console.log("Success")
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
            <button className="w-full bg-lime-600 text-white py-4 rounded-lg hover:bg-lime-700 transition duration-300 text-center flex items-center justify-center space-x-3">
              <span>🐝</span>
              <span>Manage Users</span>
            </button>
            <button className="w-full bg-lime-600 text-white py-4 rounded-lg hover:bg-lime-700 transition duration-300 text-center flex items-center justify-center space-x-3">
              <span>📁</span>
              <span>Manage Projects</span>
            </button>
          </div>

          {/* Deadline Fields */}
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-900">Set Deadlines</h3>

            {/* Deadline input fields */}
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Outline Document Deadline</label>
                <input
                  id="outlineDocumentDate"
                  type="date"
                  name="outlineDocumentDate"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Abstract Deadline</label>
                <input
                  id="abstractDate"
                  type="date"
                  name="abstractDate"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Final Report Deadline</label>
                <input
                  id="finalReportDate"
                  type="date"
                  name="finalReportDate"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Open Day Deadline</label>
                <input
                  id="openDayDate"
                  type="date"
                  name="openDayDate"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="bg-lime-600 px-4 py-2 justify-start text-white text-center rounded-lg hover:bg-lime-700 transition duration-200 ease-in-out"
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
