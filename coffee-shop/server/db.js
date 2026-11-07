const Redis = require("ioredis");

if (!process.env.REDIS_URL) {
  console.warn("REDIS_URL is not set. Add it to server/.env or Render environment variables.");
}

const redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 3 });
redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err.message));

module.exports = redis;
