import { Template } from '../type/template';

let templateMap: Record<string, Template> = {};

export function getTemplate(name: string): Template | undefined {
    return templateMap[name];
}

export function getAllTemplates(): Record<string, Template> {
    return templateMap;
}

export function setTemplates(templates: Template[]) {
    templateMap = {};
    templates.forEach(t => {
        templateMap[t.template_id] = t;
    });
    console.log(`[Cache] Set ${templates.length} templates in memory.`);
    console.log('[Cache] Cached template IDs:', Object.keys(templateMap));
}

export function addTemplateToCache(template: Template) {
    templateMap[template.template_id] = template;
    console.log(`[Cache] Added/Updated template "${template.template_id}" in memory.`);
}
