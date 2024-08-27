const express = require("express");
const {
  handleLogin, 
  handleRegister,
  handleVerifyAccessToken,
  handleRefreshTokens,
  handleLogout,
  handleDiscover,
  handleFetchMessages,
  handleChat,
  handleChangelog,
  handleSendCodeEmail
} = require("../controllers/mainController")
const authMiddleware = require("../controllers/authMiddleware")

const router = express.Router();

// POST
router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/verify-access-token", handleVerifyAccessToken)
router.post("/refresh-tokens", handleRefreshTokens)
router.post("/verification-code", handleSendCodeEmail)

// GET
router.get("/discover", authMiddleware, handleDiscover)
router.get("/chat", authMiddleware, handleChat)
router.get("/messages", authMiddleware, handleFetchMessages)
router.post("/logout", handleLogout)
router.get("/changelog", handleChangelog)

module.exports = router;