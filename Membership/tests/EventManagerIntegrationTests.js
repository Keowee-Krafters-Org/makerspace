// This file is converted from TypeScript and assumes it will be run in an environment
// where the 'Membership' bundle and its dependencies are available globally.

const TEST_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAn8B9p6p7wAAAABJRU5ErkJggg==';
const TEST_EVENT_NAME = 'Test Event';
const TEST_USER_EMAIL = 'testuser@keoweekrafters.org';
const RECURRING_EVENT_ID = '2kdq6q1ond4udslu88gl8dbra8@google.com';
const TEST_HOST_ID = '5636475000002236054';
const TEST_INSTRUCTOR_ID = '5636475000002266005';

import { ModelFactory } from '../services/ModelFactory.js';
import { CalendarEvent } from '../storage/google/calendar/CalendarEvent.js';
import { SharedConfig } from '../config.js';

// The 'assert' and 'config' variables are expected to be globally available in the GAS test environment.

export class EventManagerIntegrationTests {
    constructor() {
        // Access managers and factories from the global Membership object
       this.modelFactory = new ModelFactory();
 
        this.eventManager = this.modelFactory.eventManager();
        this.membershipManager = this.modelFactory.membershipManager();

        this.eventData = {
            date: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)), // One week from now
            attendees: [],
            location: { email: 'c_188dhi7k2lgmegqijd6t4cp6flkio@resource.calendar.google.com' },
            eventItem: {
                id: '',
                title: 'Test Event',
                sizeLimit: '3',
                host: { firstName: 'Test', lastName: 'Host', id: TEST_HOST_ID },
                instructor: { firstName: 'Test', lastName: 'Instructor', id: TEST_INSTRUCTOR_ID },
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
        Logger.log('Starting EventManager integration tests...');
        const tests = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(prop => prop.startsWith('test_') && typeof this[prop] === 'function');

        tests.forEach(testName => this.run(testName));

        Logger.log('EventManager integration tests completed.');
    }

    test_get_event_by_title() {
        const events = this.eventManager.getEventList({ title: 'Test Event' });
        const event = events[0];
        assert('Event found', true, event != undefined);
    }

    test_getEventList() {
        try {
            const eventsResponse = this.eventManager.getUpcomingEvents(365, { page: { pageSize: 5 } });
            Logger.log('getEventList response: ' + JSON.stringify(eventsResponse));
            assert('Event list should not be null or undefined', eventsResponse != undefined, true);
            assert('Event list should be an array', Array.isArray(eventsResponse.data), true);
            assert('Event list should have at least one event', eventsResponse.data.length > 0, true);
            eventsResponse.data.forEach((event, idx) => {
                assert(`Event ${idx} should have an id`, event.id != undefined, true);
                assert(`Event ${idx} should have a title`, event.eventItem.title != undefined, true);
            });
            Logger.log('Event list verification passed.');

        } catch (error) {
            Logger.log(`getEventList failed: ${error.message}`);
        }
    }

    test_get_event_by_id() {
        const eventId = 'n1vm21rudr0h4rdt1o46p9f0s8@google.com';
        const event = this.eventManager.getEventById(eventId);
        assert("Event Found", true, event != undefined);
    }

    test_getUpcomingEvents() {
        try {
            const eventsResponse = this.eventManager.getUpcomingEvents();
            const events = eventsResponse.data;
            Logger.log(`Retrieved ${events.length} upcoming events.`);
            Logger.log('getUpcomingEvents response: ' + JSON.stringify(events));
            assert('Upcoming events should be an array', Array.isArray(events), true);
            assert('Upcoming events should not be empty', events.length > 0, true);
            events.forEach((event, idx) => {
                assert(`Event ${idx} should have an id`, event.id != undefined, true);
            });
            Logger.log('Upcoming events verification passed.');

        } catch (error) {
            Logger.log(`getUpcomingEvents failed: ${error.message}`);
        }
    }

