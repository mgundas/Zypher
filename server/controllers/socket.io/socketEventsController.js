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

const handleMessageSeen = async (io, socket, data) => {
  data.sender = socket.username;

  if (data.sender === data.recipient) return;

  const user = await User.findOne({ username: data.recipient });
  if (!user) return;

  const message = await Message.findOneAndUpdate(
    { _id: data.id },
    { seen: true }
  );
  if (!message) return;

  const mapping = await UserSocketMapping.findOne({ uid: user._id });
  if (mapping) {
    for (const recipientSocket of mapping.sockets) {
      io.to(recipientSocket).emit("seen", data);
    }
  } else {
    console.log("No matching user-to-socket mapping found for", user._id);
  }
};

const handleOnlineCheck = async (io, socket, data, cb) => {
  try {
    const user = await User.findOne({ username: data.username });
    if (user) {
      const mapping = await UserSocketMapping.findOne({ uid: user._id });
      if (mapping) {
        if (mapping.sockets.length > 0) {
          return cb(true);
        }
        return cb(false);
      } 
      return cb(false);
    }
    return cb(false);

  } catch (error) {
    cb(false);
  }
};

const handleGetRandomOnlineUsers = async (io, socket, data, cb) => {
  try {
    const size = data || 10;
    const randomOnlineEntries = await User.aggregate([
      { $match: { isOnline: true } }, // Add a $match stage to filter by the condition
      { $sample: { size: size } },
      { $project: { password: 0, salt: 0 } }
    ]);

    cb(randomOnlineEntries)
  } catch (error) {
    console.error('Error fetching random online entries:', error);
  }
}

module.exports = {
  privateMessage,
  handleUserTyping,
  handleUserStoppedTyping,
  handleDisconnect,
  handleMessageSeen,
  handleOnlineCheck,
  handleGetRandomOnlineUsers,
};
