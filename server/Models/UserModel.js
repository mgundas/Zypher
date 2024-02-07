const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

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
  isOnline: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
});

// Hash the password before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    // Generate a unique salt for this user
    this.salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    const hash = await bcrypt.hash(this.password, this.salt);

    this.password = hash;
    next();
  } catch (err) {
    return next(err);
  }
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
