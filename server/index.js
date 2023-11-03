const main = require("./routes/main");
const express = require("express");
const mongoose = require('mongoose');
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const idRoom = "564406c549227afebf301d720161596c";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://10.15.2.200:3000" },
});

mongoose.connect('mongodb://127.0.0.1:27017/registration-demo')
.then(data => {console.log("DB connection successful")})
.catch(err => {console.error("Something went wrong", err)})

app.use(cors())
app.use(express.json());

app.use("/", main);

io.on("connection", (socket) => {
  socket.join(idRoom);
  socket.emit("receiveId", {
    username: socket.handshake.auth.username,
    id: socket.id,
  });

  socket.on("sendMessage", (data) => {
    io.to(idRoom).emit("receiveMessage", data);
  });

  socket.on("typing", (data) => {
    // Broadcast the "user typing" event to other users in the room.
    io.to(idRoom).emit("user typing", data);
  });

  socket.on("stopped typing", (data) => {
    // Broadcast the "user stopped typing" event to other users in the room.
    io.to(idRoom).emit("user stopped typing", data);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected.`);
  });
});

const ioPort = 81;
httpServer.listen(ioPort, () => {
  console.log(`Socket is listening on port ${ioPort}`);
});