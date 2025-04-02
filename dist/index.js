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
const body_parser_1 = __importDefault(require("body-parser"));
const queueService_1 = require("./service/queueService");
const templateService_1 = require("./service/templateService");
const newTemplateSubscriber_1 = require("./worker/newTemplateSubscriber");
const dotenv_1 = __importDefault(require("dotenv"));
const templateRoutes_1 = __importDefault(require("./routes/templateRoutes"));
const signatureRoutes_1 = __importDefault(require("./routes/signatureRoutes"));
require("./worker/bulkWorker");
dotenv_1.default.config();
const PORT = process.env.PORT;
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use('/api', templateRoutes_1.default); // base path for API routes
app.use('/api', signatureRoutes_1.default); // base path for API routes
app.get('/', (req, res) => {
    res.send('API is running.');
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Ensure Queue Service is connected before anything else
            yield (0, queueService_1.checkAlive)();
            // 1. Load templates from Redis or DB and populate local memory
            yield (0, templateService_1.initializeTemplateCache)();
            // 2. Subscribe to template updates via Redis pub/sub
            yield (0, newTemplateSubscriber_1.listenForTemplateUpdates)();
            // 3. Start queue worker (import is enough to start it)
            console.log('Email Signature Generator is running...');
            if (!PORT) {
                throw new Error("App PORT is not defined in the environment variables.");
            }
            // Start Express server
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        }
        catch (error) {
            console.error('Error during application startup:', error);
            process.exit(1); // Exit the process on failure
        }
    });
}
// Execute the main function
main();
