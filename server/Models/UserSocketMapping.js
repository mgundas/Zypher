const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the User schema
const userSocketMapping = new Schema({
  uid: String,
  sockets: [String],
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
});

const UserSocketMapping = mongoose.model("UserSocketMapping", userSocketMapping);

module.exports = UserSocketMapping;
