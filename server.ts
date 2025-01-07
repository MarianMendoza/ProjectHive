import express from "express";
import http from "http";
import {Server} from "socket.io";

const app = express();
const server = http.createServer(app)
const io = new Server(server)

io.on("Connection",(socket) => {
    console.log("A user is connected");
    socket.emit("Notification", {message: "New notification from the server!"})

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

server.listen(3001,()=> {
    console.log("Socket.io server is running on http://localhost:3001");
});

