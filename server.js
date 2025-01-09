import { Server } from "socket.io";
import connectMongo from "./lib/mongodb"; // Adjust the path according to your structure
import {Notification} from "./app/models/Notification"

await connectMongo();

const io = new Server({ 
    cors:{
        origin: "*"
    }
 });

let onlineUsers = new Map();

const addUser = (userId, socketId) => {
    onlineUsers.set(userId, socketId);
    console.log("User added:", { userId, socketId });
  };
  
  // Function to remove a user
  const removeUser = (socketId) => {
    for (const [userId, userSocketId] of onlineUsers.entries()) {
      if (userSocketId === socketId) {
        onlineUsers.delete(userId);
        // console.log("User removed:", { userId, socketId });
        return;
      }
    }
  };
  
  // Function to get a user by userId
  const getUserSocketId = (userId) => {
    console.log("Online:Users", onlineUsers)
    const socketId = onlineUsers.get(userId)
    console.log("Found SocketId", socketId)

    return socketId;
  };

io.on("connection", (socket) => {
    console.log("user connected:", socket.id);

    socket.on("registerUser", async (userId)  => {
        addUser(userId, socket.id);
       
    });



    socket.on("sendApplication", async ({userId, projectId, supervisorId}) => {
        console.log(`User ${userId} applied for project ${projectId} that is supervised by ${supervisorId}`);
        const receiver = getUserSocketId(userId);

        if(!receiver){
          console.error(`Socket ID not found for userID: ${userId}`);
        } else{
          io.to(receiver).emit("getApplication",{
            userId,
            projectId,
          })
        }

    })



  socket.on("disconnect", ()=>{
    console.log("User disconnected:", socket.id);
    removeUser(socket.id);

  })
});

io.listen(5000);