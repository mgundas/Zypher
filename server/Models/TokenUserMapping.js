const mongoose = require('mongoose');

const tokenUserMapping = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  tokens: [{
    accessToken: {type: String},
    refreshToken: {type: String},
    userAgent: [{
      ip: {type: String},
      browser: {type: String},
      os: {type: String},
      device: {type: String}
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    // expires: '1d', // Automatically remove documents after 1 day (adjust as needed)
  },
});

const TokenUserMapping = mongoose.model('TokenUserMapping', tokenUserMapping);

module.exports = TokenUserMapping;