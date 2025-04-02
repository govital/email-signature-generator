import { renderTemplate } from '../service/templateService';
import fs from 'fs';
import path from 'path';

describe('Template Service Tests', () => {
    const testTemplateId = 'test-template';
    const testUserData = {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
    };

    beforeAll(() => {
        // Make sure the templates directory exists
        const templateDir = path.resolve(__dirname, '../templates');
        if (!fs.existsSync(templateDir)) {
            fs.mkdirSync(templateDir, { recursive: true });
        }

        // Write a test template
        fs.writeFileSync(path.join(templateDir, `${testTemplateId}.njk`),
            `<table><tr><td>{{ fullName }}</td></tr></table>`
        );
    });

    test('renders HTML template correctly', async () => {
        const htmlOutput = await renderTemplate(testTemplateId, testUserData);
        expect(htmlOutput).toContain(testUserData.fullName);
    });

    afterAll(() => {
        // Cleanup test template
        fs.unlinkSync(path.join(__dirname, `../templates/${testTemplateId}.njk`));
    });
});
