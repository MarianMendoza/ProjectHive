// components/Notification.tsx
"use client"
import { useEffect, useState } from 'react';
import io, {Socket} from 'socket.io-client';

let socket: Socket;

const Notification = () => {
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    socket = io(); // Connect to the server

    socket.on('notification', (message) => {
      setNotifications((prevNotifications) => [...prevNotifications, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>{notification}</li>
        ))}
      </ul>
    </div>
  );
};

export default Notification;
