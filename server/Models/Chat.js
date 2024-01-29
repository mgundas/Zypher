const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
   content: String,
   sender: String,
   seen: {
     type: Boolean,
     required: true,
     default: false,
   },
   timestamp: {
     type: Date,
     default: Date.now,
   },
 });

const chatSchema = new mongoose.Schema({
   participants: [String],
   messages: [messageSchema]
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
