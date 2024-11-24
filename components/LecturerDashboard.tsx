import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function LecturerDashboard() {
  const { data: session, status } = useSession(); // Get session data
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchApprovalStatus = async () => {
      if (status === "authenticated" && session?.user?.id) {
        try {
          const response = await fetch(`../../api/users/${session.user.id}`);
          const data = await response.json();

          if (response.ok) {
            setIsApproved(data.user.approved); // Assumes API response has an `approved` field
          } else {
            console.error("Error fetching approval status:", data.message);
            setIsApproved(false); // Default to false on error
          }
        } catch (error) {
          console.error("Error fetching approval status:", error);
          setIsApproved(false); // Default to false on fetch error
        }
      }
    };

    fetchApprovalStatus();
  }, [session, status]);

  if (status === "loading") {
    return (
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Loading your dashboard...
      </h2>
    );
  }

  if (status === "unauthenticated") {
    return (
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-red-600">
        You are not logged in. Please sign in to access your dashboard.
      </h2>
    );
  }

  if (isApproved === null) {
    return (
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Verifying your account status...
      </h2>
    );
  }

  return (
    <div className="mt-10 text-center">
      {isApproved ? (
        <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Welcome, this is your lecturer dashboard.
        </h2>
      ) : (
        <h2 className="text-2xl font-bold leading-9 tracking-tight text-red-600">
          Waiting for admin approval. Please check back later.
        </h2>
      )}
    </div>
  );
}
