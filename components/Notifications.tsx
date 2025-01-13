"use client";

import { useSocket } from "@/app/provider";
import { useEffect, useState } from "react";
import { Notification } from "@/types/notification"; // Adjust the path based on your project structure

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socket = useSocket();

  // Fetch existing notifications from the API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("../api/notifications", { method: "GET" });
        if (res.ok) {
          const data: Notification[] = await res.json();
          // console.log(data);
          setNotifications(data);
        } else {
          console.error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket) {
      socket.on("getNotification", (data: Notification) => {
        setNotifications((prev) => [...prev, data]);
      });
    }

    // Cleanup to avoid duplicate listeners
    return () => {
      if (socket) {
        socket.off("getNotification");
      }
    };
  }, [socket]);

  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("../api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId ? { ...notification, isRead: true } : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto h-[50vh] overflow-y-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-500">It's quiet in here...</p>
      ) : (
        <ul className="text-gray-700">
          {notifications.map((notification) => (
            <li key={notification._id} className="mb-3">
              <div
                className={`bg-gray-50 p-4 rounded shadow-sm flex justify-between items-center ${
                  notification.isRead ? "opacity-50" : ""
                }`}
              >
                <p className="text-gray-800 font-medium flex-grow">
                  {/* {notification.userId?.name} has applied for your project, {notification.relatedProjectId?.title || "N/A"} */}
                  {notification.message}
                </p>
                {!notification.isRead && (
                  <button
                    className="ml-4 px-3 py-2 bg-lime-500 text-white rounded text-sm hover:bg-lime-600"
                    onClick={() => markAsRead(notification._id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
