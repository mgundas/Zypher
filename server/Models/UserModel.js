const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Define the User schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  // Store the salt for each user
  salt: String,
  password: String,
});

// Hash the password before saving to the database
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  // Generate a unique salt for this user
  this.salt = crypto.randomBytes(16).toString("hex");

  // Hash the password with the salt
  bcrypt.hash(this.password, this.salt, (err, hash) => {
    if (err) return next(err);
    this.password = hash;
    return next();
  });
});

// Compare stored hashed password with provided password
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

const User = mongoose.model("User", userSchema);

module.exports = User;
