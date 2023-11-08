const express = require("express");
const {
  handleLogin, 
  handleRegister,
  handleVerifyAccessToken,
  handleFetchUserData
} = require("../controllers/mainController")

const router = express.Router();

router.post("/register", handleRegister);
router.post("/login", handleLogin);
router.post("/verify-access-token", handleVerifyAccessToken)
router.get("/fetch-user-data", handleFetchUserData)

module.exports = router;