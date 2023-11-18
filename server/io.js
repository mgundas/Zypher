const { instrument } = require("@socket.io/admin-ui");
const {
  authenticationMiddleware,
} = require("./controllers/socket.io/socketMiddleware");
const {
  privateMessage,
  handleUserTyping,
  handleUserStoppedTyping,
  handleDisconnect,
  handleMessageSeen,
  handleOnlineCheck,
  handleGetRandomOnlineUsers,
} = require("./controllers/socket.io/socketEventsController");
const cleanupStaleSockets = require("./controllers/socket.io/cleanupStaleSockets");

const initializeIo = (io) => {
  // Clean-up function for stale sockets upon server restart
  cleanupStaleSockets(io);

  instrument(io, {
    auth: {
      type: "basic",
      username: "admin",
      password: "$2b$10$heqvAkYMez.Va6Et2uXInOnkCT6/uQj1brkrbyG3LpopDklcq7ZOS", // "changeit" encrypted with bcrypt
    },
    mode: "development",
  });

  // Socket.io middleware
  io.use((socket, next) => authenticationMiddleware(socket, next));

  // Socket.io event handlers
  io.on("connection", (socket) => {
    console.log(socket.id, "joined as", socket.username);

    socket.on("messageSeen", (data) => {
      handleMessageSeen(io, socket, data);
    });
    socket.on("private message", (data) => privateMessage(io, socket, data));
    socket.on("typing", (data) => handleUserTyping(io, socket, data));
    socket.on("stopped typing", (data) =>
      handleUserStoppedTyping(io, socket, data)
    );
    socket.on("isOnline", (data, cb) =>  handleOnlineCheck(io, socket, data, cb));
    socket.on("randomUsers", (data, cb) => handleGetRandomOnlineUsers(io, socket, data, cb))
    socket.on("disconnect", () => handleDisconnect(io, socket));
  });
};

module.exports = { initializeIo };
