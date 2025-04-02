import {Worker, Queue, Job} from 'bullmq';
import redisClient from '../client/redisClient';
import { renderTemplate, renderPlainText } from '../service/templateService';
import {queryRepo} from "../repository/queryRepo"; // Use correct functions

const bulkQueueName = process.env.BULK_QUEUE_NAME;
const bulkResultsQueueName = process.env.RESULTS_BULK_QUEUE_NAME;
const failedResultsQueueName = process.env.FAILED_RESULTS_QUEUE_NAME;

const missingEnvVars = [];
if (!bulkQueueName) missingEnvVars.push("BULK_QUEUE_NAME");
if (!bulkResultsQueueName) missingEnvVars.push("RESULTS_BULK_QUEUE_NAME");
if (!failedResultsQueueName) missingEnvVars.push("FAILED_RESULTS_QUEUE_NAME");

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`);
}

const resultsQueue = new Queue(bulkResultsQueueName!, { connection: redisClient });
const failedResultsQueue = new Queue(failedResultsQueueName!, { connection: redisClient });


// Define worker to process jobs
const bulkWorker = new Worker(
  bulkQueueName!,
  async (job) => {
    console.log(`Processing bulk job ${job.id}...`);

    const { templateId, usersList, webhookUrl } = job.data;

    // Process each user
    const results = await Promise.all(
      usersList.map(async (user: any) => {
        try {
          // Render both HTML and text signatures using the correct functions
          const htmlSignature = renderTemplate(templateId, user);
          const textSignature = renderPlainText(templateId, user);

          return {
            user,
            htmlSignature,
            textSignature,
            status: "success"
          };
        } catch (error: unknown) {
            console.error(`Failed to generate signature for ${user.email}:`, error);

            let errorMessage = 'Unknown error';

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            return { user, error: errorMessage, status: "failed" };
        }
      })
    );

    // Send results to webhook if provided
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: job.id, results }),
        });
      } catch (err) {
        console.error("Failed to send webhook:", err);
      }
    }

    return results;
  },
  { connection: redisClient }
);

bulkWorker.on("completed", async (job, result) => {
    try {
        await resultsQueue.add(job.id!, { results: result });
        await queryRepo.updateStatus(job.id!, 'completed');
        console.log(`Job ${job.id} completed successfully.`);
    } catch (error) {
        console.error(`Failed to complete job ${job.id}:`, error);
    }
});

bulkWorker.on("failed", async (job: Job | undefined, err: Error, _prev: string) => {
    if (!job) {
        console.error("Received undefined job in 'failed' handler");
        return;
    }

    try {
        await failedResultsQueue.add(job.id!, { failed: err, job_data: job });
        await queryRepo.updateStatus(job.id!, 'failed');
        console.error(`Job ${job.id} failed:`, err);
    } catch (error) {
        console.error(`Failed to handle failure for job ${job.id}:`, error);
    }
});

export default bulkWorker;
