const express = require("express");
const User = require("../Models/UserModel");

const router = express.Router();

// Regular expression for email validation
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

router.get("/", (req, res) => {
  res.json({ message: "Hello there, handsome!" });
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing username, email, or password fields.",
      });
    }

    if (username.trim() === "" || password.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Empty username or password is not allowed.",
      });
    }

    if (!email.match(emailRegex)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format.",
      });
    }

    const existingUser = await User.findOne({ $or: [{ username: username }, { email: email }] });

    if (existingUser) {
      console.log("User with the email exists:", existingUser);
      return res.status(200).json({
        success: true,
        message: "A user with the username or email exists.",
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
      message: "User registration succeeded.",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
});

router.post("/login", (req, res) => {
  res.json({ message: "OK" });
});

module.exports = router;
