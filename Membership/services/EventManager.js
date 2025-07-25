/**
 * EventManager class to manage events in a membership system.
 * It handles event creation, retrieval, updates, and deletions.
 * It also integrates with a calendar system to manage event scheduling.  
 */
class EventManager {

  constructor(storageManager, calendarManager, membershipManager, fileManager) {
    this.storageManager = storageManager;
    this.calendarManager = calendarManager;
    this.membershipManager = membershipManager;
    this.fileManager = fileManager;
    this.config = getConfig();
  }

  getEventItemList(params = {}) {
    const result = this.storageManager.getAll(params);
    return result;
  }

  getEventItemById(id) {
    const result = this.storageManager.getById(id);
    return result;
  }

  getEventList(params = {}) {
    const calendarEvents = this.calendarManager.getAll(params);
    return this.enrichCalendarEvents(calendarEvents);
  }

  /**
   * Retrieves upcoming events based on the specified horizon.
   * The horizon can be specified in the params, otherwise it defaults to the configured event horizon.
   * @param {*} params 
   * @returns   {Array} An array of upcoming events enriched with event item data.
   * If no upcoming events are found, an empty array is returned.
   * If an error occurs, it logs the error and returns an empty array.
   * @throws {Error} If there is an issue retrieving the events from the calendar manager
   * or enriching the events with event item data.
   */
  getUpcomingEvents(params = {}) {
    const eventHorizon = params.horizon || getConfig().eventHorizon;
    const calendarEvents = this.calendarManager.getUpcomingEvents(eventHorizon);
    if (!calendarEvents || calendarEvents.length === 0) {
      return [];
    }
    return this.enrichCalendarEvents(calendarEvents);
  }

  /**
   *  Retrieves upcoming classes based on the specified parameters.
   *  It filters the events to include only those of type 'Class'.
   *  The events are sorted by start date in ascending order.
   *  The maximum number of classes to show is limited by the `upcomingClassesLimit` configuration.
   *  @param {Object} params - Optional parameters to filter the events.
   *  @param {number} params.limit - Optional limit on the number of classes to retrieve.
   *  @returns {Array} An array of upcoming classes, each enriched with event
   *  @returns  {Array} An array of upcoming classes, each enriched with event item data.
   *  If no upcoming classes are found, an empty array is returned.
   *  @throws {Error} If there is an issue retrieving the events from the calendar
   */
  getUpcomingClasses(params = {}) {
    const events = this.getUpcomingEvents(params);
    if (!events || events.length === 0) {
      return [];
    }
    return events.filter(event => {
      return event.eventItem && event.eventItem.type === 'Event' && event.eventItem.eventType === 'Class';
    });
  }
  /**
   * Merges calendar events with event items from storage.
   * This function enriches calendar events with additional data from the event items.
   * @param {*} calendarEvents 
   * @returns  {Array} An array of enriched calendar events.
   */
  enrichCalendarEvents(calendarEvents) {
    const enriched = calendarEvents.map(ce => {

      return this.enrichCalendarEvent(ce);
    });
    return enriched.filter(e => e !== null);
  }


  enrichCalendarEvent(calendarEvent) {
    if (calendarEvent.eventItem.id) {
      const result = this.storageManager.getById(calendarEvent.eventItem.id);
      if (!result || !result.data) {
        return null;
      }
      const eventItem = result.data;

      if (eventItem.image && eventItem.image.id) {
        const imageFile = this.fileManager.get(eventItem.image.id);
        eventItem.image = imageFile;
      }
      calendarEvent.eventItem = eventItem;
    }
    return calendarEvent;

  }
  getPastEvents() {
    const response = this.calendarManager.getFiltered(event => event.isPast());
    response.data = response.data.map(e => this.enrichCalendarEvents(e));
    return response;
  }
  getAvailableEvents() {
    const calendarEvents = this.calendarManager.getAvailableEvents();
    return this.enrichCalendarEvents(calendarEvents);
  }

  getEventById(eventId) {
    const event = this.calendarManager.getById(eventId);
    if (!event) {
      throw new Error(`Event Not Found for: ${eventId}`);
    }
    const newEvent = this.enrichCalendarEvent(event);
    return newEvent;
  }
  getEventsByHost(host) {
    const calendarEvents = this.calendarManager.getFiltered(event => {
      const guests = event.attendees || [];
      return guests.length > 0 && guests[0] === host;
    });
    return this.enrichCalendarEvents(calendarEvents);
  }
  getEventsByDate(date) {
    const calendarEvents = this.calendarManager.getEventsByDate(date);
    return this.enrichCalendarEvents(calendarEvents);
  }
  getEventsByLocation(location) {
    return this.storageManager.getFiltered(event => event.location === location);
  }
  getEventsBySizeLimit(sizeLimit) {
    return this.storageManager.getFiltered(event => event.sizeLimit === sizeLimit);
  }
  getEventsByAttendee(attendeeEmail) {
    const calendarEvents = this.calendarManager.getEventsByAttendee(attendeeEmail);
    return this.enrichCalendarEvents(calendarEvents);
  }

