"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("REDIS_URL is not defined in the environment variables.");
}
// Create a single Redis connection instance with required BullMQ option
const redisClient = new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: null, // 🔥 Required for BullMQ compatibility
});
redisClient.on('connect', () => {
    console.log('Connected to Redis');
});
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});
exports.default = redisClient;
