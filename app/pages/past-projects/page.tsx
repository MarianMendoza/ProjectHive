"use client";

import { useEffect, useState } from "react";
import { Project } from "../../../types/projects";

export default function PastProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[] | null>(null); // Null to avoid hydration mismatch

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        } else {
          console.error("Error fetching projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length === 0) return;

    const fetchDeadlines = async () => {
      try {
        const res = await fetch("/api/deadlines");
        const data = await res.json();

        if (data && data.length > 0) {
          const pastProjectDate = new Date(data[0].pastProjectDate);
          console.log("Past Project Date:", pastProjectDate);

          const archived = projects.filter((project) => {
            const projectDate = new Date(project.createdAt);
            return projectDate < pastProjectDate;
          });

          setArchivedProjects(archived);
        } else {
          console.error("No deadlines found.");
        }
      } catch (error) {
        console.error("Error fetching deadlines:", error);
      }
    };

    fetchDeadlines();
  }, [projects]);

  return (
    <>
     <div className="mb-6">
        <img
          src={"/iStock-1357672566.jpg"}
          alt="Student Dashboard Banner"
          className="w-screen h-64 object-cover rounded-b-lg "
        />
      </div>
     <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Past Projects
        </h2>

        {/* Show loading state to prevent hydration mismatch */}
        {archivedProjects === null ? (
          <p className="text-center text-gray-600 animate-pulse">
            Loading past projects...
          </p>
        ) : archivedProjects.length === 0 ? (
          <p className="text-center text-gray-600">No past projects found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {archivedProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900">
                  {project.title}
                </h3>
             
                <p className="text-sm text-gray-600">
                  Created:{" "}
                  {new Date(project.createdAt).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                {project.abstract}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
   
  );
}
