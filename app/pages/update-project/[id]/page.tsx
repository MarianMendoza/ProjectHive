"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IProjects } from "@/app/models/Projects";
import { useSession } from "next-auth/react";
import { useSocket } from "@/app/provider";
import { User } from "@/types/users";
import PageNotFound from "@/components/PageNotFound";

const UpdateProjectPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<IProjects | null>(null);
  const [programme, setProgrammes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    title: "",
    status: false,
    programme: "",
    visibility: "Private",
    abstract: "",
    description: "",
    secondReader: "",
    applicants: [],
    files: "",
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedSecondReader, setSelectedSecondReader] = useState<string[]>(
    []
  );

  const [unassignedSecondReader, setUnassignedSecondReader] = useState<
    string | null
  >(null);

  const [lecturers, setLecturers] = useState<User[]>([]); // List of lecturers for the drop down.
  const [invitedSecondReaders, setInvitedSecondReaders] = useState<string[]>(
    []
  );
  const filteredLecturers = lecturers.filter((lecturer) =>
    lecturer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const [isGroupProject, setIsGroupProject] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showInviteSecondReaderModal, setShowInviteSecondReaderModal] =
    useState<boolean>(false);

  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const socket = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectRes = await fetch(`/api/projects/${id}`);
        const projectData = await projectRes.json();
        console.log(projectData);

        const lecturersRes = await fetch("/api/users");
        const lecturersData = await lecturersRes.json();

        if (projectRes.ok) {
          setProject(projectData.project);
          setFormData({
            title: projectData.project.title,
            status: projectData.project.status,
            programme: projectData.project.programme || "",
            visibility: projectData.project.visibility,
            abstract: projectData.project.abstract || "",
            description: projectData.project.description || "",
            secondReader: projectData.project.secondReader || "",
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
          const matchedSecondReader = filteredLecturers.find(
            (lecturer: User) => lecturer._id === assignedSecondReader
          );

          setSelectedSecondReader(matchedSecondReader?._id || null); // Set to null if no match
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

    const fetchProgrammes = async () => {
      try {
        const res = await fetch("/api/programmes");
        const data = await res.json();
        console.log(data);
        const programmeName = data.map(
          (programme: { name: string }) => programme.name
        );
        setProgrammes(programmeName);
      } catch (error) {
        console.error("Error fetching tags", error);
      }
    };

    fetchProgrammes();
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
    console.log(selectedId);

    const receiverId = project?.projectAssignedTo.secondReaderId?._id;

    if (selectedId === "invite") {
      setShowInviteSecondReaderModal(true);
      return;
    }

    let secondReader;

    if (selectedId === "") {
      console.log("This is empty.");
      secondReader = "";
    } else {
      secondReader = project?.projectAssignedTo.secondReaderId;
      console.log(project?.projectAssignedTo.secondReaderId);
      // setUnassignedSecondReader(project?.projectAssignedTo?.secondReaderId?._id);
    }

    // setSelectedSecondReader(secondReader);
  };

  const handleInviteSecondReaderClick = async (lecturer: User) => {
    setInvitedSecondReaders((prev) => [...prev, lecturer._id]); // Add lecturer to invited list
    setInvitedSecondReader(lecturer);

    const userId = session?.user.id;
    const receiversId = [lecturer._id];
    const projectId = project?._id;
    const type = "InvitationSecondReader";

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
        secondReaderId: project?.projectAssignedTo?.secondReaderId || null,
      },
    };

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const updatedProject = await res.json();

      if (res.ok) {
        router.push("/pages/projects");

        const userId = session?.user.id;
        const assignedReceivers = selectedStudents;
        const projectId = updatedProject.project._id;

        if (socket) {
          if (assignedReceivers.length > 0 && formData.status) {
            socket.emit("sendNotification", {
              userId,
              receiversId: assignedReceivers,
              projectId,
              type: "StudentAccept",
            });
          }

          if (unassignedSecondReader) {
            socket.emit("sendNotification", {
              userId: session?.user.id,
              receiversId: [unassignedSecondReader],
              projectId: project?._id,
              type: "UnassignSecondReader",
            });
            alert("You have unassigned the second reader.");
          }

          if (!formData.status) {
            const applicantReceivers = updatedProject.project.applicants.map(
              (applicant: { studentId: string }) => applicant.studentId
            );
            // console.log(applicantReceivers);
            socket.emit("sendNotification", {
              userId,
              receiversId: applicantReceivers,
              projectId,
              type: "Closed",
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

  if (!session) {
    return <PageNotFound />;
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-6xl mx-auto rounded-lg p-6 sm:p-10">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Update Project
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="md:grid col-span-1 md:grid-cols-2 gap-6 gap-y-2">
            {/* Title */}
            <div className="w-full">
              <label
                htmlFor="title"
                className="block text-lg w-full text-gray-800 mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>

            {/* Visibility */}
            <div className="w-full">
              <label
                htmlFor="visibility"
                className="block text-lg w-full text-gray-800 mb-2"
              >
                Visibility
              </label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                required
              >
                <option value="Private">Private</option>
                <option value="Public">Public</option>
              </select>
            </div>

            {/* Programme */}
            <div className="w-full">
              <label
                htmlFor="programme"
                className="block text-lg text-gray-800 mb-2"
              >
                Programme
              </label>
              <select
                id="programme"
                name="programme"
                value={formData.programme.toString()}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                required
              >
                <option value="">Select a course</option>
                {programme.map((c, index) => (
                  <option key={index} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Second Reader (Lecturer or Admin) */}
            {(session.user.role === "Lecturer" ||
              session.user.role === "Admin") && (
              <div>
                <label
                  htmlFor="secondReader"
                  className="block text-lg text-gray-800 mb-2"
                >
                  Second Reader
                </label>
                <select
                  id="secondReader"
                  name="secondReader"
                  key={selectedSecondReader}
                  value={selectedSecondReader || ""}
                  onChange={handleSecondReaderChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="invite">Invite...</option>
                  <option value={selectedSecondReader}>
                    Assigned:{" "}
                    {lecturers.find((l) => l._id === selectedSecondReader)
                      ?.name || "No one has been assigned"}
                  </option>
                  {selectedSecondReader && (
                    <option value="">Unassign...</option>
                  )}
                </select>
              </div>
            )}

            {/* Students (Lecturer only) */}
            {session.user.role === "Lecturer" && (
              <div className="w-full ">
                <label
                  htmlFor="students"
                  className="block text-lg text-gray-800 mb-2"
                >
                  Select {isGroupProject ? "Students" : "Student"}
                </label>
                <select
                  id="students"
                  name="students"
                  value={isGroupProject ? "" : selectedStudents[0] || ""}
                  onChange={handleStudentChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="">
                    {isGroupProject ? "Select Students" : "Select a Student"}
                  </option>
                  {project?.applicants.map((applicant) => (
                    <option
                      key={applicant.studentId?._id}
                      value={applicant.studentId?._id}
                    >
                      {applicant.studentId?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Group toggle */}
            {(session.user.role === "Lecturer" ||
              session.user.role === "Admin") && (
              <div className="col-span-2">
                <label
                  htmlFor="groupProject"
                  className="block text-lg text-gray-800 mb-2"
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
            )}

            {/* Status */}
            <div className="col-span-2">
              <label
                htmlFor="status"
                className="block text-lg text-gray-800 mb-2"
              >
                Status
                <span
                  className="ml-2 text-base"
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
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Abstract & Description */}
          <div className="mt-6">
            <label
              htmlFor="abstract"
              className="block text-lg text-gray-800 mb-2"
            >
              Abstract
            </label>
            <textarea
              id="abstract"
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {formData.abstract?.length}/500 characters
            </div>

            <label
              htmlFor="description"
              className="block text-lg text-gray-800 mt-6 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={1000}
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <div className="text-right text-sm text-gray-500 mt-2">
              {formData.description?.length}/1000 characters
            </div>
          </div>

          {/* Selected students display */}
          {isGroupProject && session.user.role === "Lecturer" && (
            <div className="mt-6">
              <label className="block text-lg text-gray-800 mb-2">
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
                      className="flex items-center bg-emerald-800 px-4 py-2 rounded-full text-white"
                    >
                      <span className="mr-2">{student.studentId?.name}</span>
                      <button
                        type="button"
                        onClick={() => removeStudent(studentId)}
                        className="text-red-300 hover:text-red-500"
                      >
                        ❌
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
            <Link
              href="/pages/projects"
              className="text-center bg-gray-300 text-black px-6 py-3 rounded-xl hover:bg-gray-400 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="text-center bg-emerald-700 text-white px-6 py-3 rounded-xl hover:bg-emerald-800 transition"
            >
              Update Project
            </button>
          </div>
        </form>
      </div>

      {showInviteSecondReaderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              Invite a Second Reader
            </h2>

            <input
              type="text"
              placeholder="Search lecturers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />

            {/* Scrollable list inside */}
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
              {filteredLecturers.map((lecturer) => (
                <div
                  key={lecturer._id}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                >
                  <span className="text-base font-medium text-gray-800">
                    {lecturer.name}
                  </span>
                  <button
                    onClick={() => handleInviteSecondReaderClick(lecturer)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      invitedSecondReaders.includes(lecturer._id)
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-emerald-700 text-white hover:bg-emerald-900"
                    }`}
                    disabled={invitedSecondReaders.includes(lecturer._id)}
                  >
                    {invitedSecondReaders.includes(lecturer._id)
                      ? "Invited"
                      : "Invite"}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowInviteSecondReaderModal(false)}
                className="bg-gray-300 text-black px-5 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Update</h2>
            <p className="mb-4">{modalMessage}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleModalClose}
                className="bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleModalConfirm}
                className="bg-emerald-700 text-white px-4 py-2 rounded-md"
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
