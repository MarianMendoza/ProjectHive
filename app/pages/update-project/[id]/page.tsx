"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IProjects } from "@/app/models/Projects";
import { useSession } from "next-auth/react";
import { useSocket } from "@/app/provider";
import { User } from "@/types/users";

const UpdateProjectPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<IProjects | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    title: "",
    status: false,
    visibility: "Private",
    description: "",
    applicants: [],
    files: "",
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedSecondReader, setSelectedSecondReader] = useState<string[]>(
    []
  );
  const [lecturers, setLecturers] = useState<User[]>([]); // List of lecturers for the drop down.
  const [invitedLecturers, setInvitedLecturers] = useState<string[]>([]); // Track invited lecturers
  const [invitedLecturer, setInvitedLecturer] = useState<User | null>(null);

  const [isGroupProject, setIsGroupProject] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const socket = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectRes = await fetch(`../../api/projects/${id}`);
        const projectData = await projectRes.json();
        console.log(projectRes.json);

        const lecturersRes = await fetch("../../api/users");
        const lecturersData = await lecturersRes.json();

        if (projectRes.ok) {
          setProject(projectData.project);
          setFormData({
            title: projectData.project.title,
            status: projectData.project.status,
            visibility: projectData.project.visibility,
            description: projectData.project.description || "",
            applicants: projectData.project.applicants || [],
            files: projectData.project.files || "",
          });

          const filteredLecturers = lecturersData.filter(
            (user: User) =>
              user.role === "Lecturer" && user._id !== session?.user.id
          );
          setLecturers(filteredLecturers);

          const assignedStudent =
            projectData.project.projectAssignedTo?.studentsId || [];
          setSelectedStudents(assignedStudent);

          const assignedSecondReader =
            projectData.project.projectAssignedTo?.secondReaderId._id;
          const matchedLecturer = filteredLecturers.find(
            (lecturer: User) => lecturer._id === assignedSecondReader
          );
          setSelectedSecondReader(matchedLecturer?._id || null); // Set to null if no match

          setIsGroupProject(assignedStudent.length > 1);
        } else {
          setError("Failed to fetch project or lecturers");
        }
      } catch (err) {
        // setError("Error fetching project");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    if (e.target.name === "status") {
      setFormData({
        ...formData,
        status: e.target.value === "Open",
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handleSecondReaderChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedId = e.target.value;

    const receiverId = project?.projectAssignedTo.secondReaderId?._id;

    if (selectedId === "invite") {
      setShowInviteModal(true);
      return;
    } else {
      setSelectedSecondReader(selectedId);
      const updatedData = {
        ...formData,
        projectAssignedTo: {
          ...project?.projectAssignedTo,
          secondReaderId: selectedId === "unassign" ? null : selectedId,
          studentsId: selectedStudents,
        },
      };

      try {
        const userId = session?.user.id;
        const receiversId = [receiverId];
        const projectId = project?._id;
        const type = "UnassignSecondReader";

        if (receiverId == null) {
          alert("You have no one to unassign.");
        } else {
          if (socket) {
            socket.emit("sendNotification", {
              userId,
              receiversId,  
              projectId,
              type,
            });
          } else {
            console.error("Socket is not initialized");
          }
        }

        alert("You have unassigned the second-reader.");

        const res = await fetch(`../../api/projects/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        const updatedProject = await res.json();

        if (res.ok) {
          console.log("Project updated successfully", updatedProject);
        } else {
          console.error("Failed to update project");
        }
      } catch (err) {
        console.error("Error updating second reader!");
      }
    }
  };

  const handleInviteClick = async (lecturer: User) => {
    setInvitedLecturers((prev) => [...prev, lecturer._id]); // Add lecturer to invited list
    setInvitedLecturer(lecturer);

    const userId = session?.user.id;
    const receiversId = [lecturer._id];
    const projectId = project?._id;
    const type = "Invitation";

    // console.log("User ID", userId, "ReceiversId", receiversId, "ProjectId", projectId, "type", type);
    if (socket) {
      socket.emit("sendNotification", { userId, receiversId, projectId, type });
    } else {
      console.error("Socket is not initialized");
    }

    alert("You have sent an invite.");
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (isGroupProject) {
      if (selectedId && !selectedStudents.includes(selectedId)) {
        setSelectedStudents([...selectedStudents, selectedId]);
      }
    } else {
      setSelectedStudents(selectedId ? [selectedId] : []);
    }
  };

  const removeStudent = (studentId: string) => {
    setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
  };

  const handleGroupToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsGroupProject(e.target.checked);
    if (!e.target.checked) {
      setSelectedStudents(selectedStudents.slice(0, 1));
    }
  };

  const updateProjectWithNotifications = async () => {
    const updatedData = {
      ...formData,
      projectAssignedTo: {
        ...project?.projectAssignedTo,
        studentsId: selectedStudents,
      },
    };

    try {
      const res = await fetch(`../../api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const updatedProject = await res.json();

      if (res.ok) {
        router.push("../projects");

        const userId = session?.user.id;
        const assignedReceivers = selectedStudents;
        const projectId = updatedProject.project._id;
        const typeAssigned = "ApplicationAccept";
        const typeClosed = "Closed";

        if (socket) {
          if (assignedReceivers.length > 0) {
            socket.emit("sendNotification", {
              userId,
              receiversId: assignedReceivers,
              projectId,
              type: typeAssigned,
            });
          }

          if (!formData.status) {
            const applicantReceivers = updatedProject.project.applicants.map(
              (applicant: { studentId: string }) => applicant.studentId
            );
            console.log(applicantReceivers);
            socket.emit("sendNotification", {
              userId,
              receiversId: applicantReceivers,
              projectId,
              type: typeClosed,
            });
          }
        } else {
          console.error("Socket is not initialized");
        }
      } else {
        setError(updatedProject.message);
      }
    } catch (err) {
      setError("Error updating project");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowModal(true);
    setModalMessage(
      "Are you sure you want to update this project? Please check the status before proceeding."
    );
    setConfirmAction(() => () => updateProjectWithNotifications());
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    confirmAction();
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

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
              <select
                id="secondReader"
                name="secondReader"
                value={selectedSecondReader || ""}
                onChange={handleSecondReaderChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-600"
              >
                <option value="invite">Invite...</option>
                <option value={selectedSecondReader}>
                  Assigned:{" "}
                  {lecturers.find(
                    (lecturers) => lecturers._id === selectedSecondReader
                  )?.name || "No one has been assigned"}
                </option>
                {selectedSecondReader && (
                  <option value="unassign">Unassign...</option>
                )}
              </select>
            </div>

            {showInviteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                  <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
                    Invite a Lecturer
                  </h2>
                  <div className="space-y-4">
                    {lecturers.map((lecturer) => (
                      <div
                        key={lecturer._id}
                        className="flex justify-between items-center bg-gray-100 p-4 rounded-lg"
                      >
                        <span>{lecturer.name}</span>
                        <button
                          onClick={() => handleInviteClick(lecturer)}
                          className={`px-4 py-2 rounded-lg ${
                            invitedLecturers.includes(lecturer._id)
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-lime-500 text-white hover:bg-lime-600"
                          }`}
                          disabled={invitedLecturers.includes(lecturer._id)}
                        >
                          {invitedLecturers.includes(lecturer._id)
                            ? "Invited"
                            : "Invite"}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="bg-gray-300 text-black px-4 py-2 rounded-lg"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                <option value="Closed">Closed</option>
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