  addEvent(eventData) {
    try {
      const event = this.createEvent(eventData);
      let eventItem = event.eventItem;

 
      // Handle image upload if image is a base64 string
      if (eventItem && eventItem.image && eventItem.image.data && typeof eventItem.image.data === 'string' && eventItem.image.data.startsWith('data:image')) {
        const imageData = eventItem.image.data; 
        // Extract base64 data
        const base64Data = imageData.split(',')[1];
        const contentType = imageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/)[1];
        const blob = Utilities.newBlob(Utilities.base64Decode(base64Data), contentType, 'event-image.png');
        const file = this.fileManager.add(blob);
        eventItem.image = file; // Store DriveFile object
      }

      if (eventItem && eventItem.id) {
        const eventItemResponse = this.updateEventItem(eventItem);
        eventItem = eventItemResponse.data;
      } else {
        eventItem = this.addEventItem(eventItem);
      }
      if (!eventItem) {
        throw new Error('Failed to create event item.');
      }
      // Add the event to the calendar
      const newCalendarEvent = this.addCalendarEvent(calendarEvent, eventItem);
      newCalendarEvent.eventItem = eventItem;
      return { success: true, data: newCalendarEvent };
    } catch (err) {
      console.error('Failed to create event:', err);
      return { success: false, message: 'Failed to create event.', error: err.toString() };
    }
  }

  addEventItem(eventItem) {
    const event = this.storageManager.createNew(eventItem);
    return this.storageManager.add(event);
  }

  addCalendarEvent(calendarEvent, eventItem) {
    return this.calendarManager.add(calendarEvent, eventItem);
  }


  updateEvent(calendarEvent) {
    try {
      const updatedEvent = this.calendarManager.update(calendarEvent.id, calendarEvent);
      if (calendarEvent.eventItem) {
        updatedEvent.eventItem = this.storageManager.update(calendarEvent.eventItem.id, calendarEvent.eventItem);
      }
      return new Response(true, updatedEvent, 'Event updated successfully.');
    } catch (err) {
      console.error('Failed to update calendar event:', err);
      return { success: false, message: 'Failed to update calendar event.', error: err.toString() };
    }
  }

  updateEventItem(eventItemData) {
    const eventItem = this.storageManager.createNew(eventItemData);
    return this.storageManager.update(eventItem.id, eventItem);
  }

  deleteEventItem(eventItemId) {
    const event = this.storageManager.getById(eventItemId);
    if (!event) {
      return { success: false, message: 'Event not found.' };
    }
    const response = this.storageManager.delete(eventItemId);
    return { success: true, message: 'Event deleted successfully!' };
  }

  deleteEvent(event) {
    const eventItemId = event.eventItem.id;
    eventManager.deleteEventItem(eventItemId);
    this.deleteCalendarEvent(event);
  }

  deleteCalendarEvent(event) {
    this.calendarManager.delete(event.id);
  }

  createEvent(data = {}) {
    const calendarEvent = this.calendarManager.create(data);
    if (!calendarEvent) {
      throw new Error('Failed to create calendar event.');
    }
    const eventItem = this.storageManager.createNew(data.eventItem || {});
    if (!eventItem) {
      throw new Error('Failed to create event item.');
    }
    const host = this.membershipManager.createNew(data.host || {});
    if (!host) {
      throw new Error('Failed to create host.');
    }
    eventItem.host = host;
    calendarEvent.eventItem = eventItem;
    return calendarEvent;
  }

  /**
   * Sign up a member to an event
   * @param {*} eventId 
   * @param {*} memberId 
   * @returns Response(EventConfirmation) 
   */
  signup(eventId, memberId) {
    const event = this.calendarManager.getById(eventId);
    if (!event) {
      throw new Error('Event not found.');
    }
    // Prevent duplicate signups
    if (Array.isArray(event.attendees) && event.attendees.includes(memberId)) {
      return { success: false, error: 'Member already signed up for this event.' };
    }

    // Check if event is full (if sizeLimit is set)
    if (event.sizeLimit && event.attendees && event.attendees.length >= event.sizeLimit) {
      return { success: false, error: 'Event is full.' };
    }

    const memberResponse = this.membershipManager.getMember(memberId);
    if (!(memberResponse && memberResponse.success)) {
      throw new Error('Member not found');
    }
    const member = memberResponse.data;
    this.calendarManager.addAttendee(eventId, member.emailAddress);

    return {
      success: true, data: { message: `You are successfully signed up successfully for: ${event.name}`, eventId: eventId }
    }
  }

  /**
   * Unregister a member from an event
   * @param {string} eventId - The ID of the event
   * @param {string} memberId - The ID of the member
   * @returns {Object} Response indicating success or failure
   */
  unregister(eventId, memberId) {
    const memberResponse = this.membershipManager.getMember(memberId);
    if (!(memberResponse && memberResponse.success)) {
      return { success: false, error: 'Member not found.' };
    }

    const member = memberResponse.data;

    // Delegate the unregistration to the CalendarManager
    return this.calendarManager.unregisterAttendee(eventId, member.emailAddress);
  }

  enrichWithCalendarData(event) {
    if (event.calendarId) {
      try {
        const calendarEvent = this.calendarManager.calendar.getEventById(event.calendarId);
        if (calendarEvent) {
          event.date = calendarEvent.getStartTime();
          event.end = calendarEvent.getEndTime();
          event.location = calendarEvent.getLocation();
          event.attendees = calendarEvent.getGuestList().map(g => g.getEmail());
        }
      } catch (err) {
        console.warn(`Could not enrich event with calendar data: ${err.message}`);
      }
    }
    return event;
  }

  getEventRooms() {
    return this.calendarManager.getCalendarResources();
  }

  getEventLocations() {
    return this.config.locations;
  }
}
