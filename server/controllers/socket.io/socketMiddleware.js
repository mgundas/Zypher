const jwt = require("jsonwebtoken");
const User = require("../../Models/UserModel");
const UserSocketMapping = require("../../Models/UserSocketMapping");

const authenticationMiddleware = async (socket, next) => {
  // Extract the access token from the socket request
  const accessToken = socket.handshake.auth.accessToken;

  // Verify the access token
  try {
    const isValid = jwt.verify(accessToken, process.env.ACCESSTOKEN_SECRET);
    if (!isValid) {
      console.log("Authentication failed.");
      return socket.disconnect(); // Authentication failed
    }
    const uid = jwt.decode(accessToken).uid;
    const user = await User.findById(uid);
    if (!user) {
      return socket.disconnect();
    }

    socket.username = user.username;
    socket.uid = user._id;

    const findMapping = await UserSocketMapping.findOne({ uid: user._id });
    if (findMapping) {
      const newLink = await UserSocketMapping.findOneAndUpdate(
        { uid },
        { $addToSet: { sockets: socket.id } },
        { upsert: true, new: true }
      );
      if (newLink) {
        console.log("New socket added to the map.");
      }
      return next(); // Authentication successful
    } else {
      const newMap = new UserSocketMapping({
        uid: user._id,
        sockets: [socket.id],
      });

      await newMap.save();
      console.log("New socket mapping entry added.");
      return next();
    }
  } catch (error) {
    return socket.disconnect();
  }
};


module.exports = {
    authenticationMiddleware,
}