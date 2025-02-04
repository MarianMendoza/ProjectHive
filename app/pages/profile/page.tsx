"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import PageNotFound from "@/components/PageNotFound";

export default function Profile() {
  const { data: session } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Fetch the user's profile image when the component mounts
    const fetchProfileImage = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`);
          if (!response.ok) throw new Error("Failed to fetch profile image");

          const data = await response.json();
          if (data.user.pfpurl) {
            setProfileImage(data.user.pfpurl);
          } else {
            console.log("No profile image URL found");
          }
        } catch (error) {
          console.error("Error fetching profile image:", error);
        }
      }
    };

    if (session) {
      fetchProfileImage();
    }
  }, [session]);

  // Handle image upload
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", session?.user.id);

      try {
        setUploading(true);

        // Send file to the server via an API route
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        setProfileImage(data.pfpUrl); // Update profile image URL from the response
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  if (!session) {
    return <PageNotFound />;
  }

  return (
    <div className="p-6 max-w-md mx-auto mt-8 shadow-lg rounded-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Profile</h2>

      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <img
            src={profileImage || "/placeholder-profile.png"} // Use uploaded image or placeholder
            alt="Profile"
            className="w-full h-full object-cover rounded-full shadow-md "
          />
          
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            title="Upload Profile Picture"
            disabled={uploading}
          />
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-gray-700 mb-1">
            {session.user.name}
          </p>
          <p className="text-xl text-gray-700 mb-1">{session.user.role}</p>

          <p className="text-gray-600 mb-2">
            <strong>Course:</strong>{" "}
            {session.user.course || "No course specified"}
          </p>
          <p className="text-gray-600">
            <strong>Description:</strong>{" "}
            {session.user.description || "No description provided"}
          </p>
        </div>
      </div>
    </div>
  );
}
