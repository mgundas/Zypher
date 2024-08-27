const IORedis = require('ioredis');
const logger = require("./utils/logger");

const redisClient = new IORedis({
  host: 'redis-13400.c300.eu-central-1-1.ec2.redns.redis-cloud.com',
  port: 13400,
  password: "7tGO4egH8eTY93nSrporpIUSDPonPTjp"
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