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
  handleProfile,
} = require("../controllers/mainController")
const authMiddleware = require("../controllers/authMiddleware")

const router = express.Router();

// POST requests
router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/verify-access-token", handleVerifyAccessToken)
router.post("/refresh-tokens", handleRefreshTokens)
router.post("/logout", handleLogout)

// GET requests
router.get("/discover", authMiddleware, handleDiscover)
router.get("/chat", authMiddleware, handleChat)
router.get("/messages", authMiddleware, handleFetchMessages)
router.get("/profile", authMiddleware, handleProfile)
router.get("/changelog", handleChangelog)

module.exports = router;