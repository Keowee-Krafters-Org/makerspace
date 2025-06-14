/**
 * Integration test for the ZohoStorageManager and the Zoho API.
 * This test suite covers the functionality of retrieving all customers,
 * retrieving a member (contact) by ID, and finding a member by email.
 * It uses the Zoho API to interact with Zoho Books and Zoho CRM.
 * @returns {void}
 * @example
 * membershipIntegrationTests();
 */
function membershipIntegrationTests() {
    Logger.log('Starting Zoho API integration tests...');

    // Test: getAllMembers
    test_getAllMembers();

    // Test: getMemberById
    test_getMemberById();

    // Test: findMemberByEmail
    test_findMemberByEmail();

    // Test: getAllEvents
    test_getAllEvents();

    // Test: getEventById
    test_getEventById();

    // Test: findEventByName
    test_findEventByName();

    Logger.log('Zoho API integration tests completed.');
}   

/**
 * Test for retrieving all members from ZohoStorageManager.
 * This test checks if the API can successfully retrieve a list of customers.
 * @returns {void}
 */
function test_getAllMembers() {
    const storageManager = new ZohoStorageManager(ZohoMember);
    try {
        const response = storageManager.getAll({first_name: 'Testy'});
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

/**
 * Test for retrieving a member by ID from ZohoStorageManager.
 * @returns {void}
 */
function test_getMemberById() {
    const storageManager = new ZohoStorageManager(ZohoMember);    
    try {
        // First, get all members to obtain a valid member ID
        const allResponse = storageManager.getAll({first_name: 'Testy'});
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

/**
 * Test for finding a member by email from ZohoStorageManager.
 * @returns {void}
 */
function test_findMemberByEmail() {
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

/**
 * Test for retrieving all events from ZohoStorageManager.
 * This test checks if the API can successfully retrieve a list of events.
 * @returns {void}
 */
function test_getAllEvents() {
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

/**
 * Test for retrieving an event by ID from ZohoStorageManager.
 * @returns {void}
 */
function test_getEventById() {
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

/**
 * Test for finding an event by name from ZohoStorageManager.
 * @returns {void}
 */
function test_findEventByName() {
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

