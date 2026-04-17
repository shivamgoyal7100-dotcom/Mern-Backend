const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    // Disable endless reconnect loop when Redis is not installed/running.
    reconnectStrategy: false,
    connectTimeout: 2000,
  },
});

let redisReady = false;
let redisErrorLogged = false;

redisClient.on("error", (err) => {
  // Keep API alive even if queue is degraded.
  if (!redisErrorLogged) {
    redisErrorLogged = true;
    console.warn("Redis unavailable. Falling back to DB polling mode.");
    console.warn(err.message);
  }
});

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
      redisReady = true;
      console.log("Redis connected.");
    } catch (error) {
      redisReady = false;
      if (!redisErrorLogged) {
        redisErrorLogged = true;
        console.warn("Redis unavailable. Falling back to DB polling mode.");
        console.warn(error.message);
      }
    }
  }
};

const isRedisReady = () => redisReady && redisClient.isOpen;

module.exports = { redisClient, connectRedis, isRedisReady };
