import express from 'express';
import bodyParser from 'body-parser';
import {checkAlive} from './service/queueService';
import { initializeTemplateCache } from './service/templateService';
import { listenForTemplateUpdates } from './worker/newTemplateSubscriber';
import dotenv from 'dotenv';
import templateRoutes from "./routes/templateRoutes";
import signatureRoutes from "./routes/signatureRoutes";
import './worker/bulkWorker';



dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(bodyParser.json());
app.use('/api', templateRoutes); // base path for API routes
app.use('/api', signatureRoutes); // base path for API routes

app.get('/', (req, res) => {
  res.send('API is running.');
});

async function main() {
  try {
    // Ensure Queue Service is connected before anything else
    await checkAlive();

      // 1. Load templates from Redis or DB and populate local memory
      await initializeTemplateCache();

      // 2. Subscribe to template updates via Redis pub/sub
      await listenForTemplateUpdates();

      // 3. Start queue worker (import is enough to start it)

      console.log('Email Signature Generator is running...');

    if (!PORT) {
      throw new Error("App PORT is not defined in the environment variables.");
    }

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Error during application startup:', error);
    process.exit(1); // Exit the process on failure
  }
}

// Execute the main function
main();
