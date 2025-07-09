/**
 * Test the EventManager integration with Zoho API.
 * This test checks if the EventManager can successfully retrieve events and perform CRUD operations.
 * @returns {void}
 * @example
 * eventManagerIntegrationTests();  
 */
const TEST_EVENT_NAME = 'Test Event';
const TEST_USER_EMAIL = 'testuser@keoweekrafters.org';
const eventData = {
    date: new Date(),
    attendees: [],
    eventItem: {
        id: '',
        title: 'Test Event',
        location: 'MakeKeowee, Woodshop, 4 Eagle Ln, Salem, SC 29676',
        sizeLimit: '3',
        host: { name: 'Test Host', id: '5636475000000295003' },
        description: 'This is a test event. Do not signup !!',
        price: 20,
        cost: 5,
        duration: 4,
        type: 'Event',
        eventType: 'Class',
        costDescription: 'Resin Supplies',
        enabled: true
    }
};

const eventManager = modelFactory.eventManager();

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
    const eventManager = modelFactory.eventManager();
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
    const eventManager = modelFactory.eventManager();
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
    const eventManager = modelFactory.eventManager();
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

function test_when_event_item_exists__then_only_calendar_event_is_added() {
    const eventManager = modelFactory.eventManager();
    const calendarManager = modelFactory.calendarManager();
    const eventDataWithId = JSON.parse(JSON.stringify(eventData));
    eventDataWithId.eventItem = {id:'5636475000000531001'};
    const response = eventManager.addEvent(eventDataWithId); 
    try {
        Logger.log(`addEvent response: ${response.message}`);
        assert('Event should be added successfully', response.success, true);
        event = response.data;

        assert('Event ID should be returned', event.id != undefined, true);
        assert('Event Item ID should be returned', event.eventItem.id != undefined, true);

        // Validate the calendar event was created
        const calendarEvent = calendarManager.calendar.getEventById(event.id);
        assert('Calendar event should exist', calendarEvent != null, true);
        assert('Calendar event title matches', calendarEvent.getTitle().startsWith('Woodturning '), true);
        Logger.log('Calendar event verification passed.');

    } catch (error) {
        Logger.log(`addEvent failed: ${error.message}`);
    } finally {
      eventManager.deleteCalendarEvent(event);
    }
    

}
function test_addEvent() {
    const eventManager = modelFactory.eventManager();
    const calendarManager = modelFactory.calendarManager();
    let eventId; 
    let event; 
    try {

        const response = eventManager.addEvent(eventData);
        Logger.log(`addEvent response: ${response.message}`);
        assert('Event should be added successfully', response.success, true);
        event = response.data;

        assert('Event ID should be returned', event.id != undefined, true);
        assert('Event Item ID should be returned', event.eventItem.id != undefined, true);

        // Validate the calendar event was created
        const calendarEvent = calendarManager.calendar.getEventById(event.id);
        assert('Calendar event should exist', calendarEvent != null, true);
        assert('Calendar event title matches', calendarEvent.getTitle(), eventData.eventItem.title);
        Logger.log('Calendar event verification passed.');

    } catch (error) {
        Logger.log(`addEvent failed: ${error.message}`);
    } finally {
      eventManager.deleteEvent(event);
    }
}

function test_add_event_item() {
  
    const eventManager = modelFactory.eventManager();
    let eventItemId ; 
    try {
       const eventItem = eventManager.addEventItem(eventData.eventItem);
      eventItemId = eventItem.id; 
      Logger.log(`addEvent response: ${eventItem}`);
      assert('Event should be added successfully', (eventItem!=undefined), true);
      const createdEventResponse = eventManager.getEventItemById(eventItemId); 
      assert ('Event found: ', (createdEventResponse && createdEventResponse.data && createdEventResponse.data.id != undefined),true);
      const  createdEvent = createdEventResponse.data;
      assert ('Event Description saved: ', createdEvent.description, eventData.eventItem.description  ); 
    } catch (e) {
      Logger.log( `Failed with: ${e.message}`); 
    }
     finally {
      if (eventItemId) {
        eventManager.deleteEventItem(eventItemId); 
      }
    }
}

function test_delete_event_item(eventId) {
  

    try {
        const response = eventManager.deleteEventItem(eventId);
        const event = eventManager.getEventById(eventId); 
        assert('Event should be deleted successfully', event===undefined, true);
    } catch (error) {
        Logger.log(` failed: ${error.message}`);
    }
}

function delete_testEventItem(eventId) {
  const eventsResponse = eventManager.getEventItemList({title: 'Test Event'}); 
  assert('Event Exists',(eventsResponse && eventsResponse.data.length > 0), true); 
  const eventIdActual = eventsResponse.data[0].id;
  eventManager.deleteEventItem(eventIdActual); 
}

function test_updateEvent() {
    const eventManager = modelFactory.eventManager();
    try {
        const originalResponse = eventManager.getEventList({ name: 'Test Event' });
        const originalEvent = originalResponse.data[0];
        const eventId = originalEvent.id;

        const updatedData = new ZohoEvent({ name: originalEvent.name, id: eventId, rate: originalEvent.rate, description: 'Updated Test Description' });
        const response = eventManager.updateEvent(updatedData);
        Logger.log(` response: ${response.message}`);
        assert('Event should be updated successfully', response.success, true);
    } catch (error) {
        Logger.log(` failed: ${error.message}`);
    }
}

function test_deleteEvent() {
    const eventManager = modelFactory.eventManager();
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
    const membershipManager = modelFactory.membershipManager();
    const member = membershipManager.memberLookup(TEST_USER_EMAIL);
    const eventManager = modelFactory.eventManager();
    assert('Found member', member != undefined, true);

    const testMemberId = member.id;
    const eventResponse = eventManager.getEventList({ name: TEST_EVENT_NAME });
    assert('Event found', true, eventResponse.success != undefined && eventResponse.data != undefined);

    const testEvent = eventResponse.data[0];
    const testEventId = testEvent.id;

    const confirmation = eventManager.signup(testEventId, testMemberId);

    Logger.log(JSON.stringify(confirmation));
}

function test_getEventRooms() {
    const eventManager = modelFactory.eventManager();
    try {
        const rooms = eventManager.getEventRooms();
        Logger.log('getEventRooms returned: ' + JSON.stringify(rooms));
        assert('Event rooms should be an array', Array.isArray(rooms), true);
        assert('At least one event room returned', rooms.length > 0, true);
        // Optionally, check that each room has expected properties
        rooms.forEach((room, idx) => {
            assert(`Room ${idx} has id`, typeof room.id !== 'undefined', true);
            assert(`Room ${idx} has name`, typeof room.name !== 'undefined', true);
            assert(`Room ${idx} has email`, typeof room.email !== 'undefined', true);
        });
    } catch (error) {
        Logger.log(`getEventRooms failed: ${error.message}`);
    }
}
