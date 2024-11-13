"use client";

import { useSession } from "next-auth/react";
import StudentDashboard from "@/components/StudentDashboard";
import LecturerDashboard from "@/components/LecturerDashboard";
import AdminDashboard from "@/components/AdminDashboard";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session){
    return <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">You must be logged in to view this page</h2>
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
