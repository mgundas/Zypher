require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel");

const authMiddleware = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization;

    // if access token does not exist
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "access.token.not.provided",
      });
    }

    const isValid = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET);

    // if access token is not valid
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "access.token.not.valid",
      });
    }

    const userData = jwt.decode(accessToken);
    const userExists = await User.findById(userData.uid);

    // if the user does not exist
    if (!userExists) {
      return res.status(401).json({
        success: false,
        message: "user.does.not.exist",
      });
    }

    // continue if no error occurs
    next();

  } catch (error) {
    console.log("Error authenticating user:", error.message);
    return res.status(500).json({
      success: false,
      message: "server.error",
    });
  }
};

module.exports = authMiddleware