// Misc imports
require("dotenv").config();
const path = require('path');
// Express.js related imports
const express = require("express");
const useragent = require("express-useragent");
const cors = require("cors");
// Express.js router imports
const main = require("./routes/main");
const upload = require("./routes/upload");
// Express server initialization
const app = express();
const logger = require("./utils/logger");

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
logger(`
/*------------------------------------------*/
/*------------Zypher is booting-------------*/
/*------------------------------------------*/`, "cyan");
logger(`Initializing app in NODE_ENV: ${process.env.NODE_ENV}`, "yellow");

// Module imports
const { mongoose } = require("./database")
const redisClient = require("./redis");

const { configureSocket } = require("./socketConfig")
const {httpServer, io} = configureSocket(app);
const {initializeIo} = require("./io");
const morgan = require("morgan");
initializeIo(io)

//Express middleware
app.use(morgan("dev"))
app.use(useragent.express());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://zypher.pyromaniacduck.cloud"],
  })
);

//Express routers
app.use("/api/v1/", main);
app.use("/api/image/", upload);

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public/notFound.html'));
});

// Custom error middleware
class CustomError extends Error {
  constructor(message, status) {
    super(message);
    this.name = message;
    this.status = status;
  }
}
app.use((err, req, res, next) => {
  if (err instanceof CustomError) {
    res.status(err.status).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Server start
httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
