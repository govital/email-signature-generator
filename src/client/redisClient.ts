import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined in the environment variables.");
}

// Create a single Redis connection instance with required BullMQ option
const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // 🔥 Required for BullMQ compatibility
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err: Error) => {
  console.error('Redis error:', err);
});

export default redisClient;
