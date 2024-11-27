"use client";

import { useSession } from "next-auth/react";
import StudentDashboard from "@/components/StudentDashboard";
import LecturerDashboard from "@/components/LecturerDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import PageNotFound from "@/components/PageNotFound";

import { useEffect, useState } from "react";
import { Project } from "@/types/projects";

const Dashboard = () => {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("../api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        } else {
          console.error("Failed to fetch projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (!session) {
    return <PageNotFound />;
  }
  const role = session.user.role;

  return (
    <div className="container mx-auto p-4">
      {session?.user?.role === "Student" ? (
        <StudentDashboard />
      ) : session?.user?.role === "Lecturer" ? (
        <LecturerDashboard /> 
      ) : session?.user?.role === "Admin" ? (
        <AdminDashboard /> 
      ) : (
        <p>You do not have access to this page.</p> 
      )}
    </div>
  );
  
};

export default Dashboard;
