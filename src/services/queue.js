const { redisClient, isRedisReady } = require("../config/redis");

const QUEUE_NAME = "task_queue";

const enqueueTask = async (payload) => {
  if (!isRedisReady()) {
    return false;
  }
  await redisClient.lPush(QUEUE_NAME, JSON.stringify(payload));
  return true;
};

module.exports = { enqueueTask, QUEUE_NAME };
