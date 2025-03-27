"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageNotFound from "@/components/PageNotFound";

export default function Profile() {
  const { data: session } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [tag, setTags] = useState<string>(""); // State to store selected course
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();

  // Fetch user data
  const fetchProfileData = async () => {

    if (session?.user?.id) {
      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setProfileImage(data.user.pfpurl || null);
        setName(data.user.name || "");
        setRole(data.user.role || "");
        setEmail(data.user.email || "");
        setTags(data.user.tag || "");
        setDescription(data.user.description || "");
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/tags");
      const data = await res.json();
      const tagName = data.map((tag: { name: string }) => tag.name);
      setCourses(tagName);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCourses();
      fetchProfileData();
    }
  }, [session]);

  const handleImageChange = async (
    
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", session?.user.id!);

      try {
        setUploading(true);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Upload failed");
        await fetchProfileData();
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`/api/users/${session?.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, tag, description }),
      });

      if (!response.ok) throw new Error("Failed to update profile");
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  
      
  const handlePasswordReset = async () => {
    router.push("forgot-password")
  };

  if (!session) {
    return <PageNotFound />;
  }
  return (
    <div className="p-6 max-w-6xl mx-auto mt-4 m-3  bg-white">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
        Your Profile
      </h2>
      <div className="flex flex-col items-center">
        {/* Profile Image */}
        <div className="relative w-40 h-40 mb-4">
          <img
            src={profileImage || "/placeholder-profile.png"}
            alt="Profile"
            className="w-full h-full object-cover rounded-full shadow-md"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={uploading}
          />
        </div>

        {/* Editable Fields */}
        <div className="w-full px-4">
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-md p-2 w-full mb-3"
            placeholder="Enter your name"
          />
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-md p-2 w-full mb-3"
            placeholder="Enter your name"
          />
          <label className="block text-gray-700 font-medium mb-1">Role</label>
          <p className="border rounded-md p-2 w-full mb-3"> {role}</p>
          <label className="block text-gray-700 font-medium mb-1">Course</label>
          <select
            value={tag}
            onChange={(e) => setTags(e.target.value)}
            className="border rounded-md p-2 w-full mb-3"
          >
            <option value="">Select a course</option>
            {courses.map((c, index) => (
              <option key={index} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          
          <textarea
            name = "description"
            value={description}
            maxLength={150}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-md p-2 w-full h-24"
            placeholder="Tell us about yourself"
          ></textarea>
           <div className="text-right text-sm text-gray-500 mt-2">
              {description.length}/500 characters
            </div>

          <button
            onClick={handleUpdateProfile}
            className="mt-4 bg-lime-700 text-white py-2 px-4 rounded w-full hover:bg-lime-800"
          >
            Save Changes
          </button>
          <button
            onClick={handlePasswordReset}
            className="mt-4 bg-orange-500 text-white py-2 px-4 rounded w-full hover:bg-orange-600"
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}
