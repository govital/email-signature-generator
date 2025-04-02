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
const bullmq_1 = require("bullmq");
const redisClient_1 = __importDefault(require("../client/redisClient"));
const templateService_1 = require("../service/templateService");
const queryRepo_1 = require("../repository/queryRepo"); // Use correct functions
const bulkQueueName = process.env.BULK_QUEUE_NAME;
const bulkResultsQueueName = process.env.RESULTS_BULK_QUEUE_NAME;
const failedResultsQueueName = process.env.FAILED_RESULTS_QUEUE_NAME;
const missingEnvVars = [];
if (!bulkQueueName)
    missingEnvVars.push("BULK_QUEUE_NAME");
if (!bulkResultsQueueName)
    missingEnvVars.push("RESULTS_BULK_QUEUE_NAME");
if (!failedResultsQueueName)
    missingEnvVars.push("FAILED_RESULTS_QUEUE_NAME");
if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}
const resultsQueue = new bullmq_1.Queue(bulkResultsQueueName, { connection: redisClient_1.default });
const failedResultsQueue = new bullmq_1.Queue(failedResultsQueueName, { connection: redisClient_1.default });
// Define worker to process jobs
const bulkWorker = new bullmq_1.Worker(bulkQueueName, (job) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Processing bulk job ${job.id}...`);
    const { templateId, usersList, webhookUrl } = job.data;
    // Process each user
    const results = yield Promise.all(usersList.map((user) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Render both HTML and text signatures using the correct functions
            const htmlSignature = (0, templateService_1.renderTemplate)(templateId, user);
            const textSignature = (0, templateService_1.renderPlainText)(templateId, user);
            return {
                user,
                htmlSignature,
                textSignature,
                status: "success"
            };
        }
        catch (error) {
            console.error(`Failed to generate signature for ${user.email}:`, error);
            let errorMessage = 'Unknown error';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            return { user, error: errorMessage, status: "failed" };
        }
    })));
    // Send results to webhook if provided
    if (webhookUrl) {
        try {
            yield fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobId: job.id, results }),
            });
        }
        catch (err) {
            console.error("Failed to send webhook:", err);
        }
    }
    return results;
}), { connection: redisClient_1.default });
bulkWorker.on("completed", (job, result) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield resultsQueue.add(job.id, { results: result });
        yield queryRepo_1.queryRepo.updateStatus(job.id, 'completed');
        console.log(`Job ${job.id} completed successfully.`);
    }
    catch (error) {
        console.error(`Failed to complete job ${job.id}:`, error);
    }
}));
bulkWorker.on("failed", (job, err, _prev) => __awaiter(void 0, void 0, void 0, function* () {
    if (!job) {
        console.error("Received undefined job in 'failed' handler");
        return;
    }
    try {
        yield failedResultsQueue.add(job.id, { failed: err, job_data: job });
        yield queryRepo_1.queryRepo.updateStatus(job.id, 'failed');
        console.error(`Job ${job.id} failed:`, err);
    }
    catch (error) {
        console.error(`Failed to handle failure for job ${job.id}:`, error);
    }
}));
exports.default = bulkWorker;
