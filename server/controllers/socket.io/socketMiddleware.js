require("dotenv").config()
const jwt = require("jsonwebtoken");
const logger = require("../../utils/logger")
const { isTokenBlacklisted } = require("../../utils/redisUtils.js");

const User = require("../../Models/UserModel");
const UserSocketMapping = require("../../Models/UserSocketMapping");

const authenticationMiddleware = async (socket, next) => {
  const accessToken = socket.handshake.auth.accessToken;

  // Verify the access token
  try {
    // Check if the access token provided by the socket is valid
    const isValid = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET);
    if (!isValid) {
      return socket.disconnect();
    }

    // Check if the access token provided by the socket is blacklisted
    const isBlacklisted = await isTokenBlacklisted(accessToken);
    if (isBlacklisted) {
      return socket.disconnect();
    }

    // Find the user that the decoded access token belongs to
    const uid = jwt.decode(accessToken).uid;
    const user = await User.findById(uid);
    if (!user) {
      return socket.disconnect();
    }

    // Set basic user information to socket array for easier acces in other modules
    socket.username = user.username;
    socket.uid = user._id;

    // Check if the user has a user-to-socket mapping entry on the database
    const findMapping = await UserSocketMapping.findOne({ uid: user._id });

    // If the user-to-socket mapping exists, add this socket to the list
    if (findMapping) {

      const newLink = await UserSocketMapping.findOneAndUpdate(
        { uid },
        { $addToSet: { sockets: socket.id } },
        { upsert: true, new: true }
      );
      if (newLink) {
        // Update the user's isOnline attribute to true
        const updateUser = await User.findOneAndUpdate({ _id: user._id }, { isOnline: true })
      }
      return next(); // Authentication successful
    } else {
      
      // If the user-to-socket mapping does not exist, create it
      const newMap = new UserSocketMapping({
        uid: user._id,
        sockets: [socket.id],
      });
      await newMap.save();

      // Update the user's isOnline attribute to true
      const updateUser = await User.findOneAndUpdate({ _id: user._id }, { isOnline: true })

      return next();
    }
  } catch (err) {
    // If an error occurs, disconnect the socket
    logger(`Something went wrong while authenticating the socket ${socket.id}`, "red")
    return socket.disconnect();
  }
};

module.exports = {
  authenticationMiddleware,
}