import { Queue } from 'bullmq';
import redisClient from '../client/redisClient';
import { getTemplatesFromDb } from '../repository/templateRepo';
import {queryRepo} from "../repository/queryRepo";
import {getTemplate} from "../cache/templateCache";

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
const bulkQueue = new Queue(bulkQueueName, {
    connection: redisClient,
});

const bulkResultsQueue = new Queue(bulkResultsQueueName!, {
    connection: redisClient,
});

/**
 * Queues a bulk email signature generation request.
 * @param templateId - The template ID to use.
 * @param usersList - The list of users to generate signatures for.
 * @param webhookUrl - (Optional) Webhook to send results.
 */
export const queueBulkRequest = async (
    templateId: string,
    usersList: any[],
    webhookUrl?: string
) => {
    // Step 1: Check if the template exists
    const template = getTemplate(templateId);
    if (!template) {
        throw new Error(`Template with ID ${templateId} not found in cache.`);
    }

    // Step 2: Add job to BullMQ queue
    const job = await bulkQueue.add(bulkJobName, {
        templateId,
        usersList,
        webhookUrl,
    });

    // Step 3: Save request record in DB
    try {
        await queryRepo.saveQuery({
            job_id: job.id as string,
            template_id: templateId,
            users_count: usersList.length,
            users_list: usersList,
            webhook_url: webhookUrl || undefined, // only passes if defined
        });
    } catch (err) {
        throw new Error(`Failed to save job metadata: ${(err as Error).message}`);
    }

    // Step 4: Return job ID
    return job.id;
};

/**
 * Retrieves a job from the bulk queue by its ID.
 * @param jobId - The ID of the job to retrieve.
 */
export const getJob = async (jobId: string) => {
    try {
        const job = await bulkQueue.getJob(jobId);
        return job;
    } catch (err) {
        throw new Error(`Failed to retrieve job with ID ${jobId}: ${(err as Error).message}`);
    }
};

export const getFinishedJob = async (jobId: string) => {
    try {
        const job = await bulkResultsQueue.getJob(jobId);
        return job;
    } catch (err) {
        throw new Error(`Failed to retrieve job with ID ${jobId}: ${(err as Error).message}`);
    }
};




/**
 * Pings Redis to ensure it's connected before use.
 */
export const checkAlive = async () => {
  try {
    await redisClient.ping();
    console.log('Queue Service connected successfully.');
  } catch (error) {
    console.error('Error connecting to Queue Service:', error);
    process.exit(1);
  }
};
