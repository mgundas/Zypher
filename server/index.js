require("dotenv").config();
const main = require("./routes/main");
const express = require("express");
const useragent = require('express-useragent');
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./Models/UserModel");
const UserSocketMapping = require("./Models/UserSocketMapping")
const Message = require("./Models/MessageModel")
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ["http://localhost:3000", "http://10.15.2.200:3000"] },
});

class CustomError extends Error {
  constructor(message, status) {
    super(message);
    this.name = message;
    this.status = status;
  }
}

mongoose
  .connect("mongodb://127.0.0.1:27017/registration-demo")
  .then((data) => {
    console.log("DB connection successful");
  })
  .catch((err) => {
    console.error("Something went wrong", err);
  });


//Express middleware
app.use(useragent.express());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://10.15.2.200:3000"],
  })
);
app.use(express.json());

//Express routers
app.use("/api/v1/", main);

// 404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404).send("404 - Not Found");
});

app.use((err, req, res, next) => {
  if (err instanceof CustomError) {
    res.status(err.status).json({ message: err.message });
  } else {
    res.status(500).json({ message: "Internal server error" });
  }
});

const socketAuthMiddleware = async (socket, next) => {
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
    socket.uid = user._id
    const findMapping = await UserSocketMapping.findOne({uid: user._id})
    if(findMapping){
      const newLink = await UserSocketMapping.findOneAndUpdate(
        { uid },
        { $addToSet: { sockets: socket.id } },
        { upsert: true, new: true }
      )
      if(newLink){
        console.log("New socket added to the map.");
      }
      return next(); // Authentication successful
    } else {
      const newMap = new UserSocketMapping({
        uid: user._id,
        sockets: [socket.id]
      })
  
      await newMap.save();
      console.log("New socket mapping entry added.");
      return next();
    }
  } catch (error) {
    return socket.disconnect();
  }
};

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  console.log(socket.id, "joined as", socket.username);

  socket.on("private message", async (data) => {
    data.sender = socket.username
    data.timestamp = Date.now()

    if(data.sender === data.recipient) return;

    const user = await User.findOne({username: data.recipient})
    if(!user) return;

    const mapping = await UserSocketMapping.findOne({ uid: user._id });
    if (mapping) {
      for (const recipientSocket of mapping.sockets) {
        io.to(recipientSocket).emit('receiveMessage', data);
      }
      io.to(socket.id).emit('receiveMessage', data);
      const newMessage = new Message({
        sender: socket.uid,
        recipient: user._id,
        message: data.message,
        timestamp: data.timestamp
      })
      newMessage.save()
    } else {
      console.log('No matching user-to-socket mapping found for', user._id);
    }
  });

  socket.on("typing", async (data) => {
    data.sender = socket.username

    if(data.sender === data.recipient) return;

    const user = await User.findOne({username: data.recipient})
    if(!user) return;

    const mapping = await UserSocketMapping.findOne({ uid: user._id });
    if (mapping) {
      for (const recipientSocket of mapping.sockets) {
        io.to(recipientSocket).emit('user typing', data);
      }
    } else {
      console.log('No matching user-to-socket mapping found for', user._id);
    }
  });

  socket.on("stopped typing", async (data) => {
    data.sender = socket.username

    if(data.sender === data.recipient) return;

    const user = await User.findOne({username: data.recipient})
    if(!user) return;

    const mapping = await UserSocketMapping.findOne({ uid: user._id });
    if (mapping) {
      for (const recipientSocket of mapping.sockets) {
        io.to(recipientSocket).emit('user stopped typing', data);
      }
    } else {
      console.log('No matching user-to-socket mapping found for', user._id);
    }
  });

  socket.on("disconnect", async () => {
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
      console.log('User-to-Socket Mapping Updated.');
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
