import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Modal from "./Modal"; // Import the modal component
import { Project } from "@/types/projects"; // Adjust the path to your types

interface WithdrawButtonProps {
  projectId: string;
  className: string;
}

const WithdrawButton: React.FC<WithdrawButtonProps> = ({
  projectId,
  className,
}) => {
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
          //   console.log(data)
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

  // Check if the user can withdraw
  const canWithdraw =
    project?.projectAssignedTo &&
    project &&
    (userId === project.projectAssignedTo.supervisorId._id ||
      userId === project.projectAssignedTo.secondReaderId._id ||
      project.projectAssignedTo.studentsId?.some(
        (student) => student._id === userId
      )); // Use .some to check if any student has the matching _id

  // Handle withdrawal
  const handleWithdraw = async () => {
    // if (!canWithdraw) return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "POST",
        body: JSON.stringify({ userId }),
        headers: { "Content-Type": "application/json" },
      });
      setIsModalOpen(false);

      if (res.ok) {
        alert("Successfully withdrew from the project");
        // You can also redirect or update UI here
      } else {
        console.error("Failed to withdraw");
      }
    } catch (error) {
      console.error("Error during withdrawal", error);
    }
  };

  return (
    <div>
      <div>
        <button
          title="Withdraw"
          // className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition duration-200"
          className={className}
          onClick={() => setIsModalOpen(true)}
          //   disabled={!canWithdraw} // Disable if the user is not eligible to withdraw
        >
          Withdraw
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleWithdraw} // Call handleWithdraw on modal confirmation
        message="Are you sure you want to withdraw from this project?"
      />
    </div>
  );
};

export default WithdrawButton;
