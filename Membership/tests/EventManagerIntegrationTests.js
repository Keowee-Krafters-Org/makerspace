/**
 * Test the EventManager integration with Zoho API.
 * This test checks if the EventManager can successfully retrieve events and perform CRUD operations.
 * @returns {void}
 * @example
 * eventManagerIntegrationTests();  
 */
const TEST_EVENT_NAME = 'Test Event'; 
const TEST_USER_EMAIL = 'testuser@keoweekrafters.org'; 
const modelFactory = newModelFactory();

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

function test_getEventList() {
    const eventManager = modelFactory.newEventManager();
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

function test_getUpcomingEvents() {
    const eventManager = modelFactory.newEventManager();
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

function test_getAvailableEvents() {
    const eventManager = modelFactory.newEventManager();
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

function test_addEvent() {
    const eventManager = modelFactory.eventManager();
    const calendarManager = modelFactory.calendarManager();
    try {
        const eventData = {
            title: 'Test Event',
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
        assert('Calendar ID should be returned', response.calendarId != undefined, true);

        // Validate the calendar event was created
        const calendarEvent = calendarManager.calendar.getEventById(response.calendarId);
        assert('Calendar event should exist', calendarEvent != null, true);
        assert('Calendar event title matches', calendarEvent.getTitle(), eventData.title);
        Logger.log('Calendar event verification passed.');
    } catch (error) {
        Logger.log(`addEvent failed: ${error.message}`);
    }
}

function test_updateEvent() {
    const eventManager = modelFactory.newEventManager();
    try {
        const originalResponse = eventManager.getEventList({ name: 'Test Event' });
        const originalEvent = originalResponse.data[0]; 
        const eventId = originalEvent.id;

        const updatedData = new ZohoEvent({name: originalEvent.name, id: eventId, rate: originalEvent.rate, description: 'Updated Test Description' });
        const response = eventManager.updateEvent( updatedData);
        Logger.log(` response: ${response.message}`);
        assert('Event should be updated successfully', response.success, true);
    } catch (error) {
        Logger.log(` failed: ${error.message}`);
    }
}

function test_deleteEvent() {
    const eventManager = modelFactory.newEventManager();
    try {
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

        const response = eventManager.deleteEvent(eventId);
        Logger.log(`deleteEvent response: ${response.message}`);
        assert('Event should be deleted successfully', response.success, true);
    } catch (error) {
        Logger.log(`deleteEvent failed: ${error.message}`);
    }
}

function test_when_member_signs_up_for_event__then_event_is_updated() {
    const membershipManager = modelFactory.newMembershipManager(); 
    const member = membershipManager.memberLookup(TEST_USER_EMAIL); 
    const eventManager = modelFactory.newEventManager(); 
    assert('Found member', member != undefined, true);

    const testMemberId = member.id; 
    const eventResponse = eventManager.getEventList({name: TEST_EVENT_NAME}); 
    assert('Event found',true, eventResponse.success != undefined && eventResponse.data  != undefined); 

    const testEvent = eventResponse.data[0]; 
    const testEventId = testEvent.id; 

    const confirmation  = eventManager.signup(testEventId, testMemberId);

    Logger.log(JSON.stringify(confirmation));
}
