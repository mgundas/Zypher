const logger = require("../../utils/logger");
const UserSocketMapping = require("../../Models/UserSocketMapping");
const User = require("../../Models/UserModel")

const cleanupStaleSockets = async (io) => {
  try {
    const allMappings = await UserSocketMapping.find();

    for (const mapping of allMappings) {
      const activeSockets = mapping.sockets.filter(
        (socketId) => io.sockets.sockets[socketId]
      );

      // Update the mapping with only active sockets
      await UserSocketMapping.findByIdAndUpdate(mapping._id, {
        $set: { sockets: activeSockets },
      });

      // Set all users' isOnline field to false
      await User.updateMany({}, { $set: { isOnline: false } });
    }
  } catch (err) {
    logger(`Error cleaning up stale sockets: ${err.message}`)
  }
};

module.exports = cleanupStaleSockets;