    test_getUpcomingClasses() {
        let event;
        try {
            event = this.addEvent(this.eventData);
            const options = { eventType: 'Class', page: { pageSize: 30 } };
            const eventsResponse = this.eventManager.getUpcomingEvents(options);
            Logger.log(`Retrieved ${eventsResponse.data.length} upcoming classes.`);
            Logger.log('getUpcomingEvents response: ' + JSON.stringify(eventsResponse.data));
            assert('Upcoming events should be an array', Array.isArray(eventsResponse.data), true);
            assert('Upcoming events should not be empty', eventsResponse.data.length > 0, true);
            eventsResponse.data.forEach((event, idx) => {
                assert(`Event ${idx} should have an id`, event.id != undefined, true);
                assert(`Event ${idx} should have a type of Class`, event.eventItem.eventType, 'Class');
            });
            Logger.log('Upcoming events verification passed.');

        } catch (error) {
            Logger.log(`getUpcomingEvents failed: ${error.message}`);
        } finally {
            if (event) {
                this.eventManager.deleteEvent(event);
            }
        }
    }

    test_getAvailableEvents() {
        try {
            const response = this.eventManager.getAvailableEvents();
            Logger.log(`getAvailableEvents response: ${response.message}`);
            const events = response.data;
            Logger.log(`Retrieved ${events.length} available events.`);
            assert('Available events should not be null or undefined', events != undefined, true);
            assert(`${events.length} Available Events are retrieved`, events.length > 0, true);
        } catch (error) {
            Logger.log(`getAvailableEvents failed: ${error.message}`);
        }
    }

