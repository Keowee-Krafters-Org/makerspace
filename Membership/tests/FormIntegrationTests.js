import { FormWaiver } from '../models/Form.js';
import { ModelFactory } from '../services/ModelFactory.js';
import { FormStorageManager } from '../storage/form/FormStorageManager.js';
import { WaiverManager } from '../services/WaiverManager.js';
import { SharedConfig } from '../config.js';

export class FormIntegrationTests {
    constructor() {
        this.modelFactory = ModelFactory;
        this.testMember = {
            emailAddress: 'test.user@example.com'
        };
    }

    run(testName, runAll = false) {
        if (runAll) {
            return this.runAll();
        }
        if (typeof this[testName] === 'function') {
            Logger.log(`Running test: ${testName}`);
            try {
                this[testName]();
                Logger.log(`Test '${testName}' passed.`);
            } catch (e) {
                Logger.log(`Test '${testName}' failed: ${e.message}`);
            }
        } else {
            Logger.log(`Test '${testName}' not found in suite.`);
        }
    }

    runAll() {
        Logger.log('Starting Form integration tests...');
        const tests = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(prop => prop.startsWith('test_') && typeof this[prop] === 'function');

        tests.forEach(testName => this.run(testName));

        Logger.log('Form integration tests completed.');
    }

    test_when_waiverFormSubmitted_then_documentGenerated() {
        const WAIVER_ID = SharedConfig.forms.waiver.formId;
        const formStorageManager = new FormStorageManager(FormWaiver);
        const waiverManager = this.modelFactory.waiverManager();

        // Locate the waiver form by its ID
        const waiverForm = formStorageManager.getById(WAIVER_ID);
        if (!waiverForm) {
            throw new Error(`Waiver form with ID ${WAIVER_ID} not found.`);
        }

        const waiver = waiverManager.generateWaiverDocument(this.testMember.emailAddress);
        console.log('Waiver document generated successfully.');

        const pdfFile = waiver.pdfLink;
        if (!pdfFile) {
            throw new Error(`PDF file for waiver with ID ${waiver.id} not found.`);
        }
    }

    test_when_waiver_is_created_then_waiver_is_available() {
        const formStorageManager = new FormStorageManager(FormWaiver);
        const waiverManager = new WaiverManager(formStorageManager);

        // Create a new waiver
        const waiverData = {
            title: 'Test Waiver',
            description: 'This is a test waiver.',
            items: [
                { id: '1', title: 'Item 1', type: 'TEXT' },
                { id: '2', title: 'Item 2', type: 'CHECKBOX' }
            ]
        };

        const waiver = waiverManager.create(waiverData);


        // Verify the waiver is available
        const retrievedWaiver = formStorageManager.getById(waiver.id);
        if (!retrievedWaiver) {
            throw new Error('Waiver not found after creation.');
        }

        console.log('Waiver created and retrieved successfully:', retrievedWaiver);
    }

    test_when_form_is_retrieved__then_it_is_valid() {
        const formStorageManager = new FormStorageManager(FormWaiver);
        const form = formStorageManager.getById(SharedConfig.forms.waiver.formId);

        assert('Form has questions', true, form.questions.length > 0);
    }
}

function runFormIntegrationTests() {
    new FormIntegrationTests().runAll();
}