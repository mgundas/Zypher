const {
  authenticationMiddleware,
} = require("./controllers/socket.io/socketMiddleware");
const {
  handleSendMessage,
  handleDisconnect,
} = require("./controllers/socket.io/socketEventsController");
const cleanupStaleSockets = require("./controllers/socket.io/cleanupStaleSockets");
const logger = require("./utils/logger");

const initializeIo = (io) => {
  // Clean-up function for stale sockets upon server restart
  cleanupStaleSockets(io);
  logger("Stale sockets are cleaned up.", "green")

  // Socket.io middleware
  io.use((socket, next) => authenticationMiddleware(socket, next));

  // Socket.io event handlers
  io.on("connection", (socket) => {
    socket.on("sendMessage", (message) => {handleSendMessage(io, socket, message)})
    socket.on("disconnect", () => handleDisconnect(io, socket));
  });
};

module.exports = { initializeIo };
