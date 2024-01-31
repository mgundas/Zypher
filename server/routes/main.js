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
} = require("../controllers/mainController")
const authMiddleware = require("../controllers/authMiddleware")

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/verify-access-token", handleVerifyAccessToken)
router.post("/refresh-tokens", handleRefreshTokens)
router.get("/discover", authMiddleware, handleDiscover)
router.get("/chat", authMiddleware, handleChat)
router.get("/messages", authMiddleware, handleFetchMessages)
router.post("/logout", handleLogout)

module.exports = router;