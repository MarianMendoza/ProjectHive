import { Server } from "socket.io";
import connectMongo from "./lib/mongodb"; // Ensure this path is correct
import Notification from "./app/models/Notification"; // Ensure this path is correct
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();
console.log(process.env.MONGODB_URI); // Debug log

// Wrap the MongoDB connection and server startup in an async function
const startServer = async () => {
  // Connect to MongoDB
  await connectMongo();  // This will ensure MongoDB is connected before starting the server

  // Initialize the Socket.IO server
  const io = new Server({
    cors: {
      origin: "*",
    },
  });

  // Map to track online users
  let onlineUsers = new Map<string, string>();

  // Function to add a user to the online users map
  const addUser = (userId: string, socketId: string) => {
    onlineUsers.set(userId, socketId);
    console.log("User added:", { userId, socketId });
  };

  // Function to remove a user from the online users map
  const removeUser = (socketId: string) => {
    for (const [userId, userSocketId] of onlineUsers.entries()) {
      if (userSocketId === socketId) {
        onlineUsers.delete(userId);
        console.log("User removed:", { userId, socketId });
        return;
      }
    }
  };

  // Function to get a user's socket ID by user ID
  const getUserSocketId = (userId: string) => {
    console.log("Online Users:", onlineUsers);
    const socketId = onlineUsers.get(userId);
    console.log("Found SocketId:", socketId);
    return socketId;
  };

  // Socket.IO connection event
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Register user
    socket.on("registerUser", (userId: string) => {
      addUser(userId, socket.id);
    });

    // Handle sending notifications
    socket.on("sendNotification", async ({ userId, receiverId , projectId, type }) => {
      // console.log(`User ${userId} applied for project ${projectId} that is supervised by ${supervisorId}`);

      try {

        if (!mongoose.Types.ObjectId.isValid(projectId) || projectId.length !== 24) {
          throw new Error(`Invalid projectId: ${projectId}`);
        }
        if (!mongoose.Types.ObjectId.isValid(receiverId) || receiverId.length !== 24) {
          throw new Error(`Invalid supervisorId: ${receiverId}`);
        }

        if (type === "Application"){
          //Different types will have different formats? / messages
          
        }

        // Save the notification to the database
        const notification = new Notification({
          userId: userId,
          receiverId: receiverId,
          type: "Application",
          relatedProjectId: projectId,
        });


        await notification.save();
        console.log("Notification saved to the database:", notification);

        // Emit the notification to the supervisor if they are online
        const receiver = getUserSocketId(receiverId);
        if (!receiver) {
          console.error(`Socket ID not found for receiverId: ${receiverId}`);
        } else {
          io.to(receiver).emit("getNotification", {
            notification,
          });
        }
      } catch (error) {
        console.error("Error saving notification to the database:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      removeUser(socket.id);
    });
  });

  // Start the server
  io.listen(5000);
};

// Start the server
startServer().catch((error) => {
  console.error("Error starting the server:", error);
});
