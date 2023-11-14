const User = require("../../Models/UserModel");
const UserSocketMapping = require("../../Models/UserSocketMapping");
const Message = require("../../Models/MessageModel");

const privateMessage = async (io, socket, data) => {
  try {
    data.sender = socket.username;
    data.timestamp = Date.now();

    if (data.sender === data.recipient) return;

    const user = await User.findOne({ username: data.recipient });
    if (!user) return;

    const mapping = await UserSocketMapping.findOne({ uid: user._id });
    if (mapping) {
      const newMessage = new Message({
        sender: socket.uid, // Assuming socket.uid is the correct user ID
        recipient: user._id,
        message: data.message,
        timestamp: data.timestamp,
      });
      await newMessage.save(); // Make sure to await the save operation

      data.id = newMessage._id;
      for (const recipientSocket of mapping.sockets) {
        io.to(recipientSocket).emit("receiveMessage", data);
      }
      io.to(socket.id).emit("receiveMessage", data);
    } else {
      console.log("No matching user-to-socket mapping found for", user._id);
    }
  } catch (error) {
    console.error("Error handling private message:", error);
  }
};

const handleUserTyping = async (io, socket, data) => {
  data.sender = socket.username;

  if (data.sender === data.recipient) return;

  const user = await User.findOne({ username: data.recipient });
  if (!user) return;

  const mapping = await UserSocketMapping.findOne({ uid: user._id });
  if (mapping) {
    for (const recipientSocket of mapping.sockets) {
      io.to(recipientSocket).emit("user typing", data);
    }
  } else {
    console.log("No matching user-to-socket mapping found for", user._id);
  }
};

const handleUserStoppedTyping = async (io, socket, data) => {
  data.sender = socket.username;

  if (data.sender === data.recipient) return;

  const user = await User.findOne({ username: data.recipient });
  if (!user) return;

  const mapping = await UserSocketMapping.findOne({ uid: user._id });
  if (mapping) {
    for (const recipientSocket of mapping.sockets) {
      io.to(recipientSocket).emit("user stopped typing", data);
    }
  } else {
    console.log("No matching user-to-socket mapping found for", user._id);
  }
};

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
      }
    }
    console.log("User-to-Socket Mapping Updated.");
  } catch (error) {
    console.error("Error:", error);
  }
};

const handleMessageSeen = async (io, socket, data) => {
  data.sender = socket.username;

  if (data.sender === data.recipient) return;

  const user = await User.findOne({ username: data.recipient });
  if (!user) return;

  const mapping = await UserSocketMapping.findOne({ uid: user._id });
  if (mapping) {
    for (const recipientSocket of mapping.sockets) {
      console.log("triggered");
      io.to(recipientSocket).emit("seen", data);
    }
  } else {
    console.log("No matching user-to-socket mapping found for", user._id);
  }
};

module.exports = {
  privateMessage,
  handleUserTyping,
  handleUserStoppedTyping,
  handleDisconnect,
  handleMessageSeen,
};
