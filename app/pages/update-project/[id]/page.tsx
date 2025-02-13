"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IProjects } from "@/app/models/Projects";
import { useSession } from "next-auth/react"; // Import useSession

const UpdateProjectPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { data: session } = useSession(); // Get session data
  const [project, setProject] = useState<IProjects | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    title: "",
    status: "", // Default to false (Unavailable)
    visibility: "Private",
    description: "",
    applicants: [],
    files: "",
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]); // Pre-filled with assigned students if any
  const [isGroupProject, setIsGroupProject] = useState<boolean>(false); // Toggle for group/individual project
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [modalMessage, setModalMessage] = useState(""); // Modal message content
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {}); // Confirmation action callback

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`../../api/projects/${id}`);
        const data = await res.json();

        if (res.ok) {
          setProject(data.project);
          setFormData({
            title: data.project.title,
            status: data.project.status, // Boolean from the project
            visibility: data.project.visibility,
            description: data.project.description || "",
            applicants: data.project.applicants || [],
            files: data.project.files || ""
          });

          // Pre-fill selected students based on projectAssignedTo
          const assignedStudent =
            data.project.projectAssignedTo?.studentsId || [];
          setSelectedStudents(assignedStudent);
          setIsGroupProject(assignedStudent.length > 1); // Detect if it's a group project
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Error fetching project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (e.target.name === "status") {
      setFormData({
        ...formData,
        status: e.target.value === "Open" ? true : false, // Set to true if "Available", false if "Unavailable"
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;

    if (isGroupProject) {
      // Add to selected students if in group project mode
      if (selectedId && !selectedStudents.includes(selectedId)) {
        setSelectedStudents([...selectedStudents, selectedId]);
      }
    } else {
      setSelectedStudents(selectedId ? [selectedId] : []);
    }
  };


  const removeStudent = (studentId: string) => {
    setSelectedStudents(selectedStudents.filter((id) => id !== studentId)); // Remove student by ID
  };

  const handleGroupToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsGroupProject(e.target.checked);
    if (!e.target.checked) {
      setSelectedStudents(selectedStudents.slice(0, 1)); // Keep only one student if group project is not selected
    }
  };

  const updateProjectWithStudents = async () => {
    const updateApplicants = project?.applicants.map((applicant) => {
      const studentId = applicant.studentId._id || applicant.studentId;
      if (selectedStudents.includes(applicant.studentId.toString())) {
        return { ...applicant, applicationStatus: "Assigned" };
      }
      return applicant;
    });

    const updatedData = {
      ...formData,
      projectAssignedTo: {
        ...project?.projectAssignedTo,
        studentsId: selectedStudents
      },
      applicants: updateApplicants,
    };

    try {
      const response = await fetch(`../../api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("../projects");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error updating project");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowModal(true); // Show confirmation modal before submitting
    setModalMessage(
      "Are you sure you want to update this project? Please check the status before proceeding."
    );
    setConfirmAction(() => () => updateProjectWithStudents()); // Default confirm action to update with students
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    confirmAction(); // Execute the confirmed action (project update)
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  const isEditable = session?.user.id === project?.projectAssignedTo.supervisorId.toString(); // Check if session user is the supervisor

  return (
    <div className="container mx-auto p-10 flex items-center justify-center">
      <div className="w-full">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Update Project
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-lg text-gray-700 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
                required
              />
            </div>

            <div>
              <label
                htmlFor="visibility"
                className="block text-lg text-gray-700 mb-2"
              >
                Visibility
              </label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
                required
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="students"
                className="block text-lg text-gray-700 mb-2"
              >
                Select {isGroupProject ? "Students" : "Student"}
              </label>
              <select
                id="students"
                name="students"
                value={isGroupProject ? "" : selectedStudents[0] || ""}
                onChange={handleStudentChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
              >
                <option value="">
                  {isGroupProject ? "Select Students" : "Select a Student"}
                </option>
                {project?.applicants.map((applicant) => (
                  <option
                    key={applicant.studentId._id}
                    value={applicant.studentId._id}
                  >
                    {applicant.studentId?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="secondReader"
                className="block text-lg text-gray-700 mb-2"
              >
                Second Reader
              </label>
              <input
                type="text"
                id="secondReader"
                name="secondReader"
                value={
                  project?.projectAssignedTo.secondReaderId?.name ||
                  "No Second Reader Assigned"
                }
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
                disabled // Disable the input field to make it read-only
              />
            </div>

            {isGroupProject && (
              <div>
                <label className="block text-lg text-gray-700 mb-2">
                  Selected Students
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedStudents.map((studentId) => {
                    const student = project?.applicants.find(
                      (applicant) =>
                        applicant.studentId._id.toString() === studentId
                    );
                    return student ? (
                      <div
                        key={studentId}
                        className="flex items-center bg-lime-700 px-4 py-2 rounded-full mb-2"
                      >
                        <span className="mr-2 text-white">
                          {student.studentId?.name}
                        </span>
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() => removeStudent(studentId)}
                        >
                          ❌
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="col-span-2">
              <label
                htmlFor="groupProject"
                className="block text-lg text-gray-700 mb-2"
              >
                Group Project
              </label>
              <input
                type="checkbox"
                id="groupProject"
                name="groupProject"
                checked={isGroupProject}
                onChange={handleGroupToggle}
                className="w-5 h-5"
              />
            </div>

            <div className="col-span-2">
              <label
                htmlFor="status"
                className="block text-lg text-gray-700 mb-2"
              >
                Status
                <span
                  className="text-lg text-gray-700 ml-2 mb-2"
                  title="Be sure to change this field if you want to close applications notifications."
                >
                  🛈
                </span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status ? "Open" : "Closed"}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
              >
                <option value="Open">Open</option>
                <option value="Close">Closed</option>
              </select>
            </div>
          </div>

          <div className="col-span-2">
            <label
              htmlFor="description"
              className="block text-lg text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
              rows={4}
              maxLength={1000}    
            />
            <div className="text-right text-sm text-gray-500 mt-2">
            {formData.description.length}/1000 characters  
            </div>  
          </div>

          <div className="col-span-2">
            <label htmlFor="files" className="block text-lg text-gray-700 mb-2">
              Upload Files
            </label>
            <div className="w-full p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 focus-within:ring-2 focus-within:ring-lime-600 text-center">
              <label
                htmlFor="files"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="flex flex-col items-center mb-2">
                  <span role="img" aria-label="file" className="text-2xl">
                    📁
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  Drag & drop files here or{" "}
                  <span className="text-lime-600 font-semibold">browse</span>
                </span>
              </label>
              <input
                type="file"
                id="files"
                name="files"
                multiple
                onChange={handleChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Link
              href="/pages/projects"
              className="bg-red-500 text-white px-8 py-3 rounded-xl mx-10 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-600"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-lime-600 text-white px-8 py-3 rounded-xl hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-lime-600"
            >
              Update Project
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Update</h2>
            <p className="mb-4">{modalMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={handleModalClose}
                className="bg-red-500 text-white px-6 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleModalConfirm}
                className="bg-lime-600 text-white px-6 py-2 rounded-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateProjectPage;
