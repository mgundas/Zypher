const IORedis = require('ioredis');
const logger = require("./utils/logger");

const redisClient = new IORedis({
  host: '127.0.0.1',
  port: 6379,
});

// Check if the connection to Redis is successful
redisClient.on('connect', () => {
    logger('Connected to Redis', "green")
});

// Check if the connection to Redis is failed
redisClient.on('error', (err) => {
    logger(`Error connecting to Redis: ${err}`, "red")
});

// Add an additional event listener for the 'ready' event
redisClient.on('ready', () => {
    logger('Redis client is ready', "green")
});

// Add an additional event listener for the 'reconnecting' event
redisClient.on('reconnecting', () => {
    logger('Redis client is reconnecting', "yellow")
});

module.exports = redisClient