const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the User schema
const changelogSchema = new Schema({
   commitCode: {
      type: String,
      required: true,
      trim: true,
   },
   title: {
      type: String,
      required: true,
      trim: true,
   },
   desc: {
      type: String,
      required: true,
      trim: true,
   },
   createdAt: {
      type: Date,
      default: Date.now, // Set the default value to the current date and time
   },
});

const Changelog = mongoose.model("Changelog", changelogSchema);

module.exports = Changelog;
