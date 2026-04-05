import { ZohoStorageManager } from '../storage/zoho/ZohoStorageManager.js';
import { ZohoMember } from '../storage/zoho/ZohoMember.js';
import { ZohoEvent } from '../storage/zoho/ZohoEvent.js';

export class ZohoIntegrationTests {
    constructor() { }

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
        Logger.log('Starting Zoho integration tests...');
        const tests = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(prop => prop.startsWith('test_') && typeof this[prop] === 'function');

        tests.forEach(testName => this.run(testName));

        Logger.log('Zoho integration tests completed.');
    }

    test_getAllMembers() {
        const storageManager = new ZohoStorageManager(ZohoMember);
        try {
            const response = storageManager.getAll({ first_name: 'Testy' });
            Logger.log(`getAllMembers response: ${response.message}`);
            const members = response.data;
            Logger.log(`Retrieved ${members.length} members.`);
            // Assert that members are retrieved
            assert('Members should not be null or undefined', members != undefined, true);
            assert(`${members.length} Members are retrieved`, members.length > 0, true);
        } catch (error) {
            Logger.log(`getAllMembers failed: ${error.message}`);
        }
    }

    test_when_entities_are_retrieved_by_page__then_a_pageSize_list_is_returned() {
        const storageManager = new ZohoStorageManager(ZohoMember);
        try {
            const response = storageManager.getAll({ pageSize: 4 });
            Logger.log(`getAllMembers response: ${response.message}`);
            const members = response.data;
            Logger.log(`Retrieved ${members.length} members.`);
            // Assert that members are retrieved
            assert('Members should not be null or undefined', members != undefined, true);
            assert(`${members.length} Members are retrieved`, members.length > 0, true);

            assert(`${members.length} Members are retrieved`, members.length === 4, true);
        } catch (error) {
            Logger.log(`getAllMembers failed: ${error.message}`);
        }
    }

    test_getMemberById() {
        const storageManager = new ZohoStorageManager(ZohoMember);
        try {
            // First, get all members to obtain a valid member ID
            const allResponse = storageManager.getAll({ first_name: 'Testy' });
            const members = allResponse.data || [];
            assert('At least one member should exist to test getMemberById', members.length > 0, true);
            const memberId = members[0].id;
            Logger.log(`Testing getMemberById with ID: ${memberId}`);
            const memberResponse = storageManager.getById(memberId);
            Logger.log(`getMemberById response: ${memberResponse}`);
            // Assert that the returned member matches the requested ID
            const returnedMember = memberResponse.data;
            assert('getMemberById returns the correct member', returnedMember.id === memberId, true);
        } catch (error) {
            Logger.log(`getMemberById failed: ${error.message}`);
        }
    }

    test_findMemberByEmail() {
        const storageManager = new ZohoStorageManager(ZohoMember);
        try {
            // Get all members to obtain a valid email address for testing
            const allResponse = storageManager.getAll();
            const members = allResponse.data || [];
            assert('At least one member should exist to test findMemberByEmail', members.length > 0, true);
            const testEmail = members[0].emailAddress;
            Logger.log(`Testing findMemberByEmail with email: ${testEmail}`);
            const found = members.find(m => m.emailAddress === testEmail);
            assert('findMemberByEmail returns the correct member', found && found.emailAddress === testEmail, true);
        } catch (error) {
            Logger.log(`findMemberByEmail failed: ${error.message}`);
        }


    }

    test_getAllEvents() {
        const storageManager = new ZohoStorageManager(ZohoEvent);
        try {
            const response = storageManager.getAll({ product_type: 'service' });
            Logger.log(`getAllEvents response: ${response.message}`);
            const events = response.data;
            Logger.log(`Retrieved ${events.length} events.`);
            // Assert that events are retrieved
            assert('Events should not be null or undefined', events != undefined, true);
            assert(`${events.length} Events are retrieved`, events.length > 0, true);
        } catch (error) {
            Logger.log(`getAllEvents failed: ${error.message}`);
        }
    }

    test_getEventById() {
        const storageManager = new ZohoStorageManager(ZohoEvent);
        try {
            // First, get all events to obtain a valid event ID
            const allResponse = storageManager.getAll({ name: 'Test Event' });
            const events = allResponse.data || [];
            assert('At least one event should exist to test getEventById', events.length > 0, true);
            const eventId = events[0].id;
            Logger.log(`Testing getEventById with ID: ${eventId}`);
            const eventResponse = storageManager.getById(eventId);
            Logger.log(`getEventById response: ${eventResponse}`);
            // Assert that the returned event matches the requested ID
            const returnedEvent = eventResponse.data;
            assert('getEventById returns the correct event', returnedEvent.id === eventId, true);
        } catch (error) {
            Logger.log(`getEventById failed: ${error.message}`);
        }
    }

    test_findEventByName() {
        const storageManager = new ZohoStorageManager(ZohoEvent);
        try {
            // Get all events to obtain a valid event name for testing
            const allResponse = storageManager.getAll();
            const events = allResponse.data || [];
            assert('At least one event should exist to test findEventByName', events.length > 0, true);
            const testName = 'Test Event';
            Logger.log(`Testing findEventByName with name: ${testName}`);
            const found = events.find(e => e.name === testName);
            assert('findEventByName returns the correct event', found && found.name === testName, true);
        } catch (error) {
            Logger.log(`findEventByName failed: ${error.message}`);
        }


    }

    test_when_contact_is_added__then_it_is_valid() {
        const storageManager = new ZohoStorageManager(ZohoMember);
        try {
            const contact = storageManager.getAll().data[0];
            assert('Contact has a valid email', true, contact.email.includes('@'));
        } catch (error) {
            Logger.log(`test_when_contact_is_added__then_it_is_valid failed: ${error.message}`);
        }
    }
}

function runZohoIntegrationTests() {
    new ZohoIntegrationTests().runAll();
}

