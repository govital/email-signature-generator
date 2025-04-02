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
const router = express_1.default.Router();
router.post('/templates', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const template = req.body;
        if (!template.template_id || !template.template_html || !template.template_text) {
            return res.status(400).json({ error: 'Missing required template fields' });
        }
        yield (0, templateService_1.addTemplate)(template);
        res.status(201).json({ message: 'Template added successfully' });
    }
    catch (err) {
        console.error('Failed to add template:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
exports.default = router;
