const express = require("express");
const User = require("../Models/UserModel");

const router = express.Router();

// Regular expression for email validation
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

// Define a regular expression pattern for a valid username
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // Allow letters, numbers, and underscores

router.get("/", (req, res) => {
  res.json({ message: "Hello there, handsome!" });
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "missing.username.email.password",
      });
    }

    if (email.trim() === "" || username.trim() === "" || password.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "empty.username.email.password",
      });
    }

    if (!email.match(emailRegex) || !username.match(usernameRegex)) {
      return res.status(400).json({
        success: false,
        message: "invalid.email.username.format",
      });
    }

    const existingUser = await User.findOne({ $or: [{ username: username }, { email: email }] });

    if (existingUser) {
      console.log("User with the email exists:", existingUser);
      return res.status(200).json({
        success: true,
        message: "user.exists",
      });
    }

    const newUser = new User({
      username: username,
      email: email,
      password: password,
    });

    await newUser.save();
    console.log("User registered:", newUser);
    res.status(200).json({
      success: true,
      message: "reg.successful",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "err.occured" });
  }
});

router.post("/login", (req, res) => {
  try {
    const {username, password} = req.body

    if(!username || !password){
      return res.status(400).json(
        {
          success: false,
          message: "Username or password is missing."
        }
      )
    }

    if (username.trim() === "" || password.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Empty username or password is not allowed.",
      });
    }
    
  } catch (error) {
    console.error("An error occured.", error)
    res.status(500).json("An error occured.")
  }
});

module.exports = router;
