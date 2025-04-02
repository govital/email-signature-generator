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
const templateService_1 = require("../service/templateService");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
describe('Template Service Tests', () => {
    const testTemplateId = 'test-template';
    const testUserData = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
    };
    beforeAll(() => {
        // Make sure the templates directory exists
        const templateDir = path_1.default.resolve(__dirname, '../templates');
        if (!fs_1.default.existsSync(templateDir)) {
            fs_1.default.mkdirSync(templateDir, { recursive: true });
        }
        // Write a test template
        fs_1.default.writeFileSync(path_1.default.join(templateDir, `${testTemplateId}.njk`), `<table><tr><td>{{ fullName }}</td></tr></table>`);
    });
    test('renders HTML template correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const htmlOutput = yield (0, templateService_1.renderTemplate)(testTemplateId, testUserData);
        expect(htmlOutput).toContain(testUserData.fullName);
    }));
    afterAll(() => {
        // Cleanup test template
        fs_1.default.unlinkSync(path_1.default.join(__dirname, `../templates/${testTemplateId}.njk`));
    });
});
