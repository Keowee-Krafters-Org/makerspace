// This TestRunner is designed to be executed in the Google Apps Script environment
// after the main 'Code.js' bundle has been loaded. It relies on the global
// 'Membership' object created by that bundle.
import { Member } from '../models/Member.js';
import { Registration } from '../models/Registration.js';
import { Login } from '../models/Login.js';
import { Waiver } from '../models/Waiver.js';
import { Page } from '../models/Page.js';
import { Response } from '../models/Response.js';
import { Lookup } from '../models/Lookup.js';
import { EventManagerIntegrationTests } from './EventManagerIntegrationTests.js';
import { FormIntegrationTests } from './FormIntegrationTests.js';
import { InvoiceManagerIntegrationTests } from './InvoiceManagerIntegrationTests.js';
import { MembershipIntegrationTests } from './MembershipIntegrationTests.js';
import { VendorManagerIntegrationTests } from './VendorManagerIntegrationTests.js';
import { ZohoIntegrationTests } from './ZohoIntegrationTests.js';

export class TestRunner {
    constructor() {
        this.suites = {
            EventManager: new EventManagerIntegrationTests(),
            Form: new FormIntegrationTests(),
            InvoiceManager: new InvoiceManagerIntegrationTests(),
            Membership: new MembershipIntegrationTests(),
            VendorManager: new VendorManagerIntegrationTests(),
            Zoho: new ZohoIntegrationTests(),
        };
    }

    run(suiteName, testName) {
        if (this.suites[suiteName] && typeof this.suites[suiteName].run === 'function') {
            Logger.log(`Running test '${testName}' in suite '${suiteName}'...`);
            this.suites[suiteName].run(testName);
            Logger.log(`Test '${testName}' in suite '${suiteName}' completed.`);
        } else {
            Logger.log(`Suite '${suiteName}' or test '${testName}' not found.`);
        }
    }

    runAll(suiteName) {
        if (suiteName) {
            if (this.suites[suiteName] && typeof this.suites[suiteName].runAll === 'function') {
                Logger.log(`Running all tests in suite '${suiteName}'...`);
                this.suites[suiteName].runAll();
                Logger.log(`All tests in suite '${suiteName}' completed.`);
            } else {
                Logger.log(`Suite '${suiteName}' not found.`);
            }
        } else {
            Logger.log('Running all test suites...');
            for (const name in this.suites) {
                if (typeof this.suites[name].runAll === 'function') {
                    Logger.log(`Running all tests in suite '${name}'...`);
                    this.suites[name].runAll();
                    Logger.log(`All tests in suite '${name}' completed.`);
                }
            }
            Logger.log('All test suites completed.');
        }
    }
}

/**
 * Global function to be called from the Google Apps Script editor to run all tests.
 */
globalThis.runTests = function() {
    const runner = new TestRunner();
    runner.runAll();
};

