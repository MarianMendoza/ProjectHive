import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";

interface ExtendedNextApiResponse extends NextApiResponse {
  socket: NetSocket & {
    server: HTTPServer & {
      io?: Server;
    };
  };
}

export default function handler(req: NextApiRequest, res: ExtendedNextApiResponse) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO...");
    const io = new Server(res.socket.server, {
      path: "/api/notifications/socket", // Define a custom path for Socket.IO
      cors: {
        origin: "*", // Adjust this in production
      },
    });

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      socket.on("register", (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    res.socket.server.io = io; // Attach the Socket.IO server to the response socket
  } else {
    console.log("Socket.IO already running.");
  }

  res.end(); // End the response to prevent hanging
}

export const config = {
  api: {
    bodyParser: false, // Disable the default body parser for this route
  },
};
