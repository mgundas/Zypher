require("dotenv").config()
const jwt = require("jsonwebtoken");
const User = require("../../Models/UserModel");
const UserSocketMapping = require("../../Models/UserSocketMapping");
const { isTokenBlacklisted } = require("../../utils/redisUtils.js");

const authenticationMiddleware = async (socket, next) => {
  const accessToken = socket.handshake.auth.accessToken;

  // Verify the access token
  try {
    // Check if the access token provided by the socket is valid
    const isValid = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET);
    if (!isValid) {
      if(process.env.NODE_ENV !== 'production') console.log("Authentication failed.", socket.id);
      return socket.disconnect();
    }

    // Check if the access token provided by the socket is blacklisted
    const isBlacklisted = await isTokenBlacklisted(accessToken);
    if(isBlacklisted) {
      if(process.env.NODE_ENV !== 'production') console.log("Token is blacklisted.", socket.id, accessToken);
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
        const updateUser = await User.findOneAndUpdate({_id: user._id}, {isOnline: true})
        if(process.env.NODE_ENV !== 'production') if(updateUser) console.log("User data updated.");
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
      const updateUser = await User.findOneAndUpdate({_id: user._id}, {isOnline: true})
      if(process.env.NODE_ENV !== 'production') if(updateUser) console.log("User data updated.");

      return next();
    }
  } catch (err) {
    // If an error occurs, disconnect the socket
    if(process.env.NODE_ENV !== 'production') console.log(`Something went wrong while authenticating the socket ${socket.id}`);
    return socket.disconnect();
  }
};


module.exports = {
    authenticationMiddleware,
}