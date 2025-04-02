import nunjucks from 'nunjucks';
import {getAllTemplatesFromDb} from '../repository/templateRepo';
import { setTemplates } from '../cache/templateCache';
import { Template } from '../type/template';
import { getTemplate } from '../cache/templateCache';
import { insertTemplate } from '../repository/templateRepo';
import redisClient from '../client/redisClient';

const TEMPLATE_CACHE_KEY = 'emailTemplates';

export async function initializeTemplateCache() {
    let raw = await redisClient.get(TEMPLATE_CACHE_KEY);
    if (raw) {
        const templates: Template[] = JSON.parse(raw);
        setTemplates(templates);
        console.log('[Cache] Loaded templates from Redis');
    } else {
        const templates = await getAllTemplatesFromDb();
        await redisClient.set(TEMPLATE_CACHE_KEY, JSON.stringify(templates));
        setTemplates(templates);
        console.log('[Cache] Loaded templates from DB and saved to Redis');
    }
}

export async function addTemplate(template: Template) {
    try {
        // 1. Insert into DB
        await insertTemplate(template);

        // 2. Fetch current list from Redis
        const raw = await redisClient.get(TEMPLATE_CACHE_KEY);
        let templates: Template[] = raw ? JSON.parse(raw) : [];

        // 3. Replace or insert the template
        const index = templates.findIndex(t => t.template_id === template.template_id);
        if (index !== -1) {
            templates[index] = { ...templates[index], ...template }; // update
        } else {
            templates.push(template); // insert
        }

        // 4. Save updated list back to Redis
        await redisClient.set(TEMPLATE_CACHE_KEY, JSON.stringify(templates));

        // ✅ 5. Publish ONLY the updated/new template
        await redisClient.publish('template-updated', JSON.stringify(template));

        console.log('[Cache] Published new template to Redis pub/sub');
    } catch (err) {
        console.error('[addTemplate] Error:', err);
        throw err;
    }
}




nunjucks.configure({ autoescape: true });
console.log("✅ Nunjucks configured with in-memory templates (no file system path).")

/**
 * Renders the HTML version of the template using in-memory cache.
 */
export const renderTemplate = (templateId: string, userData: any): string => {
    const template = getTemplate(templateId);

    if (!template) {
        throw new Error(`Template with ID ${templateId} not found in cache.`);
    }

    try {
        return nunjucks.renderString(template.template_html, userData);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Template rendering error: ${error.message}`);
        } else {
            console.error(`Unknown error occurred while rendering HTML template`, error);
        }
        throw new Error('Error rendering HTML template');
    }
};

/**
 * Renders the plain text version of the template using in-memory cache.
 */
export const renderPlainText = (templateId: string, userData: any): string => {
    const template = getTemplate(templateId);

    if (!template) {
        throw new Error(`Template with ID ${templateId} not found in cache.`);
    }

    try {
        return nunjucks.renderString(template.template_text, userData).trim();
    } catch (error) {
        console.error(`❌ Error rendering plain text template for ${templateId}:`, error);
        return "Plain text signature not available.";
    }
};


