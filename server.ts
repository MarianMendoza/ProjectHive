import { Server } from "socket.io";
import connectMongo from "./lib/mongodb"; // Ensure this path is correct
import Notification from "./app/models/Notification"; // Ensure this path is correct
import dotenv from "dotenv";
import User from "./app/models/User";
import Projects from "./app/models/Projects";
import Deadline from "./app/models/Deadlines";
import Deliverables from "./app/models/Deliverables";
import mongoose from "mongoose";
import sgMail from "@sendgrid/mail"



// Load environment variables
dotenv.config();
console.log(process.env.MONGODB_URI); // Debug log
console.log(process.env.SENDGRID_API_KEY); // Debug log


sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);


// Wrap the MongoDB connection and server startup in an async function
export const startServer = async () => {
  // Connect to MongoDB
  await connectMongo();  // This will ensure MongoDB is connected before starting the server

  // Initialize the Socket.IO server
  const io = new Server({
    cors: {
      origin: "*",
    },
  });


  const checkUpcomingDeadlines = async (io: Server) => {
    try {
      await connectMongo();
      const deadline = await Deadline.findOne();
      if (!deadline) return;

      const today = new Date();

      const checkAndNotify = async (deadlineDate: Date, key: string) => {
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 7 || diffDays === 0) {
          const deliverables = await Deliverables.find().populate("projectId");
          for (const d of deliverables) {
            const project = d.projectId;
            for (const studentId of project.projectAssignedTo.studentsId) {
              const socketId = getUserSocketId(studentId.toString());
              const message = ` Reminder: Your ${key} is due in 7 days. Please upload before ${deadlineDate.toDateString()}`;

              const notification = new Notification({
                userId: studentId,
                receiversId: [studentId],
                message,
                messageUser: null,
                type: "DeadlineReminders",
                relatedProjectId: project._id,
                timestamp: new Date().toLocaleString(),
              });

              await notification.save();

              if (socketId) {
                io.to(socketId).emit("getNotification", {
                  notification,
                });
              }
            }
          }
        }
      };

      await checkAndNotify(deadline.outlineDocumentDeadline, "Outline Document");
      await checkAndNotify(deadline.extendedAbstractDeadline, "Extended Abstract");
      await checkAndNotify(deadline.finalReportDeadline, "Final Report");

    } catch (error) {
      console.error("Error checking deadlines:", error);
    }
  };

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
    socket.on("sendNotification", async ({ userId, receiversId, projectId, messageUser, type }) => {
      // console.log(`User ${userId} applied for project ${projectId} that is supervised by ${supervisorId}`)
      try {
        if (!Array.isArray(receiversId)) {
          throw new Error(`Invalid receiversId: Expected an array got ${typeof receiversId}`);
          // console.log(receiversId)
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
          console.log(`Project not found for projectId: ${projectId}`);
        } else {
          console.log("No project.")
        }

        const now = new Date();
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();
        const timestamp = `${date} ${time}`;


        let message = "";

        switch (type) {
          case "ApplicationStudent":
            message = `${timestamp} \n ${user.name} applied to your project ${project.title}`;
            break
          case "StudentAccept":
            message = `${timestamp} \n You have been assigned to ${project.title}.`
            break
          case "StudentDecline":
            message = `${timestamp} \n You have not been successful in your application for ${project.title}.`
            break
          case "Closed":
            message = `${timestamp} \n The project ${project.title} is now closed.`;
            break
          case "InvitationSecondReader":
            message = `${timestamp} \n You have been invited to become a second-reader for ${project.title}`;
            break
          case "DeclineSecondReader":
            message = `${timestamp} \n ${user.name} has declined your invite to become second-reader for ${project.title}`;
            break
          case "AcceptSecondReader":
            message = `${timestamp} \n ${user.name} has accepted your invite and is now a second-reader for ${project.title}`;
            break
          case "UnassignSecondReader":
            message = `${timestamp} \n You have been unassigned as Second-Reader from ${project.title}`;
            break
          case "InvitationSupervisor":
            message = `${timestamp} \n You have been invited to supervise ${project.title} by ${user.name}`
            break
          case "SupervisorAccept":
            message = ` ${timestamp} \n ${user.name} has accepted to supervise ${project.title}.`
            break
          case "SupervisorDecline":
            message = `${timestamp} \n Your invite to ${user.name} has been declined for ${project.title}.`
            break
          case "outlineDocumentPublished":
            message = `${timestamp} \n Your grades for your outline document has been released! View this in your deliverables page.`
            break
          case "extendedAbstractPublished":
            message = `${timestamp} \n Your grades for your extended abstract has been released! View this in your deliverables page.`
            break
          case "finalReportPublished":
            message = `${timestamp} \n Your grades for your final report has been released! View this in your deliverables page.`
            break
          case "SubmitSupervisor":
            message = `${timestamp} \n ${user.name} has submitted provisional grades and feedback for ${project.title}`
            break
          case "SubmitSecondReader":
            message = `${timestamp} \n ${user.name} has submitted provisional grades and feedback for ${project.title}`
            break
          case "SupervisorSigned":
            message = `${timestamp} \n Final grades been signed off by ${user.name}.`
            break
          case "SecondReaderSigned":
            message = `${timestamp} \n Final grades been signed off by ${user.name}.`
            break
          case "LecturerCreated":
            message = `${timestamp} \n ${user.name} is waiting to be approved.`
            break
          case "ApproveLecturer":
            message = `${timestamp} \n You have been approved. Navigate to your dashboard to start using the system.`
            break
          case "DeclineLecturer":
            message = `${timestamp} \n You have been declined access to Lecturers permissions.`
            break
          case "System":
            message = "System Message:"
            break
        }

        const notification = new Notification({
          userId: userId,
          receiversId: receiversId,
          message: message,
          messageUser: messageUser,
          type: type,
          relatedProjectId: projectId,
          timestamp: timestamp,
        });

        await notification.save();
        // console.log("Type", type);


        for (const receiverId of receiversId) {

          const receiver = await User.findById(receiverId);
          console.log(receiver?.emailNotifications);
          if (receiver?.emailNotifications) {
            const emailMsg = {
              to: receiver.email,
              from: process.env.SENDGRID_FROM_EMAIL as string,
              subject: `New Notification - Project Hive`,
              text: `${messageUser ? messageUser + "\n\n" : ""}${message}`,
              html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #047857;">Project Hive Notification</h2>
              <p style="margin-top: 20px;"><strong>Details:</strong><br>${message.replace(/\n/g, "<br />")}</p>

              ${messageUser
                  ? `<p><strong>Message:</strong><br>${messageUser.replace(/\n/g, "<br />")}</p>`
                  : ""}


              <p style="margin-top: 30px; font-size: 0.9em; color: #555;">
                You received this email because you have enabled email notifications.
              </p>
            </div>
          `
            };

            try {
              await sgMail.send(emailMsg);
              console.log(`Email sent to ${receiver.email}`);
            } catch (err) {
              console.error("Error sending email:", err);
            }
          }

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

  // Run every 24 hours
  // setInterval(() => {
  //   checkUpcomingDeadlines(io);
  // }, 1000 * 60 * 60 * 24); // every 24 hours

  // // Run every 10 minutes
  // setInterval(() => {
  //   checkUpcomingDeadlines(io);
  // }, 1000 * 60 * 10); // 1000 ms * 60 sec * 10 min

  // setInterval(() => {
  //   checkUpcomingDeadlines(io);
  // }, 1000 * 60); // 1000ms * 60s = 1 minute

};


// Start the server
startServer().catch((error) => {
  console.error("Error starting the server:", error);
});
