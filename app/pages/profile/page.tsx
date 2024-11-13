'use client'
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Profile() {
  const { data: session } = useSession();
  const [profileImage, setProfileImage] = useState(null);

  if (!session) {
    return <p>You need to be logged in to view this page.</p>;
  }

  // Handle image upload
  const handleImageChange = (event) => {
    // Fix
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      //type error
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-8 shadow-lg rounded-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Profile</h2>

      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          <img
            src={profileImage || "/placeholder-profile.png"} // Placeholder image
            alt="Profile"
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            title="Upload Profile Picture"
          />
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-gray-700 mb-1">{session.user.name}</p>
          <p className="text-xl text-gray-700 mb-1">{session.user.role}</p>

           <p className="text-gray-600 mb-2">
            <strong>Course:</strong> {session.user.course || "No course specified"}
          </p>
          <p className="text-gray-600">
            <strong>Description:</strong> {session.user.description || "No description provided"}
          </p> 
        </div>
      </div>
    </div>
  );
}
