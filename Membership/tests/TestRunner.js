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

const DEFAULT_TEST_CONFIG = {
    defaultSuiteEnabled: false,
    unlistedTestsEnabled: false,
    suites: {},
};

function getRuntimeTestConfig() {
    try {
        const cfg = (typeof globalThis !== 'undefined' && globalThis.TEST_CONFIG) ? globalThis.TEST_CONFIG : null;
        if (cfg && typeof cfg === 'object') return cfg;
    } catch {
        // ignore and use default
    }
    return DEFAULT_TEST_CONFIG;
}

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
        this.testConfig = getRuntimeTestConfig();
    }

    getSuiteTests(suite) {
        return Object.getOwnPropertyNames(Object.getPrototypeOf(suite))
            .filter(name => name.startsWith('test_') && typeof suite[name] === 'function');
    }

    isSuiteEnabled(suiteName) {
        const suiteCfg = this.testConfig?.suites?.[suiteName];
        if (suiteCfg && Object.prototype.hasOwnProperty.call(suiteCfg, 'enabled')) {
            return suiteCfg.enabled !== false;
        }
        return this.testConfig?.defaultSuiteEnabled !== false;
    }

    isTestEnabled(suiteName, testName) {
        const suiteCfg = this.testConfig?.suites?.[suiteName] || {};
        const tests = suiteCfg.tests || {};
        if (Object.prototype.hasOwnProperty.call(tests, testName)) {
            return tests[testName] !== false;
        }
        return this.testConfig?.unlistedTestsEnabled !== false;
    }

    runSuiteWithConfig(suiteName) {
        const suite = this.suites[suiteName];
        if (!suite || typeof suite.run !== 'function') {
            Logger.log(`Suite '${suiteName}' not found.`);
            return;
        }

        if (!this.isSuiteEnabled(suiteName)) {
            Logger.log(`Skipping suite '${suiteName}' (disabled in testConfig).`);
            return;
        }

        const allTests = this.getSuiteTests(suite);
        const enabledTests = allTests.filter(testName => this.isTestEnabled(suiteName, testName));

        if (enabledTests.length === 0) {
            Logger.log(`No enabled tests found for suite '${suiteName}'.`);
            return;
        }

        Logger.log(`Running ${enabledTests.length}/${allTests.length} enabled tests in suite '${suiteName}'...`);
        enabledTests.forEach(testName => this.run(suiteName, testName));
        Logger.log(`Enabled tests in suite '${suiteName}' completed.`);
    }

    run(suiteName, testName) {
        if (!this.isSuiteEnabled(suiteName)) {
            Logger.log(`Suite '${suiteName}' is disabled in testConfig.`);
            return;
        }
        if (!this.isTestEnabled(suiteName, testName)) {
            Logger.log(`Test '${testName}' in suite '${suiteName}' is disabled in testConfig.`);
            return;
        }
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
            this.runSuiteWithConfig(suiteName);
        } else {
            Logger.log('Running enabled tests in all suites...');
            for (const name in this.suites) {
                this.runSuiteWithConfig(name);
            }
            Logger.log('All enabled test suites completed.');
        }
    }
}


