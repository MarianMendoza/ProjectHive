"use client";

import { useSession } from "next-auth/react";
import StudentDashboard from "@/components/StudentDashboard";
import LecturerDashboard from "@/components/LecturerDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import PageNotFound from "@/components/PageNotFound";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session){
    return <PageNotFound/>
  }
  const role = session.user.role;

  return (
    <div >
        {role === "Student" && <StudentDashboard />}
        {role === "Lecturer" && <LecturerDashboard />}
        {role === "Admin" && <AdminDashboard />}
    </div>
  );
}
