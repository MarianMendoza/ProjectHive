import { useEffect, useState } from "react";
import { useSocket } from "../lib/socket";
import { Notification } from "../types/notification";

interface Props {
  userId: string;
}

const NotificationStack: React.FC<Props> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socket = useSocket(userId);

  useEffect(() => {
    if (!socket) return; // Ensure socket is initialized

    socket.on("new-notification", (data: Notification) => {
      setNotifications((prev) => [...prev, data]);
    });

    return () => {
      socket.off("new-notification"); // Clean up the listener
    };
  }, [socket]);

  return (
    <div className="bg-white shadow-md p-4 rounded-lg max-h-64 overflow-y-auto">
      <h3 className="text-xl font-bold mb-4">Notifications</h3>
      {notifications.length > 0 ? (
        <ul className="space-y-2">
          {notifications.map((notif, index) => (
            <li key={index} className="p-3 bg-yellow-100 rounded">
              {notif.message}
            </li>
          ))}
        </ul>
      ) : (
        <p>No notifications yet</p>
      )}
    </div>
  );
};

export default NotificationStack;
