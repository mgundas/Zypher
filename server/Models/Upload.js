const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the User schema
const upload = new Schema({
  file: String,
  owner: String,
  uploadedAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
});

const Upload = mongoose.model("Upload", upload);

module.exports = Upload;