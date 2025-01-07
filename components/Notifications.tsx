import { useEffect, useState } from 'react';
import io, {Socket} from 'socket.io-client';

let socket: Socket;

interface Notification {
  message: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    socket = io('http://localhost:3001'); // Connect to the Socket.io server

    socket.on('notification', (data: Notification) => {
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });

    return () => {
      socket.disconnect(); // Clean up the socket connection
    };
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>{notification.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
