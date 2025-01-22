import { Server } from "socket.io";
import connectMongo from "./lib/mongodb"; // Ensure this path is correct
import Notification from "./app/models/Notification"; // Ensure this path is correct
import dotenv from "dotenv";
import User from "./app/models/User";
import Projects from "./app/models/Projects";
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
    socket.on("sendNotification", async ({ userId, receiversId, projectId, type }) => {
      // console.log(`User ${userId} applied for project ${projectId} that is supervised by ${supervisorId}`);
      try {
        if (!Array.isArray(receiversId)) {
          throw new Error(`Invalid receiversId: Expected an array got ${typeof receiversId}`);
          // console.log(receiversId)
        }

        if (!mongoose.Types.ObjectId.isValid(projectId) || projectId.length !== 24) {
          throw new Error(`Invalid projectId: ${projectId}`);
        }

        // console.log(receiversId);
        console.log(userId.name);

        const user = await User.findById(userId, 'name');
        if (!user) {
          throw new Error(`User not found for userId: ${userId}`);
        }
    
        // Fetch the project data
        const project = await Projects.findById(projectId, 'title');
        if (!project) {
          throw new Error(`Project not found for projectId: ${projectId}`);
        }

        console.log(projectId.title)


        let message = "";

        switch(type){
          case "Application":
            message = `${userId.name} applied to your project ${projectId.title}`;
            break
          case "ApplicationAccept":
            message = `You you have been assigned to ${projectId.title}.` 
          break
          case "ApplicationDecline":
            message =  `You have not been successful in your application for ${projectId.title}.`
          break
          case "Update":
            message = `You have been assigned to ${projectId.title}.`;
            break
          case "Closed":
            message = `The project ${projectId.title} is now closed.`;
            break
          case "Invitation":
            message = `You have been invited to become a second-reader for ${projectId.title}`;
            break
          case "InvitationDecline":
            message = `${userId.name} has declined your invite to become second-reader for ${projectId.title}`;
            break
          case "InvitationAccept":
            message = `${userId.name} has accepted your invite and is now a second-reader for ${projectId.title}`;
            break
          case "UnassignSecondReader":
            message = `You have been unassigned as Second-Reader from ${projectId.title}`;
            break
          case "InvitationSupervisor":
            message = `You have been invited to supervise ${projectId.title} by ${userId.name}`
            break
          case "InvitationSupervisorAccept":
            message = `${userId.name} has accepted to supervise ${projectId.title}.`
            break
          case "InvitationSupervisorDecline":
            message = `Your invite to ${userId.name} has been declined for ${projectId.title}.`
            break
        }

        // Save the notification to the database
        const notification = new Notification({
          userId: userId,
          receiversId: receiversId,
          message: message,
          type: type,
          relatedProjectId: projectId,
        });


        await notification.save();
        console.log(receiversId);


        for (const receiverId of receiversId) {
          if (!mongoose.Types.ObjectId.isValid(receiverId) || receiverId.length !== 24) {
            throw new Error(`Invalid receiverId: ${receiverId}`);
          }
          const receiverSocketId = getUserSocketId(receiverId);
          if (!receiverSocketId) {
            console.error(`Socket ID not found for receiverId: ${receiverId}`);
          } else {
            io.to(receiverSocketId).emit("getNotification", {
              notification,
            });
          }
        }
      } catch (error) {
        console.error("Error saving notification to the database:", error);
      }
    });

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
