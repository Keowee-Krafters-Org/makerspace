import { ModelFactory } from '../services/ModelFactory.js';
import { Instructor } from '../models/Instructor.js';

export class VendorManagerIntegrationTests {
    constructor() {
        this.modelFactory = new ModelFactory();
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
        Logger.log('Starting VendorManager integration tests...');
        const tests = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(prop => prop.startsWith('test_') && typeof this[prop] === 'function');

        tests.forEach(testName => this.run(testName));

        Logger.log('VendorManager integration tests completed.');
    }

    test_when_listInstructors_is_called__then_instructors_are_returned() {

        const vendorManager = this.modelFactory.vendorManager();
        const params = { page: { 'page': 1, 'pageSize': 10 }, instructor: true };

        const response = vendorManager.getAllVendors(params);

        assert('Vendors returned', response.success, true);
        assert('At least one instructor returned', response.data.length > 0, true);
        assert('Instructor has expected fields', response.data[0] instanceof Instructor, true);
        assert('Instructor has name field', typeof response.data[0].name === 'string', true);
        assert('Instructor has email field', typeof response.data[0].emailAddress === 'string', true);
        assert('Instructor has instructor field', response.data[0].instructor === 'true', true);

    }

    test_when_vendor_is_added__then_it_is_valid() {

        const vendorManager = this.modelFactory.vendorManager();
        const vendor = { name: 'test vendor', email: 'test@vendor.com' };

        const response = vendorManager.addVendor(vendor);

        assert('Vendor has a name', true, vendor.name.length > 0);
    }
}

function runVendorManagerIntegrationTests() {
    new VendorManagerIntegrationTests().runAll();
}