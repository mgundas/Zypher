const express = require("express");
const path = require("path");
const User = require("../Models/UserModel");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello there handsome!" });
});

router.post("/register", (req, res) => {
  if (!req.body || !req.body.username || !req.body.email || !req.body.password) {
    return res.status(400).json({ success: true, message: 'Missing username, email, or password fields.' });
  }

  const { username, email, password } = req.body;

  if (
    username.trim() !== "" &&
    email.trim() !== "" &&
    password.trim() !== ""
  ) {
    // Query for a user with the given email
    User.findOne({ $or: [{ username: username }, { email: email }], }, (err, user) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: "An error occured." });
      } else if (user) {
        console.log("User with the email exists:", user);
        res.status(200).json({ success: true, message: "A user with the username or email exists." });
        // Handle the case where a user with the given email exists
      } else {
        const newUser = new User({
          username: username,
          email: email,
          password: password
        });

        newUser.save((err) => {
          if (err) {
            console.error('Error:', err);
            res.status(500).json({ success: false, message: "An error occured." });
            // Handle the error, such as validation errors or database connection issues.
          } else {
            res.status(200).json({ success: true, message: "User registeration succeeded." });
            // The new user has been saved to the database.
          }
        });
      }
    });
  }
});

module.exports = router;
