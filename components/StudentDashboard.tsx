"use client";
import { useEffect, useState } from "react";
import { Project } from "@/types/projects";
import { useSession } from "next-auth/react";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAppliedProjects = async () => {
      try {
        const res = await fetch("../api/projects");
        if (res.ok) {
          const data = await res.json();
          console.log(data.length);

          if (!session?.user?.id) {
            console.log("Error with the user id, in a session");
            return; // Prevent proceeding if the user ID is not found
          }

          const appliedProjects = data.filter((project: Project) =>
            project.applicants.some(
              (applicant) => applicant.studentId.toString() === session.user.id
            )
          );

          // Update the state with all projects the student has applied for
          setProjects(appliedProjects);

          if (appliedProjects.length === 0) {
            console.log("No projects found for this student.");
          }
        } else {
          console.error("Failed to fetch projects.");
        }
      } catch (error) {
        console.error("Error fetching projects", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedProjects();
  }, [session?.user?.id]); // Add session.id as dependency to re-fetch if the session changes

  return (
    <div>
      {loading && <p>Loading...</p>}
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Welcome, this is your student dashboard.
      </h2>

      {!loading && projects.length === 0 && (
        <p>No projects found for this student.</p>
      )}

      <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-lime-900"> 
        Applied Projects 
        </h2>

      {!loading &&
        projects.map((project) => {
          // Ensure session and applicant are not null
          if (!session?.user?.id) return null; // Prevent further code execution if session is invalid

          // Find the applicant object for the logged-in student
          const applicant = project.applicants.find(
            (applicant) => applicant.studentId.toString() === session.user.id
          );

          return (
            <div
              key={project._id}
              className="bg-white p-4 rounded-lg shadow-lg my-2 hover:shadow-xl transition-all duration-200 flex items-center justify-between"
            >
              <div>
                <h2 className="text-m font-semibold text-lime-600">
                  {project.title}
                </h2>

                
              </div>

              {/* Badge section showing the application status */}
              <div className="flex items-center space-x-2">
                {applicant && (
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      applicant.applicationStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : applicant.applicationStatus === "Assigned"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {applicant.applicationStatus}
                  </span>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
