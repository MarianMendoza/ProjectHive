import { Server } from "socket.io";

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
    return onlineUsers.get(userId);
  };

io.on("connection", (socket) => {
    console.log("user connected:", socket.id);

    socket.on("registerUser", async (userId)  => {
        addUser(userId, socket.id);

    });

    socket.on("sendApplication", ({userId, projectId, supervisorId}) => {
        console.log(`User ${userId} applied for project ${projectId} that is supervised by ${supervisorId}`);

    })



  socket.on("disconnect", ()=>{
    console.log("User disconnected:", socket.id);
    removeUser(socket.id);

  })
});

io.listen(5000);