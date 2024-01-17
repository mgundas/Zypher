const IORedis = require('ioredis');
const redisClient = new IORedis({
  host: '127.0.0.1',
  port: 6379,
});

// Check if the connection to Redis is successful
redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error(`Error connecting to Redis: ${err}`);
});

// Add an additional event listener for the 'ready' event
redisClient.on('ready', () => {
    console.log('Redis client is ready');
});

// Add an additional event listener for the 'reconnecting' event
redisClient.on('reconnecting', () => {
    console.log('Redis client is reconnecting');
});

module.exports = redisClient