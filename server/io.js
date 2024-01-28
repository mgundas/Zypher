const {
  authenticationMiddleware,
} = require("./controllers/socket.io/socketMiddleware");
const {
  handleDisconnect,
} = require("./controllers/socket.io/socketEventsController");
const cleanupStaleSockets = require("./controllers/socket.io/cleanupStaleSockets");

const initializeIo = (io) => {
  // Clean-up function for stale sockets upon server restart
  cleanupStaleSockets(io);

  // Socket.io middleware
  io.use((socket, next) => authenticationMiddleware(socket, next));

  // Socket.io event handlers
  io.on("connection", (socket) => {
    socket.on("disconnect", () => handleDisconnect(io, socket));
  });
};

module.exports = { initializeIo };
