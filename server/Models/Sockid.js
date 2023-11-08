const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the User schema
const sockidSchema = new Schema({
  uid: String,
  sockid: String,
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
});

const Sockid = mongoose.model("Sockid", sockidSchema);

module.exports = Sockid;
