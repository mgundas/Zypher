const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for message edit events
  socket.on('editMessage', (editedMessage) => {
    // Update the message in the database
    // Broadcast the updated message to all clients
    io.emit('editedMessage', editedMessage);
  });

  // Listen for message delete events
  socket.on('deleteMessage', (messageId) => {
    // Delete the message in the database
    // Broadcast the deleted message ID to all clients
    io.emit('deletedMessage', messageId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Adjust the server URL

function ChatApp() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Listen for edited messages
    socket.on('editedMessage', (editedMessage) => {
      // Update the UI with the edited message
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === editedMessage.id ? editedMessage : msg
        )
      );
    });

    // Listen for deleted messages
    socket.on('deletedMessage', (deletedMessageId) => {
      // Update the UI by removing the deleted message
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== deletedMessageId)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Functions to edit and delete messages
  const editMessage = (editedMessage) => {
    socket.emit('editMessage', editedMessage);
  };

  const deleteMessage = (messageId) => {
    socket.emit('deleteMessage', messageId);
  };

  // Render UI with messages, edit, and delete functionality
  // ...

  return (
    <div>
      {/* Render your chat UI here */}
    </div>
  );
}

export default ChatApp;