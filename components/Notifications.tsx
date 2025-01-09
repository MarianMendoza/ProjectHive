"use client";

import { useSocket } from "@/app/provider";
import { useEffect, useState } from "react";
import { Notification } from "@/types/notification"; // Adjust the path based on your project structure

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on("getApplication", (data: Notification) => {
        setNotifications((prev) => [...prev, data]);
      });
    }

    // Cleanup to avoid duplicate listeners
    return () => {
      if (socket) {
        socket.off("getApplication");
      }
    };
  }, [socket]);

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
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-max mt-10">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-500">It's quiet in here...</p>
      ) : (
        <ul className="text-gray-700">
          {notifications.map((notification) => (
            <li key={notification._id} className="mb-3">
              <div
                className={`bg-gray-50 p-4 rounded shadow-sm ${
                  notification.isRead ? "opacity-50" : ""
                }`}
              >
                <p className="text-gray-800 font-medium">
                  {notification.userId.name} has applied to project: {notification.relatedProjectId?.title}
                </p>
                {!notification.isRead && (
                  <button
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
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
