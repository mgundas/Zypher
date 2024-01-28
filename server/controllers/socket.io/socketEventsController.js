const User = require("../../Models/UserModel");
const UserSocketMapping = require("../../Models/UserSocketMapping");

const handleDisconnect = async (io, socket) => {
  try {
    // Find the user-to-socket mapping document for the given user ID
    const mapping = await UserSocketMapping.findOne({ uid: socket.uid });

    if (mapping) {
      // Remove the disconnected socket ID from the mapping
      const index = mapping.sockets.indexOf(socket.id);
      if (index !== -1) {
        mapping.sockets.splice(index, 1);
        await mapping.save();
        if(mapping.sockets.length <= 0) {
          const updateUser = await User.findOneAndUpdate({_id: socket.uid}, {isOnline: false})
          if(updateUser) console.log("User data updated.");
        }
      }
    }
    console.log("User-to-Socket Mapping Updated.");
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = {
  handleDisconnect,
};
