const logger = require("../../utils/logger");
const User = require("../../Models/UserModel");
const UserSocketMapping = require("../../Models/UserSocketMapping");
const Chat = require("../../Models/Chat");

const handleSendMessage = async (io, socket, message) => {
  try {
    const room = await Chat.findById(message.room)
    if (!room) return;

    const isUserParticipant = room.participants.includes(socket.uid)
    if (!isUserParticipant) return;

    const update = await Chat.findOneAndUpdate(
      { _id: room._id },
      { $push: { messages: { content: message.content, sender: message.sender }}},
      { new: true }
    );

    const newMessage = update.messages[update.messages.length - 1]

    const toSend = {
      _id: newMessage._id,
      content: newMessage.content,
      sender: newMessage.sender,
      seen: newMessage.seen,
      timestamp: newMessage.timestamp,
      total: update.messages.length
    }

    let sockets = new Set()

    for (participant of room.participants) {
      const mapping = await UserSocketMapping.find({ uid: participant })
      if (mapping) {
        sockets = new Set([...sockets, ...mapping[0].sockets])
      }
    }

    for (socket of sockets) {
      io.to(socket).emit(`message_${room._id}`, toSend)
    }

  } catch (err) {
    logger(`Something went wrong while sending a message: ${err.message}`, "red")
    return;
  }
}

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
        if (mapping.sockets.length <= 0) {
          const updateUser = await User.findOneAndUpdate({ _id: socket.uid }, { isOnline: false })
          if (!updateUser) logger(`Something went wrong while updating online status of the user: ${mapping.uid}`, "red")
        }
      }
    }
  } catch (err) {
    logger(`Something went wrong while safely disconnecting a user from io: ${err.message}`, "red")
  }
};

module.exports = {
  handleSendMessage,
  handleDisconnect,
};
