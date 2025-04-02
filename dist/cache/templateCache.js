"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplate = getTemplate;
exports.getAllTemplates = getAllTemplates;
exports.setTemplates = setTemplates;
exports.addTemplateToCache = addTemplateToCache;
let templateMap = {};
function getTemplate(name) {
    return templateMap[name];
}
function getAllTemplates() {
    return templateMap;
}
function setTemplates(templates) {
    templateMap = {};
    templates.forEach(t => {
        templateMap[t.template_id] = t;
    });
    console.log(`[Cache] Set ${templates.length} templates in memory.`);
    console.log('[Cache] Cached template IDs:', Object.keys(templateMap));
}
function addTemplateToCache(template) {
    templateMap[template.template_id] = template;
    console.log(`[Cache] Added/Updated template "${template.template_id}" in memory.`);
}
