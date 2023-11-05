require("dotenv").config()
const main = require("./routes/main");
const express = require("express");
const mongoose = require('mongoose');
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken")

const idRoom = "564406c549227afebf301d720161596c";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://10.15.2.200:3000" },
});

class CustomError extends Error {
  constructor(message, status) {
    super(message);
    this.name = message;
    this.status = status;
  }
}

mongoose.connect('mongodb://127.0.0.1:27017/registration-demo')
.then(data => {console.log("DB connection successful")})
.catch(err => {console.error("Something went wrong", err)})

app.use(cors())
app.use(express.json());

app.use("/api/v1/", main);

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).send('404 - Not Found');
});

app.use((err, req, res, next) => {
  if (err instanceof CustomError) {
    res.status(err.status).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'Internal server error' });
  }
});

const socketAuthMiddleware = (socket, next) => {
  // Extract the access token from the socket request
  const accessToken = socket.handshake.auth.accessToken;

  // Verify the access token
  try {
    const isValid = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET)
    if(!isValid){
      console.log("Authentication failed.");
      return socket.disconnect(); //Authentication failed
    }
    return next(); // Authentication successful
  } catch (error) {
    console.log("Something went wrong.", error);
    return socket.disconnect();
  }
};

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log(socket.id, "joined.");
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

httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});