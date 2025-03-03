import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Modal from "./Modal"; // Import the modal component
import ActionButton from "./ActionButton"; // Import the ActionButton component
import { Project } from "@/types/projects"; // Adjust the path to your types

interface ApplyButtonProps {
  projectId: string;
}

const ApplyButton: React.FC<ApplyButtonProps> = ({ projectId }) => {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = session?.user.id;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
        } else {
          console.error("Failed to fetch project");
        }
      } catch (error) {
        console.error("Error fetching project", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // Check if the user has already applied
  const isApplied = project?.applicants?.some(
    (applicant) => applicant.studentId?._id === session?.user.id
  ) ?? false;
  

  // Button text and styles based on whether the user has applied
  const buttonText = isApplied ? "Applied" : "Apply";
  const buttonStyles = isApplied
    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
    : "bg-lime-600 text-white hover:bg-lime-700";

  const handleApply = async () => {
    if (!userId || !project) return;

    try {
      const res = await fetch(`/api/projects/${project._id}/apply`, {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const updatedProject = await res.json();
        // Handle project updates (if needed)
        // For example, you might want to update the list of applicants or show a notification
        setProject(updatedProject);
        alert("You have successfully applied to this project.");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to apply for the project");
      }
    } catch (error) {
      console.error("Error applying for project:", error);
    }
  };


  return (
    <div>
      <div className="flex gap-3 justify-end">
        <ActionButton
          onClick={() => setIsModalOpen(true)}
          isDisabled={isApplied}
          buttonText={buttonText}
          buttonStyles={buttonStyles}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleApply} // Call handleApply on modal confirmation
        message="You have applied to this project."
      />
    </div>
  );
};

export default ApplyButton;
