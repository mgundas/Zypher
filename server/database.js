// Database related imports & initialization
const mongoose = require("mongoose");
const logger = require("./utils/logger");

mongoose
  .connect("mongodb://127.0.0.1:27017/zypher-development")
  .then(() => {
    logger("DB connection successful", "green")
  })
  .catch((err) => {
    logger(`DB connection error: ${err}`, "red")
  });

module.exports = { mongoose }