const express = require("express");
const path = require("path");
const User = require("../Models/UserModel");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello there handsome!" });
});

router.post("/register", (req, res) => {
  // const { username, email, password } = req.body;

  res.status(200).json({ message: "User registered successfully" });
  console.log("Registeration successful.");
});

module.exports = router;