    test_when_event_item_exists__then_only_calendar_event_is_added() {
        const calendarManager = this.modelFactory.calendarManager();
        const eventDataWithId = JSON.parse(JSON.stringify(this.eventData));
        eventDataWithId.eventItem = { id: '5636475000000531001' };
        const response = this.eventManager.addEvent(eventDataWithId);
        let event;
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
            this.eventManager.deleteCalendarEvent(event);
        }
    }

    test_addEvent() {
        const calendarManager = this.modelFactory.calendarManager();
        let event;
        try {
            // Sample 1x1 transparent PNG (replace with a real image for production tests)
            event = this.addEvent(this.eventData);

            assert('Event ID should be returned', event.id != undefined, true);
            assert('Event Item ID should be returned', event.eventItem.id != undefined, true);

            // Validate the image was saved (DriveFile or URL expected)
            assert('Event Item should have an image', !!event.eventItem.image, true);

            // Validate the calendar event was created
            const calendarEvent = calendarManager.getById(event.id);
            assert('Calendar event should exist', true, calendarEvent != null);
            assert('Calendar event title matches', this.eventData.eventItem.title, calendarEvent.title);
            assert('Calendar event description matches', true, calendarEvent._description.includes(`eventId=${event.id}`));
            assert('Calendar event location matches', this.eventData.location.email, calendarEvent.location.email);
            assert('Calendar event start time matches', event.date.getTime(), calendarEvent.date.getTime());
            assert('Calendar event end time matches', event.date.getTime() + (this.eventData.eventItem.duration * 60 * 60 * 1000), calendarEvent._end.getTime());
            assert('Calendar event attendee limit matches', this.eventData.eventItem.sizeLimit, event.eventItem.sizeLimit);
            assert('Calendar event host matches', this.eventData.eventItem.host.id, event.eventItem.host.id);
            assert('Calendar event instructor matches', this.eventData.eventItem.instructor.id, calendarEvent.eventItem.instructor.id);
            Logger.log('Calendar event verification passed.');

        } catch (error) {
            Logger.log(`addEvent failed: ${error.message}`);
        } finally {
            if (event) {
                this.eventManager.deleteEvent(event);
            }
        }
    }

    addEvent(eventData) {
        const base64Image = TEST_IMAGE;

        // Clone and add image to event data
        const event = JSON.parse(JSON.stringify(eventData));
        event.eventItem.image = { data: base64Image, name: 'New Image' };

        const response = this.eventManager.addEvent(event);
        Logger.log(`addEvent response: ${response.message}: ${response.data}`);
        return response.data;
    }

    addRecurringEvent() {
        try {
            // Sample 1x1 transparent PNG (replace with a real image for production tests)
            const base64Image = TEST_IMAGE;

            // Clone and add image to event data
            let event = JSON.parse(JSON.stringify(this.eventData));
            event.eventItem.image = { data: base64Image, name: 'New Image' };
            event.isRecurring = true;
            event.recurrence = {
                frequency: 'WEEKLY',
                interval: 1,
                count: 5
            };
            const response = this.eventManager.addEvent(event);
            return response.data;
        } catch (error) {
            Logger.log(`addEvent failed: ${error.message}`);
        }
    }

    test_add_recurring_Event() {
        const calendarManager = this.modelFactory.calendarManager();
        let event;
        try {
            event = this.addRecurringEvent();
            Logger.log(`addEvent response: ${event}`);
            assert('Event should be added successfully', (event != undefined), true);

            assert('Event ID should be returned', event.id != undefined, true);
            assert('Event Item ID should be returned', event.eventItem.id != undefined, true);

            // Validate the image was saved (DriveFile or URL expected)
            assert('Event Item should have an image', !!event.eventItem.image, true);

            // Validate the calendar event was created
            const calendarEvent = calendarManager.calendar.getEventById(event.id);
            assert('Calendar event should exist', calendarEvent != null, true);
            assert('Calendar event title matches', calendarEvent.getTitle(), this.eventData.eventItem.title);
            Logger.log('Calendar event verification passed.');

        } catch (error) {
            Logger.log(`addEvent failed: ${error.message}`);
        } finally {
            if (event) {
                this.eventManager.deleteEvent(event);
            }
        }
    }

    test_add_event_item() {
        let eventItemId;
        try {
            const eventItem = this.eventManager.addEventItemFromData(this.eventData.eventItem);
            eventItemId = eventItem.id;
            Logger.log(`addEvent response: ${eventItem}`);
            assert('Event should be added successfully', (eventItem != undefined), true);
            const createdEventResponse = this.eventManager.getEventItemById(eventItemId);
            assert('Event found: ', (createdEventResponse && createdEventResponse.data && createdEventResponse.data.id != undefined), true);
            const createdEvent = createdEventResponse.data;
            assert('Event Description saved: ', createdEvent.description, this.eventData.eventItem.description);
        } catch (e) {
            Logger.log(`Failed with: ${e.message}`);
        }
        finally {
            if (eventItemId) {
                this.eventManager.deleteEventItem(eventItemId);
            }
        }
    }

    test_delete_event_item(eventId) {
        try {
            const response = this.eventManager.deleteEventItem(eventId);
            const event = this.eventManager.getEventById(eventId);
            assert('Event should be deleted successfully', event === undefined, true);
        } catch (error) {
            Logger.log(` failed: ${error.message}`);
        }
    }

    delete_testEventItem() {
        const eventsResponse = this.eventManager.getEventItemList({ title: 'Test Event' });
        assert('Event Exists', (eventsResponse && eventsResponse.data.length > 0), true);
        const eventIdActual = eventsResponse.data[0].id;
        this.eventManager.deleteEventItem(eventIdActual);
    }

    test_updateEvent() {
        const membershipManager = this.modelFactory.membershipManager();
        const locations = this.eventManager.getEventRooms().data;
        const hosts = membershipManager.getHosts().data;
        const instructors = this.eventManager.getInstructors().data;
        const originalEventData = JSON.parse(JSON.stringify(this.eventData));
        const newHost = hosts[0];
        const newInstructor = instructors[0];
        const updatedHost = hosts[1];
        const updatedInstructor = instructors[0];
        originalEventData.eventItem.host = { id: newHost.id, firstName: newHost.firstName, lastName: newHost.lastName };
        originalEventData.eventItem.instructor = { id: newInstructor.id, firstName: newHost.firstName, lastName: newInstructor.lastName };
        originalEventData.location = locations[0];
        let originalEvent;

        try {
            originalEvent = this.addEvent(originalEventData);

            const updatedDate = new Date(originalEvent.date.getTime() + (2 * 60 * 60 * 1000)); // 2 hours later

            const originalEventItem = originalEvent.eventItem;
            const updatedEvent = originalEvent.toObject();

            const updatedPrice = originalEventItem.price + 10;

            updatedEvent.price = updatedPrice;
            updatedEvent.eventItem.host = updatedHost.toObject();
            updatedEvent.eventItem.instructor = updatedInstructor.toObject();
            updatedEvent.location = locations[1];
            updatedEvent.date = updatedDate;

            const response = this.eventManager.updateEvent(CalendarEvent.createNew(updatedEvent));
            Logger.log(` response: ${response.message}`);
            assert('Event should be updated successfully', response.success, true);
            assert('Event price should be updated', response.data.eventItem.price === updatedPrice, true);
            assert('Event host should be updated', response.data.eventItem.host.id === updatedEvent.eventItem.host.id, true);
            assert('Event Istructor should be updated', response.data.eventItem.instructor.id === updatedEvent.eventItem.instructor.id, true);
            assert('Event location should be updated', response.data.location.id === updatedEvent.location.id, true);
            assert('Event date should be updated', response.data.date.getTime() === updatedDate.getTime(), true);
        } catch (error) {
            Logger.log(` failed: ${error.message}`);
        } finally {
            this.eventManager.deleteEvent(originalEvent);
        }
    }

    test_deleteEvent() {
        try {
            const addResponse = this.eventManager.addEvent({
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

            const response = this.eventManager.deleteEvent(eventId);
            Logger.log(`deleteEvent response: ${response.message}`);
            assert('Event should be deleted successfully', response.success, true);
        } catch (error) {
            Logger.log(`deleteEvent failed: ${error.message}`);
        }
    }

    test_when_member_signs_up_for_event__then_event_is_updated() {
        let eventId;
        let testMemberId;

        const membershipManager = this.modelFactory.membershipManager();
        try {
            const member = membershipManager.memberLookup('testuser@keoweekrafters.org');
            assert('Found member', member != undefined, true);
            testMemberId = member.id;
            const testEvent = this.addEvent(this.eventData);
            assert('Event created', true, (testEvent && testEvent.id != undefined));

            eventId = testEvent.id;

            // Signup using the occurrence (instance) id only
            const confirmation = this.eventManager.signup(eventId, testMemberId);
            Logger.log(JSON.stringify(confirmation));
            assert('Member signup should succeed', confirmation && confirmation.success === true, true);
        } catch (e) {
            throw (e);
        } finally {
            if (eventId) {
                const event = this.eventManager.getEventById(eventId);
                this.eventManager.deleteEvent(event);
            }
        }
    }

    test_when_member_signs_up_for_recurring_event__then_event_is_updated() {
        let seriesId;
        let occurrenceId;
        let testMemberId;

        const membershipManager = this.modelFactory.membershipManager();
        try {
            const member = membershipManager.memberLookup('testuser@keoweekrafters.org');
            assert('Found member', member != undefined, true);
            testMemberId = member.id;

            const testEvent = this.addRecurringEvent();

            // Ensure event created (this is the series id)
            seriesId = testEvent.id;
            assert('Event created', true, (testEvent != undefined && testEvent.id != undefined));

            // Get the first occurrence of the recurring event and use its instance id
            const firstOccurrence = this.eventManager.getFirstOccurrence(seriesId);
            assert('First occurrence found', firstOccurrence != undefined, true);
            occurrenceId = firstOccurrence.id;

            const confirmation = this.eventManager.signup(occurrenceId, testMemberId);
            Logger.log(JSON.stringify(confirmation));
            assert('Member signup should succeed', confirmation && confirmation.success === true, true);
        } catch (e) {
            throw (e);
        } finally {
            if (occurrenceId) {
                this.eventManager.cancelRegistration(occurrenceId, testMemberId);
            }
            if (seriesId) {
                const event = this.eventManager.getEventById(seriesId);
                this.eventManager.deleteEvent(event);
            }
        }
    }

    test_getEventRooms() {
        try {
            const roomsresponse = this.eventManager.getEventRooms();
            assert('getEventRooms response should not be null or undefined', roomsresponse != undefined, true);
            assert('getEventRooms response should have data property', 'data' in roomsresponse, true);
            const rooms = roomsresponse.data;
            Logger.log('getEventRooms returned: ' + JSON.stringify(rooms));
            assert('Event rooms should be an array', Array.isArray(rooms), true);
            assert('At least one event room returned', rooms.length > 0, true);
            // Optionally, check that each room has expected properties
            rooms.forEach((room, idx) => {
                assert(`Room ${idx} should have an id`, room.id != undefined, true);
                assert(`Room ${idx} should have a name`, room.name != undefined, true);
            });
        } catch (error) {
            Logger.log(`getEventRooms failed: ${error.message}`);
        }
    }

    test_get_calendar_resources() {
        try {
            const resources = this.eventManager.getEventRooms();
            Logger.log('getCalendarResources returned: ' + JSON.stringify(resources));
            assert('Calendar resources should be an array', Array.isArray(resources), true);
            assert('At least one calendar resource returned', resources.length > 0, true);
            // Optionally, check that each resource has expected properties
            resources.forEach((resource, idx) => {
                assert(`Resource ${idx} should have an id`, resource.id != undefined, true);
                assert(`Resource ${idx} should have a name`, resource.name != undefined, true);
            });
        } catch (error) {
            Logger.log(`getCalendarResources failed: ${error.message}`);
        }
        finally {
            // No cleanup needed for calendar resources
        }
        Logger.log('getCalendarResources test completed.');
    }

    test_failed_event_update() {
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
        const eventManager = this.modelFactory.eventManager();
        const event = eventManager.createEvent(eventData);
        const updatedEvent = eventManager.updateEvent(event);
        assert("Event updated:", true, updatedEvent != undefined);
    }

    test_unregister_member_from_event() {
        const membershipManager = this.modelFactory.membershipManager();
        const calendarManager = this.modelFactory.calendarManager();

        let testEventId;
        let testMemberId;

        try {
            // Step 1: Create a test member
            const testMember = membershipManager.memberLookup(TEST_USER_EMAIL);
            assert('Test member should exist', testMember != undefined, true);
            testMemberId = testMember.id;

            // Step 2: Create a test event
            const testEventData = JSON.parse(JSON.stringify(this.eventData)); // Clone eventData
            const addResponse = this.eventManager.addEvent(testEventData);
            assert('Test event should be created successfully', addResponse.success, true);
            testEventId = addResponse.data.id;

            // Step 3: Sign up the member for the event
            const signupResponse = this.eventManager.signup(testEventId, testMemberId);
            assert('Member should be signed up successfully', signupResponse.success, true);

            // Step 4: Unregister the member from the event
            const unregisterResponse = this.eventManager.unregister(testEventId, testMemberId);
            assert('Member should be unregistered successfully', unregisterResponse.success, true);

            // Step 5: Verify the member is no longer an attendee
            const updatedEvent = this.eventManager.getEventById(testEventId);
            const isAttendee = updatedEvent.attendees.some((attendee) => attendee.id === testMemberId);
            assert('Member should not be in the attendee list', isAttendee, false);

        } catch (error) {
            Logger.log(`test_unregister_member_from_event failed: ${error.message}`);
        } finally {
            // Clean up: delete the test event
            if (testEventId) {
                const event = this.eventManager.getEventById(testEventId);
                this.eventManager.deleteEvent(event);
            }
        }
    }

    test_when_calendar_manager_is_created__then_configuration_is_correct() {
        const calendarManager = this.modelFactory.calendarManager();
        const calendarId = config[SharedConfig.mode].calendarId;
        assert("Calendar is correct", calendarId, calendarManager.calendar.getId())
    }

    test_when_rooms_are_retrieved__then_at_least_one_room_is_returned() {
        const rooms = this.eventManager.getEventRooms();
        assert("At least one room is returned", true, (rooms && rooms.length > 0));
    }

    test_get_event_items() {
        const response = this.eventManager.getEventItemList({ page: { pageSize: 5 } });
        Logger.log('getEventItemList response: ' + JSON.stringify(response));
        assert('Event items should not be null or undefined', response != undefined, true);
        assert('Event items should be an array', Array.isArray(response.data), true);
        assert('Event items should have at least one item', response.data.length > 0, true);
    }

    test_pagination_on_event_items() {
        const resp1 = this.eventManager.getEventItemList({ page: { pageSize: 2 } });
        assert('Event items response present', true, !!resp1);
        assert('Page object present', true, !!resp1.page);
        assert('currentPageMarker present', true, resp1.page.currentPageMarker != null);
        assert('pageSize honored', 2, Number(resp1.page.pageSize));
        const items1 = resp1.data;
        assert('Page 1 has items', true, Array.isArray(items1) && items1.length > 0);

        // Use nextPageMarker if available, fallback to pageToken for compatibility
        const nextMarker = resp1.page.nextPageMarker ?? resp1.page.pageToken;
        if (nextMarker != null) {
            const resp2 = this.eventManager.getEventItemList({ page: { pageSize: 2, currentPageMarker: nextMarker } });
            const items2 = resp2.data;
            assert('Page 2 has items', true, Array.isArray(items2) && items2.length > 0);
            assert('Page 1 and 2 items are different', false, items1[0].id === items2[0].id);
        } else {
            Logger.log('Skipping second page test: no nextPageMarker');
        }
    }

    test_get_event_rooms__returns_rooms() {
        const roomsResponse = this.eventManager.getEventRooms();
        const rooms = roomsResponse.data;
        assert("At least one room is returned", true, (rooms && rooms.length > 0));
    }

    test_get_event_rooms__returns_rooms_with_details() {
        const roomsResponse = this.eventManager.getEventRooms();
        const rooms = roomsResponse.data;
        assert("At least one room is returned", true, (rooms && rooms.length > 0));
        rooms.forEach((room, idx) => {
            assert(`Room ${idx} should have an id`, room.id != undefined, true);
            assert(`Room ${idx} should have a name`, room.name != undefined, true);
        });
    }

    test_get_event_rooms__returns_rooms_with_capacity() {
        const roomsResponse = this.eventManager.getEventRooms();
        const rooms = roomsResponse.data;
        assert("At least one room is returned", true, (rooms && rooms.length > 0));
        rooms.forEach((room, idx) => {
            assert(`Room ${idx} should have capacity`, room.capacity != undefined, true);
        });
    }
}

function runEventManagerIntegrationTests() {
    new EventManagerIntegrationTests().runAll();
}

function test_when_rooms_are_retrieved__then_at_least_one_room_is_returned() {
  const eventManager = newModelFactory().eventManager();
  const rooms = eventManager.getEventRooms();
  assert("At least one room is returned", true, (rooms && rooms.length > 0));
}

function test_get_event_items() {
  const eventManager = newModelFactory().eventManager();
  const response = eventManager.getEventItemList({ page: { pageSize: 5 } });
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
    const resp2 = eventManager.getEventItemList({ page: { pageSize: 2, currentPageMarker: nextMarker } });
    assert('Next page object present', true, !!resp2.page);
    const items2 = resp2.data;
    assert('Page 2 has items', true, Array.isArray(items2) && items2.length > 0);
    // Basic difference check across pages (best-effort)
    assert('Different first items across pages', true, items1[0]?.id !== items2[0]?.id);
  } else {
    Logger.log('No next page available; pagination test completed on a single page.');
  }
}

