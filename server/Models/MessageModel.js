const mongoose = require('mongoose');
const { body } = require('express-validator');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        // You can add custom validation logic here to filter or sanitize the message text.
        // For example, you can check for unwanted characters or patterns.
        return true; // Adjust this validation logic as needed.
      },
      message: 'Invalid message text.',
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
