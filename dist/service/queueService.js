"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAlive = exports.getFinishedJob = exports.getJob = exports.queueBulkRequest = void 0;
const bullmq_1 = require("bullmq");
const redisClient_1 = __importDefault(require("../client/redisClient"));
const queryRepo_1 = require("../repository/queryRepo");
const templateCache_1 = require("../cache/templateCache");
const bulkQueueName = process.env.BULK_QUEUE_NAME;
const bulkResultsQueueName = process.env.RESULTS_BULK_QUEUE_NAME;
const bulkJobName = process.env.BULK_JOB_NAME;
if (!bulkQueueName) {
    throw new Error("BULK_QUEUE_NAME is not defined in the environment variables.");
}
if (!bulkJobName) {
    throw new Error("bulkJobName is not defined in the environment variables.");
}
// Define queue using the shared Redis connection
const bulkQueue = new bullmq_1.Queue(bulkQueueName, {
    connection: redisClient_1.default,
});
const bulkResultsQueue = new bullmq_1.Queue(bulkResultsQueueName, {
    connection: redisClient_1.default,
});
/**
 * Queues a bulk email signature generation request.
 * @param templateId - The template ID to use.
 * @param usersList - The list of users to generate signatures for.
 * @param webhookUrl - (Optional) Webhook to send results.
 */
const queueBulkRequest = (templateId, usersList, webhookUrl) => __awaiter(void 0, void 0, void 0, function* () {
    // Step 1: Check if the template exists
    const template = (0, templateCache_1.getTemplate)(templateId);
    if (!template) {
        throw new Error(`Template with ID ${templateId} not found in cache.`);
    }
    // Step 2: Add job to BullMQ queue
    const job = yield bulkQueue.add(bulkJobName, {
        templateId,
        usersList,
        webhookUrl,
    });
    // Step 3: Save request record in DB
    try {
        yield queryRepo_1.queryRepo.saveQuery({
            job_id: job.id,
            template_id: templateId,
            users_count: usersList.length,
            users_list: usersList,
            webhook_url: webhookUrl || undefined, // only passes if defined
        });
    }
    catch (err) {
        throw new Error(`Failed to save job metadata: ${err.message}`);
    }
    // Step 4: Return job ID
    return job.id;
});
exports.queueBulkRequest = queueBulkRequest;
/**
 * Retrieves a job from the bulk queue by its ID.
 * @param jobId - The ID of the job to retrieve.
 */
const getJob = (jobId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield bulkQueue.getJob(jobId);
        return job;
    }
    catch (err) {
        throw new Error(`Failed to retrieve job with ID ${jobId}: ${err.message}`);
    }
});
exports.getJob = getJob;
const getFinishedJob = (jobId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield bulkResultsQueue.getJob(jobId);
        return job;
    }
    catch (err) {
        throw new Error(`Failed to retrieve job with ID ${jobId}: ${err.message}`);
    }
});
exports.getFinishedJob = getFinishedJob;
/**
 * Pings Redis to ensure it's connected before use.
 */
const checkAlive = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient_1.default.ping();
        console.log('Queue Service connected successfully.');
    }
    catch (error) {
        console.error('Error connecting to Queue Service:', error);
        process.exit(1);
    }
});
exports.checkAlive = checkAlive;
