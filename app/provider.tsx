"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { io, Socket } from "socket.io-client";

// Create a context for the Socket
const SocketContext = createContext<Socket | null>(null);

// Provider component
export const Provider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null); // Use state for socket

  useEffect(() => {
    const newSocket = io("http://localhost:5000"); // Initialize socket connection
    setSocket(newSocket); // Store the socket in state

    return () => {
      newSocket.disconnect(); // Clean up on component unmount
    };
  }, []); // Run only once when the component mounts

  return (
    <SocketContext.Provider value={socket}>
      <SessionProvider>{children}</SessionProvider>
    </SocketContext.Provider>
  );
};

// Custom hook to access the socket
export const useSocket = () => useContext(SocketContext);
