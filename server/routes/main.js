const express = require("express");
const {
  handleLogin, 
  handleRegister,
  handleVerifyAccessToken,
  handleRefreshTokens,
  handleLogout,
  handleMessage,
  handleFetchRecipient,
  handleDiscover,
} = require("../controllers/mainController")
const authMiddleware = require("../controllers/authMiddleware")

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/verify-access-token", handleVerifyAccessToken)
router.post("/refresh-tokens", handleRefreshTokens)
router.get("/messages", authMiddleware, handleMessage)
router.get("/fetchRecipient", authMiddleware, handleFetchRecipient)
router.get("/discover", authMiddleware, handleDiscover)
router.post("/logout", handleLogout)

module.exports = router;