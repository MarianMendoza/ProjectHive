"use client"
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function LecturerDashboard() {
  const { data: session, status } = useSession(); // Get session data
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    const fetchApprovalStatus = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const response = await fetch(`../../api/users/${session.user.id}`);
          const data = await response.json();

          if (response.ok) {
            setIsApproved(data.user.approved); // Assumes API response has an `approved` field
          } else {
            console.error('Error fetching approval status:', data.message);
            setIsApproved(false); // Default to false on error
          }
        } catch (error) {
          console.error('Error fetching approval status:', error);
          setIsApproved(false); // Default to false on fetch error
        }
      }
    };

    fetchApprovalStatus();
  }, [session, status]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          const res = await fetch(`/api/notifications/${session.user.id}`);
          const data = await res.json();

          if (res.ok) {
            setNotifications(data.notifications);
          } else {
            console.error('Error fetching notifications:', data.message);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
      setLoadingNotifications(false);
    };

    fetchNotifications();
  }, [session, status]);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });

      if (res.ok) {
        // setNotifications(notifications.map((notif) => 
        //   notif._id === id ? { ...notif, read: true } : notif
        // ));
      } else {
        console.error('Error marking notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (status === 'loading') {   
    return (
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Loading your dashboard...
      </h2>
    );
  }

  if (status === 'unauthenticated') {
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
        <>
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Welcome, this is your lecturer dashboard.
          </h2>

          <div className="mt-5">
            <h3 className="text-xl font-bold">Notifications:</h3>
            {loadingNotifications ? (
              <p>Loading notifications...</p>
            ) : (
              <ul>
                {notifications.length === 0 ? (
                  <li>No new notifications</li>
                ) : (
                  notifications.map((notification) => (
                    <li
                      key={notification._id}
                      className={notification.read ? 'text-gray-500' : 'font-bold'}
                    >
                      {notification.message}
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="ml-2 text-blue-500"
                        >
                          Mark as read
                        </button>
                      )}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </>
      ) : (
        <h2 className="text-2xl font-bold leading-9 tracking-tight text-red-600">
          Waiting for admin approval. Please check back later.
        </h2>
      )}
    </div>
  );
}
