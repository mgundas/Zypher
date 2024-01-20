const mongoose = require('mongoose');

const tokenRecord = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
  },
  token: [{
    refreshToken: {type: String},
    userAgent: [{
      ip: {type: String},
      browser: {type: String},
      cpu: {type: String},
      country: {type: String},
      timezone: {type: String},
      city: {type: String}
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const TokenRecord = mongoose.model('TokenRecord', tokenRecord);

module.exports = TokenRecord;