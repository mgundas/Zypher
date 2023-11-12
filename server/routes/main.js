const express = require("express");
const {
  handleLogin, 
  handleRegister,
  handleVerifyAccessToken,
  handleRefreshTokens,
  handleLogout
} = require("../controllers/mainController")

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/verify-access-token", handleVerifyAccessToken)
router.post("/refresh-tokens", handleRefreshTokens)
router.post("/logout", handleLogout)

module.exports = router;