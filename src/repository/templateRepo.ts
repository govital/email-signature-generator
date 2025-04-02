import { query } from '../client/dbClient';
import {Template} from "../type/template";

export const insertTemplate = async (template: Template): Promise<void> => {
    const sql = `
        INSERT INTO templates (template_id, template_html, template_text)
        VALUES ($1, $2, $3)
        ON CONFLICT (template_id)
            DO UPDATE SET template_html = EXCLUDED.template_html, template_text = EXCLUDED.template_text
    `;
    const values = [template.template_id, template.template_html, template.template_text];

    await query(sql, values);
};


export const getTemplatesFromDb = async (templateId: string) => {
    return await query('SELECT * FROM templates WHERE template_id = $1', [templateId]);
};

export const getAllTemplatesFromDb = async (): Promise<Template[]> => {
    const result = await query('SELECT * FROM templates');
    return result.rows;
};
