import express from 'express';
import {renderPlainText, renderTemplate} from '../service/templateService';
import {getFinishedJob, getJob, queueBulkRequest} from "../service/queueService";

const router = express.Router();

// API endpoint for generating a single email signature
router.post('/generate-signature', async (req, res) => {
    const { templateId, userData } = req.body;
    if (!templateId || !userData) {
        return res.status(400).json({ error: 'Missing templateId or userData' });
    }
    // Define required fields
    const requiredFields = ['fullName', 'email'];
    const missingFields = requiredFields.filter(field => !userData?.[field]);

    // If any required fields are missing, return a 400 error
    if (!templateId) {
        return res.status(400).json({ error: 'Missing templateId' });
    }

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: 'Missing required userData fields',
            missingFields
        });
    }
    try {
        const userDataNormalized = {
            fullName: userData.fullName || userData.name,
            email: userData.email,
            position: userData.position || '',
            mobilePhone: userData.mobilePhone || '',
            logo: userData.logo || ''
        };

        // Render HTML signature with the selected template
        const htmlSignature = renderTemplate(templateId, userDataNormalized);
        // Render plain text signature based on templateId
        const plainTextSignature = renderPlainText(templateId, userDataNormalized);
        res.json({ html: htmlSignature, text: plainTextSignature });
    } catch (error) {
        res.status(500).json({ error: 'Error generating signature' });
    }
});

// API endpoint for bulk email signature generation
router.post('/bulk-generate', async (req, res) => {
    const { templateId, usersList, webhookUrl } = req.body;

    if (!templateId || !usersList || !Array.isArray(usersList)) {
        return res.status(400).json({ error: 'Invalid request payload' });
    }

    try {
        const jobId = await queueBulkRequest(templateId, usersList, webhookUrl);
        res.json({ message: 'Bulk request queued successfully', jobId });
    } catch (error) {
        res.status(500).json({ error: 'Error queuing bulk request' });
    }
});

//API Endpoint for Polling Results - allow clients to check job status
router.get('/bulk-generate/status/:jobId', async (req, res) => {
    const { jobId } = req.params;

    const job = await getJob(jobId);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    const isCompleted = await job.isCompleted();
    const isFailed = await job.isFailed();

    if (isCompleted) {
        const result = await getFinishedJob(jobId);
        return res.json({ status: "completed", results: result?.data?.results || [] });
    }

    if (isFailed) {
        return res.json({ status: "failed", error: "Job failed during processing" });
    }

    return res.json({ status: "processing" });
});

export default router;
