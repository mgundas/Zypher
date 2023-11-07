const express = require("express");
const {
  handleLogin, 
  handleRegister,
  handleVerifyAccessToken
} = require("../controllers/mainController")

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/verify-access-token", handleVerifyAccessToken)

module.exports = router;
