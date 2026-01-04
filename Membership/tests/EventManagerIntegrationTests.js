/**
 * Test the EventManager integration with Zoho API.
 * This test checks if the EventManager can successfully retrieve events and perform CRUD operations.
 * @returns {void}
 * @example
 * eventManagerIntegrationTests();  
 */
const TEST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAn8B9p6p7wAAAABJRU5ErkJggg=='
const TEST_EVENT_NAME = 'Test Event';
const TEST_USER_EMAIL = 'testuser@keoweekrafters.org';
const RECURRING_EVENT_ID = '2kdq6q1ond4udslu88gl8dbra8@google.com'; 
const eventData = {
  date: new Date()+(7*24*60*60*1000), // One week from now
  attendees: [],
  location: { email: 'c_188dhi7k2lgmegqijd6t4cp6flkio@resource.calendar.google.com' },
  eventItem: {
    id: '',
    title: 'Test Event',
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

const testVendor = {id: '5636475000000295003', name: 'Test Vendor'}; 
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

function test_get_event_by_title() {
      const events = eventManager.getEventList({ title: 'Test Event' });
    const event = events[0];
    assert('Event found', true, event!=undefined); 

}
function test_getEventList() {
  const eventManager = modelFactory.eventManager();
  try {
    const eventsResponse = eventManager.getUpcomingEvents(365,  { page: { pageSize: 5 }});
    Logger.log('getEventList response: ' + JSON.stringify(eventsResponse));
    assert('Event list should not be null or undefined', eventsResponse != undefined, true);
    assert('Event list should be an array', Array.isArray(eventsResponse.data), true);
    assert('Event list should have at least one event', eventsResponse.data.length > 0, true);
    eventsResponse.data.forEach((event, idx) => {
      assert(`Event ${idx} has id`, typeof event.id !== 'undefined', true);
      assert(`Event ${idx} has title`, typeof event.eventItem.title !== 'undefined', true);
      assert(`Event ${idx} has date`, event.date instanceof Date, true);
      assert(`Event ${idx} has location`, event.location instanceof CalendarLocation, true);
    });
    Logger.log('Event list verification passed.');

  } catch (error) {
    Logger.log(`getEventList failed: ${error.message}`);
  }
}

function test_get_event_by_id() {
  eventId = 'n1vm21rudr0h4rdt1o46p9f0s8@google.com';

  const eventManager = modelFactory.eventManager();
  const event = eventManager.getEventById(eventId);
  assert("Event Found", true, event != undefined);
}

function test_getUpcomingEvents() {
  const eventManager = modelFactory.eventManager();
  try {
    const eventsResponse = eventManager.getUpcomingEvents();
    const events = eventsResponse.data; 
    Logger.log(`Retrieved ${events.length} upcoming events.`);
    Logger.log('getUpcomingEvents response: ' + JSON.stringify(events));
    assert('Upcoming events should be an array', Array.isArray(events), true);
    assert('Upcoming events should not be empty', events.length > 0, true);
    events.forEach((event, idx) => {
      assert(`Upcoming Event ${idx} has id`, typeof event.id !== 'undefined', true);
      assert(`Upcoming Event ${idx} has title`, typeof event.eventItem.title !== 'undefined', true);
      assert(`Upcoming Event ${idx} has date`, event.date instanceof Date, true);
    });
    Logger.log('Upcoming events verification passed.');

  } catch (error) {
    Logger.log(`getUpcomingEvents failed: ${error.message}`);
  }
}

function test_getUpcomingClasses() {
  const eventManager = modelFactory.eventManager();
  try {
    const eventsResponse = eventManager.getUpcomingClasses();
    Logger.log(`Retrieved ${eventsResponse.data.length} upcoming classes.`);
    Logger.log('getUpcomingEvents response: ' + JSON.stringify(eventsResponse.data));
    assert('Upcoming events should be an array', Array.isArray(eventsResponse.data), true);
    assert('Upcoming events should not be empty', eventsResponse.data.length > 0, true);
    eventsResponse.data.forEach((event, idx) => {
      assert(`Upcoming Event ${idx} has id`, typeof event.id !== 'undefined', true);
      assert(`Upcoming Event ${idx} has title`, typeof event.eventItem.title !== 'undefined', true);
      assert(`Upcoming Event ${idx} has date`, event.date instanceof Date, true);
    });
    Logger.log('Upcoming events verification passed.');

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
  eventDataWithId.eventItem = { id: '5636475000000531001' };
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
  let event;
  try {
    // Sample 1x1 transparent PNG (replace with a real image for production tests)
    event = addEvent();

    assert('Event ID should be returned', event.id != undefined, true);
    assert('Event Item ID should be returned', event.eventItem.id != undefined, true);

    // Validate the image was saved (DriveFile or URL expected)
    assert('Event Item should have an image', !!event.eventItem.image, true);

    // Validate the calendar event was created
    const calendarEvent = calendarManager.getById(event.id);
    assert('Calendar event should exist', calendarEvent != null, true);
    assert('Calendar event title matches', calendarEvent.title, eventData.eventItem.title);
    Logger.log('Calendar event verification passed.');

  } catch (error) {
    Logger.log(`addEvent failed: ${error.message}`);
  } finally {
    if (event) {
      eventManager.deleteEvent(event);
    }
  }

}

  function addEvent() {
    const base64Image = TEST_IMAGE;

    // Clone and add image to event data
    const event = JSON.parse(JSON.stringify(eventData));
    event.eventItem.image = { data: base64Image, name: 'New Image' };

    const response = eventManager.addEvent(event);
    Logger.log(`addEvent response: ${response.message}`);
    return response.data;
  }
/**
 * Helper method to add a recurring event
 * @returns 
 */
function addRecurringEvent() {  
  const eventManager = modelFactory.eventManager();
  const calendarManager = modelFactory.calendarManager();
  let event;
  try {
    // Sample 1x1 transparent PNG (replace with a real image for production tests)
    const base64Image = TEST_IMAGE;

    // Clone and add image to event data
     event = JSON.parse(JSON.stringify(eventData));
    event.eventItem.image = { data: base64Image, name: 'New Image' };
    event.isRecurring = true;
    event.recurrence = {
      frequency: 'WEEKLY',
      interval: 1,
      count: 5
    };
    const response = eventManager.addEvent(event);
   return response.data;
  } catch (error) {
    Logger.log(`addEvent failed: ${error.message}`);
  } 
}
function test_add_recurring_Event() {
  const eventManager = modelFactory.eventManager();
  const calendarManager = modelFactory.calendarManager();
  let eventId;
  let event;
  try {
    event = addRecurringEvent();
    Logger.log(`addEvent response: ${event}`);
    assert('Event should be added successfully', (event != undefined), true);

    assert('Event ID should be returned', event.id != undefined, true);
    assert('Event Item ID should be returned', event.eventItem.id != undefined, true);

    // Validate the image was saved (DriveFile or URL expected)
    assert('Event Item should have an image', !!event.eventItem.image, true);

    // Validate the calendar event was created
    const calendarEvent = calendarManager.calendar.getEventById(event.id);
    assert('Calendar event should exist', calendarEvent != null, true);
    assert('Calendar event title matches', calendarEvent.getTitle(), eventData.eventItem.title);
    Logger.log('Calendar event verification passed.');

  } catch (error) {
    Logger.log(`addEvent failed: ${error.message}`);
  } finally {
    if (event) {
      eventManager.deleteEvent(event);
    }
  }
}


function test_add_event_item() {

  const eventManager = modelFactory.eventManager();
  let eventItemId;
  try {

    const eventItem = eventManager.addEventItemFromData(eventData.eventItem);
    eventItemId = eventItem.id;
    Logger.log(`addEvent response: ${eventItem}`);
    assert('Event should be added successfully', (eventItem != undefined), true);
    const createdEventResponse = eventManager.getEventItemById(eventItemId);
    assert('Event found: ', (createdEventResponse && createdEventResponse.data && createdEventResponse.data.id != undefined), true);
    const createdEvent = createdEventResponse.data;
    assert('Event Description saved: ', createdEvent.description, eventData.eventItem.description);
  } catch (e) {
    Logger.log(`Failed with: ${e.message}`);
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
    assert('Event should be deleted successfully', event === undefined, true);
  } catch (error) {
    Logger.log(` failed: ${error.message}`);
  }
}

function delete_testEventItem(eventId) {
  const eventsResponse = eventManager.getEventItemList({ title: 'Test Event' });
  assert('Event Exists', (eventsResponse && eventsResponse.data.length > 0), true);
  const eventIdActual = eventsResponse.data[0].id;
  eventManager.deleteEventItem(eventIdActual);
}

function test_updateEvent() {
  const eventManager = modelFactory.eventManager();
  const membershipManager = modelFactory.membershipManager();
  const locations = eventManager.getEventRooms().data[0];
  const hosts = membershipManager.getHosts().data[0];
  eventData.location = { id: locations.id, email: locations.email };
  eventData.eventItem.host = { id: hosts.id, name: hosts.name };
  const createdEvent = eventManager.createEvent(eventData);
  const eventResponse = eventManager.addEvent(createdEvent);
  const newEvent = eventResponse.data;  
  const newPrice = eventData.eventItem.price + 10;
  const newDate = new Date(newEvent.date.getTime() + (2 * 60 * 60 * 1000)); // 2 hours later
  try {
    const originalEventItem = newEvent.eventItem; 
    const eventObject = {id:newEvent.id, location: locations[1], eventItem: {
      id:originalEventItem.id,price: originalEventItem.price, host: {id:hosts[1].id}, title:originalEventItem.title
    }};
    
    const response = eventManager.updateEvent(CalendarEvent.createNew(eventObject));
    Logger.log(` response: ${response.message}`);
    assert('Event should be updated successfully', response.success, true);
    assert('Event price should be updated', response.data.eventItem.price === newPrice, true);
    assert('Event host should be updated', response.data.eventItem.host.id === eventObject.eventItem.host.id, true);
    assert('Event location should be updated', response.data.location.id === eventObject.location.id, true);
    assert('Event date should be updated', response.data.date.getTime() === newDate.getTime(), true);
  } catch (error) {
    Logger.log(` failed: ${error.message}`);
  } finally {
    eventManager.deleteEvent(eventResponse.data); 
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
  let eventId;
  let testMemberId;
  const eventManager = modelFactory.eventManager();

  const membershipManager = modelFactory.membershipManager();
  try {
    const member = membershipManager.memberLookup('testuser@keoweekrafters.org');
    assert('Found member', member != undefined, true);
    testMemberId = member.id;
    const testEvent = addEvent();
    assert('Event created', true, (testEvent && testEvent.id != undefined));

    eventId = testEvent.id;

    // Signup using the occurrence (instance) id only
    const confirmation = eventManager.signup(eventId, testMemberId);
    Logger.log(JSON.stringify(confirmation));
    assert('Member signup should succeed', confirmation && confirmation.success === true, true);
  } catch (e) {
    throw(e);
  } finally {
    if (eventId) {
      try { eventManager.unregister(eventId, testMemberId); } catch (e) {}
      try { eventManager.deleteEvent(eventId); } catch (e) {}
    }
  }
}

function test_when_member_signs_up_for_recurring_event__then_event_is_updated() {
  let seriesId;
  let occurrenceId;
  let testEvent; 
  let testMemberId;
  const eventManager = modelFactory.eventManager();

  const membershipManager = modelFactory.membershipManager();
  try {
    const member = membershipManager.memberLookup('testuser@keoweekrafters.org');
    assert('Found member', member != undefined, true);
    testMemberId = member.id;

    testEvent = addRecurringEvent();

    // Ensure event created (this is the series id)
    seriesId = testEvent.id; 
    assert('Event created', true, (testEvent != undefined && testEvent.id != undefined));

    // Get the first occurrence of the recurring event and use its instance id
    const firstOccurrence = eventManager.getFirstOccurrence(seriesId);
    assert('First occurrence found', firstOccurrence != undefined, true);
    occurrenceId = firstOccurrence.id;

    const confirmation = eventManager.signup(occurrenceId, testMemberId);
    Logger.log(JSON.stringify(confirmation));
    assert('Member signup should succeed', confirmation && confirmation.success === true, true);
  } catch (e) {
    throw (e);
  } finally {
    if (occurrenceId) {
      try { eventManager.unregister(occurrenceId, testMemberId); } catch (e) {}
    }
    if (seriesId) {
      try { eventManager.deleteEvent(seriesId); } catch (e) {}
    }
  }
}

function test_getEventRooms() {
  const eventManager = modelFactory.eventManager();
  try {
    const roomsresponse = eventManager.getEventRooms();
    assert('getEventRooms response should not be null or undefined', roomsresponse != undefined, true);   
    assert('getEventRooms response should have data property', 'data' in roomsresponse, true);  
    const rooms = roomsresponse.data;
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

function test_get_calendar_resources() {
  const eventManager = modelFactory.eventManager();
  try {
    const resources = eventManager.getEventRooms();
    Logger.log('getCalendarResources returned: ' + JSON.stringify(resources));
    assert('Calendar resources should be an array', Array.isArray(resources), true);
    assert('At least one calendar resource returned', resources.length > 0, true);
    // Optionally, check that each resource has expected properties
    resources.forEach((resource, idx) => {
      assert(`Resource ${idx} has id`, typeof resource.id !== 'undefined', true);
      assert(`Resource ${idx} has name`, typeof resource.name !== 'undefined', true);
      assert(`Resource ${idx} has email`, typeof resource.email !== 'undefined', true);
    });
  } catch (error) {
    Logger.log(`getCalendarResources failed: ${error.message}`);
  }
  finally {
    // No cleanup needed for calendar resources
  }
  Logger.log('getCalendarResources test completed.');
}

function test_failed_event_update() {
  const description = "Ever wonder how those beautiful turned pens that you see at craft fairs are made? Here is your chance to learn how easy it is to turn wood blanks on the lathe and assemble them into stunning keepsake pens. They make great gifts and can be custom engraved with our Glowforge laser printer (2D Design and Fabrication Class)!\n\nCost includes all materials and tools. \n\nTools Needed\n3 pen mandrels\n3 pen making live centers \n1 pen blank machining bit\nSpindel roughing gouge\nSpindel gouge\n7 mm drill bit\n1 pen making sandpaper kit\n1 pen blank insertion tool\nMaterials Needed:  \n7-pen blanks (1 for instructor demo)\n7 pen kits (1 for instructor demo)\n1 bottle Medium CA glue\n1 bottle pen finish\nCourse Outline:\nWood Properties \nLathe introduction\nLathe Speeds\nIntro to pen turning\nWood sizing\nDrilling pen blanks\nPen tube insertion\nMachining pen blanks to size\nMounting pen blanks on mandrel\nTurning pen blanks\nSanding pen blanks\nFinishing pen blanks\nAssembling pens\n".replace(/\n/g, '\\n');
  const eventText = `{
  "id": "n1vm21rudr0h4rdt1o46p9f0s8@google.com",
  "eventItem": {
    "id": "5636475000000506001",
    "title": "Woodturning Class Number 3: Basic Pen Turning",
    "description": "${description}",
    "price": 75,
    "sizeLimit": 3,
    "enabled": true,
    "host": {
      "id": "5636475000000620039"
    },
    "duration": 4
  },
  "date": "2025-07-30T15:00:00.000Z",
  "location": {
    "email": "c_188dhi7k2lgmegqijd6t4cp6flkio@resource.calendar.google.com"
  }
}`;
  const eventData = JSON.parse(eventText);
  const eventManager = newModelFactory().eventManager();
  const event = eventManager.createEvent(eventData);
  const updatedEvent = eventManager.updateEvent(event);
  assert("Event updated:", true, updatedEvent != undefined);
}

function test_unregister_member_from_event() {
  const eventManager = modelFactory.eventManager();
  const membershipManager = modelFactory.membershipManager();
  const calendarManager = modelFactory.calendarManager();

  let testEventId;
  let testMemberId;

  try {
    // Step 1: Create a test member
    const testMember = membershipManager.memberLookup(TEST_USER_EMAIL);
    assert('Test member should exist', testMember != undefined, true);
    testMemberId = testMember.id;

    // Step 2: Create a test event
    const testEventData = JSON.parse(JSON.stringify(eventData)); // Clone eventData
    const addEventResponse = eventManager.addEvent(testEventData);
    assert('Event should be added successfully', addEventResponse.success, true);
    const testEvent = addEventResponse.data;
    testEventId = testEvent.id;

    // Step 3: Sign up the member for the event (use instance id only)
    const signupResponse = eventManager.signup(testEventId, testMemberId);
    assert('Member should be signed up successfully', signupResponse.success, true);

    // Step 4: Verify the member is in the attendee list
    const updatedEvent = calendarManager.getById(testEventId);
    const updatedEmails = Array.isArray(updatedEvent.attendees)
      ? updatedEvent.attendees
      : (Array.isArray(updatedEvent.guests) ? updatedEvent.guests.map(g => g.email) : []);
    assert('Event should have attendees', Array.isArray(updatedEmails), true);
    assert('Member should be in the attendee list', updatedEmails.includes(testMember.emailAddress), true);

    // Step 5: Unregister the member from the event (use instance id only)
    const unregisterResponse = eventManager.unregister(testEventId, testMemberId);
    assert('Member should be unregistered successfully', unregisterResponse.success, true);

    // Step 6: Verify the member is no longer in the attendee list
    const finalEvent = calendarManager.getById(testEventId);
    const finalEmails = Array.isArray(finalEvent.attendees)
      ? finalEvent.attendees
      : (Array.isArray(finalEvent.guests) ? finalEvent.guests.map(g => g.email) : []);
    assert('Member should no longer be in the attendee list', !finalEmails.includes(testMember.emailAddress), true);

    Logger.log('test_unregister_member_from_event passed successfully.');
  } catch (error) {
    Logger.log(`test_unregister_member_from_event failed: ${error.message}`);
  } finally {
    // Cleanup: Delete the test event
    if (testEventId) {
      eventManager.deleteEvent({ id: testEventId });
    }
  }
}

function test_when_calendar_manager_is_created__then_configuration_is_correct() {
  const calendarManager = newModelFactory().calendarManager();
  const calendarId = config[SharedConfig.mode].calendarId;
  assert("Calendar is correct", calendarId, calendarManager.calendar.getId())
}

function test_when_rooms_are_retrieved__then_at_least_one_room_is_returned() {
  const eventManager = newModelFactory().eventManager();
  const rooms = eventManager.getEventRooms();
  assert("At least one room is returned", true, (rooms && rooms.length > 0));
}

function test_get_event_items() {
  const eventManager = newModelFactory().eventManager();
  const response = eventManager.getEventItemList({  page: { pageSize: 5 } });
  Logger.log('getEventItemList response: ' + JSON.stringify(response));
  assert('Event items should not be null or undefined', response != undefined, true);
  assert('Event items should be an array', Array.isArray(response.data), true);
  assert('Event items should have at least one item', response.data.length > 0, true);
}

/**
 * Pagination test for event items using normalized markers:
 * - pageSize
 * - currentPageMarker
 * Asserts presence of page info and ability to fetch next page.
 */
function test_pagination_on_event_items() {
  const eventManager = newModelFactory().eventManager();

  const resp1 = eventManager.getEventItemList({ page: { pageSize: 2 } });
  assert('Event items response present', true, !!resp1);
  assert('Page object present', true, !!resp1.page);
  assert('currentPageMarker present', true, resp1.page.currentPageMarker != null);
  assert('pageSize honored', 2, Number(resp1.page.pageSize));
  const items1 = resp1.data;
  assert('Page 1 has items', true, Array.isArray(items1) && items1.length > 0);

  // Use nextPageMarker if available, fallback to pageToken for compatibility
  const nextMarker = resp1.page.nextPageMarker ?? resp1.page.pageToken;
  if (nextMarker != null) {
    const resp2 = eventManager.getEventItemList({ page: { pageSize: 2, currentPageMarker: nextMarker }  });
    assert('Next page object present', true, !!resp2.page);
    const items2 = resp2.data;
    assert('Page 2 has items', true, Array.isArray(items2) && items2.length > 0);
    // Basic difference check across pages (best-effort)
    assert('Different first items across pages', true, items1[0]?.id !== items2[0]?.id);
  } else {
    Logger.log('No next page available; pagination test completed on a single page.');
  }
}

function test_get_event_rooms__returns_rooms  () {  
  const eventManager = newModelFactory().eventManager();
  const roomsResponse = eventManager.getEventRooms();
  const rooms = roomsResponse.data; 
  assert("At least one room is returned", true, (rooms && rooms.length > 0));
}

function test_get_event_rooms__returns_rooms_with_details() {
  const eventManager = newModelFactory().eventManager();
  const roomsResponse = eventManager.getEventRooms();
  const rooms = roomsResponse.data;   
  assert("At least one room is returned", true, (rooms && rooms.length > 0));
  rooms.forEach((room, idx) => {
    assert(`Room ${idx} has id`, typeof room.id !== 'undefined', true);
    assert(`Room ${idx} has name`, typeof room.name !== 'undefined', true);
    assert(`Room ${idx} has email`, typeof room.email !== 'undefined', true);
  });
}

function test_get_event_rooms__returns_rooms_with_capacity() {
  const eventManager = newModelFactory().eventManager();
  const roomsResponse = eventManager.getEventRooms();
  const rooms = roomsResponse.data;   
  assert("At least one room is returned", true, (rooms && rooms.length > 0));
  rooms.forEach((room, idx) => {
    assert(`Room ${idx} has capacity`, typeof room.capacity !== 'undefined', true);
  });
}

