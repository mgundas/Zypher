// Misc imports
require("dotenv").config();
// Express.js related imports
const express = require("express");
const useragent = require("express-useragent");
const cors = require("cors");
// Express.js router imports
const main = require("./routes/main");
// Express server initialization
const app = express();

// Module imports
const { mongoose } = require("./database")
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
    origin: ["http://localhost:3000", "https://dev.pyromaniacduck.cloud"],
  })
);

//Express routers
app.use("/api/v1/", main);

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).send("404 - Not Found");
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
