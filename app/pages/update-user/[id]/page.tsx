"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const UpdateUserPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<String | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    imageUrl: "",
    name: "",
    email: "",
    course: "",
    description: "",
    // password: "",
    role: "Student",
    approved: false,
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
          setIsAdmin(data.user.role == "Admin");
          setFormData({
            imageUrl: data.user.imageUrl || "",
            name: data.user.name,
            email: data.user.email,
            course: data.user.course || "",
            description: data.user.description || "",
            // password: data.user.password,
            role: data.user.role,
            approved: data.user.approved || false,
          });
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Error fetching user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Update approved status based on the role change
    const updatedFormData = { ...formData };
    if (formData.role === "Student") {
      updatedFormData.approved = true;
    } else if (formData.role == "Lecturer") {
      updatedFormData.approved = false;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFormData),
      });
      if (!res.ok) throw new Error("Failed to update user");
      router.push("../users");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };



  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 ">
      <h1 className="text-2xl rounded-full font-semibold text-gray-800 text-center mb-6">
        Edit Profile
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4 items-center">
        {/* Profile Image */}
        <div className="flex flex-col items-center">
          <div className="relative justify-center items-center w-32 h-32 mb-4 rounded-full overflow-hidden">
            <img
              src={formData.imageUrl || "/placeholder-profile.png"} // Placeholder image
              alt="Profile"
              className="absolute inset-0 w-full object-cover"
            />
            <input
              type="file"
              accept="image/*"
              // onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title="Upload Profile Picture"
            />
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md focus:ring focus:ring-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md focus:ring focus:ring-emerald-500"
            disabled={isAdmin}
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-gray-700 font-medium">
            Role
          </label>
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded-md focus:ring focus:ring-emerald-500"
            disabled={isAdmin}
          >
            <option value="Student">Student</option>
            <option value="Lecturer">Lecturer</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div>
          <label htmlFor="course" className="block text-gray-700 font-medium">
            Course
          </label>
          <input
            type="text"
            name="course"
            id="course"
            value={formData.course}
            onChange={handleChange}
            placeholder="Enter course (optional)"
            className="w-full p-2 border rounded-md focus:ring focus:ring-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-gray-700 font-medium"
          >
            Description
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter a short description (optional)"
            className="w-full p-2 border rounded-md focus:ring focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            ❌ Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-700"
          >
            ✅ Confirm
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUserPage;
