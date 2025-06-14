/**
 * Test the EventManager integration with Zoho API.
 * This test checks if the EventManager can successfully retrieve events and perform CRUD operations.
 * @returns {void}
 * @example
 * eventManagerIntegrationTests();  
 */

function eventManagerIntegrationTests() {
    Logger.log('Starting EventManager integration tests...');

    test_getEventList();
    test_getUpcomingEvents();
    test_getAvailableEvents();
    // test_addEvent();
    test_updateEvent();
    // test_deleteEvent();

    Logger.log('EventManager integration tests completed.');
}

/**
 * Test for retrieving the event list from EventManager.
 * This test checks if the API can successfully retrieve a list of events.
 * @returns {void}
 */
function test_getEventList() {
    const eventManager = newEventManager();
    try {
        const response = eventManager.getEventList();
        Logger.log(`getEventList response: ${response.message}`);
        const events = response.data;
        Logger.log(`Retrieved ${events.length} events.`);
        assert('Events should not be null or undefined', events != undefined, true);
        assert(`${events.length} Events are retrieved`, events.length > 0, true);
    } catch (error) {
        Logger.log(`getEventList failed: ${error.message}`);
    }
}

/**
 * Test for retrieving upcoming events from EventManager.
 * This test checks if the API can successfully retrieve a list of upcoming events.
 * @returns {void}
 */
function test_getUpcomingEvents() {
    const eventManager = newEventManager();
    try {
        const response = eventManager.getUpcomingEvents();
        Logger.log(`getUpcomingEvents response: ${response.message}`);
        const events = response.data;
        Logger.log(`Retrieved ${events.length} upcoming events.`);
        assert('Upcoming events should not be null or undefined', events != undefined, true);
        assert(`${events.length} Upcoming Events are retrieved`, events.length > 0, true);
    } catch (error) {
        Logger.log(`getUpcomingEvents failed: ${error.message}`);
    }
}

/**
 * Test for retrieving available events from EventManager.
 * This test checks if the API can successfully retrieve a list of available events.
 * @returns {void}
 */
function test_getAvailableEvents() {
    const eventManager = newEventManager();
    try {
        const response = eventManager.getAvailableEvents();
        Logger.log(`getAvailableEvents response: ${response.message}`);
        const events = response.data;
        Logger.log(`Retrieved ${events.length} available events.`);
        assert('Available events should not be null or undefined', events != undefined, true);
        assert(`${events.length} Available Events are retrieved`, events.length > 0, true);
    } catch (error) {
        Logger.log(`getAvailableEvents failed: ${error.message}`);
    }
}

/**
 * Test for adding a new event to EventManager.
 * This test checks if the API can successfully add a new event.
 * @returns {void}
 */
function test_addEvent() {
    const eventManager = newEventManager();
    try {
        const eventData = {
            name: 'Test Event',
            date: new Date(),
            location: 'Test Location',
            sizeLimit: 100,
            host: 'Test Host',
            description: 'This is a test event.',
            price: 0,
            cost: 0,
            type: 'Class',
            instructorName: 'Test Instructor',
            instructorEmail: '',
            costDescription: 'Free event'
        };
        const response = eventManager.addEvent(eventData);
        Logger.log(`addEvent response: ${response.message}`);
        assert('Event should be added successfully', response.success, true);
        assert('Event ID should be returned', response.eventId != undefined, true);
    } catch (error) {
        Logger.log(`addEvent failed: ${error.message}`);
    }
}

/**
 * Test for updating an existing event in EventManager.
 * This test checks if the API can successfully update an existing event.
 * @returns {void}
 */
function test_updateEvent() {
    const eventManager = newEventManager();
    try {
        // First, find the test event to update
        const originalResponse = eventManager.getEventList({ name: 'Test Event' });
        const originalEvent = originalResponse.data[0]; 
        const eventId = originalEvent.id;

        // Now, update the event
        const updatedData = new ZohoEvent({name: originalEvent.name, id: eventId, rate: originalEvent.rate, description: 'Updated Test Description' });
        const response = eventManager.updateEvent(eventId, updatedData);
        Logger.log(`updateEvent response: ${response.message}`);
        assert('Event should be updated successfully', response.success, true);
    } catch (error) {
        Logger.log(`updateEvent failed: ${error.message}`);
    }
}

/**
 * Test for deleting an event from EventManager.
 * This test checks if the API can successfully delete an event.
 * @returns {void}
 */
function test_deleteEvent() {
    const eventManager = newEventManager();
    try {
        // First, add a new event to delete
        const addResponse = eventManager.addEvent({
            name: 'Delete Test Event',
            date: new Date(),
            location: 'Test Location',
            sizeLimit: 100,
            host: 'Test Host',
            description: 'This is a test event.',
            price: 0,
            cost: 0,
            type: 'Class',
            instructorName: 'Test Instructor',
            instructorEmail: '',
            costDescription: 'Free event'
        });
        const eventId = addResponse.eventId;

        // Now, delete the event
        const response = eventManager.deleteEvent(eventId);
        Logger.log(`deleteEvent response: ${response.message}`);
        assert('Event should be deleted successfully', response.success, true);
    } catch (error) {
        Logger.log(`deleteEvent failed: ${error.message}`);
    }
}