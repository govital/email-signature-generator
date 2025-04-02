import express from 'express';
import { addTemplate } from '../service/templateService';
import { Template } from '../type/template';

const router = express.Router();

router.post('/templates', async (req, res) => {
    try {
        const template: Template = req.body;

        if (!template.template_id || !template.template_html || !template.template_text) {
            return res.status(400).json({ error: 'Missing required template fields' });
        }

        await addTemplate(template);

        res.status(201).json({ message: 'Template added successfully' });
    } catch (err) {
        console.error('Failed to add template:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
