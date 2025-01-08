import { Server } from "socket.io";

const io = new Server({ 
    cors:{
        origin: "http://localhost:3000"
    }
 });

io.on("connection", (socket) => {
  console.log("someone has connected!");

  socket.on("disconnect", ()=>{
    console.log("Someone has left");
  })
});

io.listen(5000);