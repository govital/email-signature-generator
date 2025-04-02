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
const express_1 = __importDefault(require("express"));
const templateService_1 = require("../service/templateService");
const queueService_1 = require("../service/queueService");
const router = express_1.default.Router();
// API endpoint for generating a single email signature
router.post('/generate-signature', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId, userData } = req.body;
    if (!templateId || !userData) {
        return res.status(400).json({ error: 'Missing templateId or userData' });
    }
    // Define required fields
    const requiredFields = ['fullName', 'email'];
    const missingFields = requiredFields.filter(field => !(userData === null || userData === void 0 ? void 0 : userData[field]));
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
        const htmlSignature = (0, templateService_1.renderTemplate)(templateId, userDataNormalized);
        // Render plain text signature based on templateId
        const plainTextSignature = (0, templateService_1.renderPlainText)(templateId, userDataNormalized);
        res.json({ html: htmlSignature, text: plainTextSignature });
    }
    catch (error) {
        res.status(500).json({ error: 'Error generating signature' });
    }
}));
// API endpoint for bulk email signature generation
router.post('/bulk-generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { templateId, usersList, webhookUrl } = req.body;
    if (!templateId || !usersList || !Array.isArray(usersList)) {
        return res.status(400).json({ error: 'Invalid request payload' });
    }
    try {
        const jobId = yield (0, queueService_1.queueBulkRequest)(templateId, usersList, webhookUrl);
        res.json({ message: 'Bulk request queued successfully', jobId });
    }
    catch (error) {
        res.status(500).json({ error: 'Error queuing bulk request' });
    }
}));
//API Endpoint for Polling Results - allow clients to check job status
router.get('/bulk-generate/status/:jobId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { jobId } = req.params;
    const job = yield (0, queueService_1.getJob)(jobId);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }
    const isCompleted = yield job.isCompleted();
    const isFailed = yield job.isFailed();
    if (isCompleted) {
        const result = yield (0, queueService_1.getFinishedJob)(jobId);
        return res.json({ status: "completed", results: ((_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.results) || [] });
    }
    if (isFailed) {
        return res.json({ status: "failed", error: "Job failed during processing" });
    }
    return res.json({ status: "processing" });
}));
exports.default = router;
