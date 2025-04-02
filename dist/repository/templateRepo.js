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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTemplatesFromDb = exports.getTemplatesFromDb = exports.insertTemplate = void 0;
const dbClient_1 = require("../client/dbClient");
const insertTemplate = (template) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = `
        INSERT INTO templates (template_id, template_html, template_text)
        VALUES ($1, $2, $3)
        ON CONFLICT (template_id)
            DO UPDATE SET template_html = EXCLUDED.template_html, template_text = EXCLUDED.template_text
    `;
    const values = [template.template_id, template.template_html, template.template_text];
    yield (0, dbClient_1.query)(sql, values);
});
exports.insertTemplate = insertTemplate;
const getTemplatesFromDb = (templateId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield (0, dbClient_1.query)('SELECT * FROM templates WHERE template_id = $1', [templateId]);
});
exports.getTemplatesFromDb = getTemplatesFromDb;
const getAllTemplatesFromDb = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, dbClient_1.query)('SELECT * FROM templates');
    return result.rows;
});
exports.getAllTemplatesFromDb = getAllTemplatesFromDb;
