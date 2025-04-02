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
exports.renderPlainText = exports.renderTemplate = void 0;
exports.initializeTemplateCache = initializeTemplateCache;
exports.addTemplate = addTemplate;
const nunjucks_1 = __importDefault(require("nunjucks"));
const templateRepo_1 = require("../repository/templateRepo");
const templateCache_1 = require("../cache/templateCache");
const templateCache_2 = require("../cache/templateCache");
const templateRepo_2 = require("../repository/templateRepo");
const redisClient_1 = __importDefault(require("../client/redisClient"));
const TEMPLATE_CACHE_KEY = 'emailTemplates';
function initializeTemplateCache() {
    return __awaiter(this, void 0, void 0, function* () {
        let raw = yield redisClient_1.default.get(TEMPLATE_CACHE_KEY);
        if (raw) {
            const templates = JSON.parse(raw);
            (0, templateCache_1.setTemplates)(templates);
            console.log('[Cache] Loaded templates from Redis');
        }
        else {
            const templates = yield (0, templateRepo_1.getAllTemplatesFromDb)();
            yield redisClient_1.default.set(TEMPLATE_CACHE_KEY, JSON.stringify(templates));
            (0, templateCache_1.setTemplates)(templates);
            console.log('[Cache] Loaded templates from DB and saved to Redis');
        }
    });
}
function addTemplate(template) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1. Insert into DB
            yield (0, templateRepo_2.insertTemplate)(template);
            // 2. Fetch current list from Redis
            const raw = yield redisClient_1.default.get(TEMPLATE_CACHE_KEY);
            let templates = raw ? JSON.parse(raw) : [];
            // 3. Replace or insert the template
            const index = templates.findIndex(t => t.template_id === template.template_id);
            if (index !== -1) {
                templates[index] = Object.assign(Object.assign({}, templates[index]), template); // update
            }
            else {
                templates.push(template); // insert
            }
            // 4. Save updated list back to Redis
            yield redisClient_1.default.set(TEMPLATE_CACHE_KEY, JSON.stringify(templates));
            // ✅ 5. Publish ONLY the updated/new template
            yield redisClient_1.default.publish('template-updated', JSON.stringify(template));
            console.log('[Cache] Published new template to Redis pub/sub');
        }
        catch (err) {
            console.error('[addTemplate] Error:', err);
            throw err;
        }
    });
}
nunjucks_1.default.configure({ autoescape: true });
console.log("✅ Nunjucks configured with in-memory templates (no file system path).");
/**
 * Renders the HTML version of the template using in-memory cache.
 */
const renderTemplate = (templateId, userData) => {
    const template = (0, templateCache_2.getTemplate)(templateId);
    if (!template) {
        throw new Error(`Template with ID ${templateId} not found in cache.`);
    }
    try {
        return nunjucks_1.default.renderString(template.template_html, userData);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Template rendering error: ${error.message}`);
        }
        else {
            console.error(`Unknown error occurred while rendering HTML template`, error);
        }
        throw new Error('Error rendering HTML template');
    }
};
exports.renderTemplate = renderTemplate;
/**
 * Renders the plain text version of the template using in-memory cache.
 */
const renderPlainText = (templateId, userData) => {
    const template = (0, templateCache_2.getTemplate)(templateId);
    if (!template) {
        throw new Error(`Template with ID ${templateId} not found in cache.`);
    }
    try {
        return nunjucks_1.default.renderString(template.template_text, userData).trim();
    }
    catch (error) {
        console.error(`❌ Error rendering plain text template for ${templateId}:`, error);
        return "Plain text signature not available.";
    }
};
exports.renderPlainText = renderPlainText;
