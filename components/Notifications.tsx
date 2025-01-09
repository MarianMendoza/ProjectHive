"use client";

import { useSocket } from "@/app/provider";
import { useEffect, useState } from "react";

const Notifications = () => {
  const [notifications, setNotifications] = useState<{ userId: string; projectId: string }[]>([]);
  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on("getApplication", (data: { userId: string; projectId: string }) => {
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-max mt-10">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-gray-500">It's quiet in here...</p>
      ) : (
        <ul className=" text-gray-700">
          {notifications.map((notification, index) => (
            <li key={index} className="mb-3">
              <div className="bg-gray-50 p-4 rounded shadow-sm">
                <p className="text-gray-800 font-medium"> {notification.userId} has applied to {notification.projectId}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
