import cors from "cors";
import express from "express";
import path from "path";

import { Server } from "socket.io";




const PORT =  3000;


const app = express();
const server = app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});

app.use(cors());

let users = {};
const io = new Server(server , {
  cors:{
    origin :"*",
    methods:["GET", "POST"]
  }
});
io.on("connection", (socket) => {

  users[socket.id] = {
    color:{
      r:Math.floor(Math.random()*255),
      g:Math.floor(Math.random()*255),
      b:Math.floor(Math.random()*255)
    },
    socketId: socket.id,
    id: Date.now(),
    position: { x: 0, y: 0 },
  };

  io.emit("server:userCreate", users[socket.id]);
  socket.on("client:position", (data) => {
    users[socket.id].position.x = data.x;
    users[socket.id].position.y = data.y;

    io.emit("server:userPosition", users);
    console.log(data);
  });

  socket.on("disconnect", () => {
    io.emit("server:userDestroy", users[socket.id]);
    console.log("client is disconnect", users[socket.id]);
    delete users[socket.id];
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});
