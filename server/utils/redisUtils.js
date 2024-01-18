const redisClient = require("../redis.js");

const addToBlacklist = (tokenIdentifier) => {
   redisClient.sadd('tokenBlacklist', tokenIdentifier);
};

const isTokenBlacklisted = async (tokenIdentifier) => {
   return await redisClient.sismember('tokenBlacklist', tokenIdentifier);
};

module.exports = {
   addToBlacklist,
   isTokenBlacklisted,
};