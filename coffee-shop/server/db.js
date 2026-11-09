import { createClient } from 'redis';
import dotenv from 'dotenv';

// 1. Load the environment variables from your new .env file
dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn('⚠️ WARNING: REDIS_URL is not set. Falling back to default local instance.');
}

// 2. Initialize the Redis client instance
const redisClient = createClient({
  url: redisUrl || 'redis://127.0.0.1:6379'
});

// 3. Setup event listeners for connection status tracking
redisClient.on('connect', () => {
  console.log('✅ Connected to Redis Server successfully!');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message);
  console.log('👉 Make sure your local Redis service/Docker container is running.');
});

// 4. Establish the asynchronous connection
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('💥 Critical error connecting to Redis:', error);
  }
})();

export default redisClient;