function test_get_event_rooms__returns_rooms() {
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

function test_getEventListByCategory() {
  const eventManager = modelFactory.eventManager();
  try {

    const eventCategory = 'fiber'; 
    const eventsResponse = eventManager.getUpcomingEvents(365, { page: { pageSize: 5 }, category: eventCategory });
    Logger.log('getEventList response: ' + JSON.stringify(eventsResponse));
    assert('Event list should not be null or undefined', eventsResponse != undefined, true);
    assert('Event list should be an array', Array.isArray(eventsResponse.data), true);
    assert('Event list should have at least one event', eventsResponse.data.length > 0, true);
    eventsResponse.data.forEach((event, idx) => {
      assert(`Event ${idx} has id`, typeof event.id !== 'undefined', true);
      assert(`Event ${idx} has title`, typeof event.eventItem.title !== 'undefined', true);
      assert(`Event ${idx} has date`, event.date instanceof Date, true);
      assert(`Event ${idx} has location`, event.location instanceof CalendarLocation, true);
      assert(`Event ${idx} has category`, event.eventItem.category !== 'undefined', true); 
      assert('Event category is correct',  eventCategory, event.eventItem.category); 
    });
    Logger.log('Event list verification passed.');

  } catch (error) {
    Logger.log(`getEventList failed: ${error.message}`);
  }
}
