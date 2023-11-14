const { Server } = require("socket.io");

const configureSocket = (app) => {
  const ioConfig = {
    cors: {
      origin: ["http://localhost:3000", "https://admin.socket.io"],
      credentials: true,
    },
  };
  const httpServer = require("http").createServer(app);
  const io = new Server(httpServer, ioConfig);
  return { httpServer, io };
};

module.exports = { configureSocket };
