const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const session = require("express-session");
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "http://10.15.2.200:3000" },
});
const cors = require("cors");
const sharedsession = require("express-socket.io-session");

const idRoom = "564406c549227afebf301d720161596c";

app.use(express.json());
app.use(cors());

// Configure express-session
const sessionMiddleware = session({
  secret: "564406c549227afebf301d720161596c",
  resave: false,
  saveUninitialized: true,
});

// Use the same session middleware for both Express and Socket.io
app.use(sessionMiddleware);

const users = new Map();

// User registration route
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // In a real application, you'd validate and store user data securely.
  // For simplicity, we'll use an in-memory map for demonstration.
  users.set(username, { username, password });

  res.json({ message: "User registered successfully" });
  console.table(users);
  console.log("Registeration successful.");
});

// Use the session middleware for socket.io using express-socket.io-session
io.use(
  sharedsession(sessionMiddleware, {
    autoSave: true,
  })
);

io.use((socket, next) => {
  // Initialize sessionData as an empty object if it doesn't exist
  socket.handshake.sessionData = socket.handshake.sessionData || {};

  const sessionData = socket.handshake.session;
  const { username } = socket.handshake.auth;

  // Check if the user is authenticated (e.g., username exists in the user database)
  if (users.has(username)) {
    // Associate the user's identity with their session and socket.id
    sessionData.username = username;
    sessionData.socketId = socket.id;
    console.log(
      "Someone with the username " + username + " connected to the server.", socket.handshake.sessionData
    );
    next();
  } else {
    // Unauthorized user connection
    socket.disconnect();
  }
});

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
