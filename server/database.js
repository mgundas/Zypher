// Database related imports & initialization
const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/registration-demo")
  .then(() => {
    console.log("DB connection successful");
  })
  .catch((err) => {
    console.error("Something went wrong", err);
  });

module.exports = { mongoose }