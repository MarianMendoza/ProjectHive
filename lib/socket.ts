import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (userId: string): Socket | undefined => {
  const socketRef = useRef<Socket>();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3000", {
        path: "/api/notifications/socket", // Match the custom path
      });

      socketRef.current.emit("register", userId);
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  return socketRef.current;
};
