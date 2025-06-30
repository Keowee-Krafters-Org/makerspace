/**
 * EventManager class to manage events in a membership system.
 * It handles event creation, retrieval, updates, and deletions.
 * It also integrates with a calendar system to manage event scheduling.  
 */
class EventManager {

  constructor(storageManager, calendarManager, membershipManager) {
    this.storageManager = storageManager;
    this.calendarManager = calendarManager;
    this.membershipManager = membershipManager;
  }

  getEventList(params = {}) {
    const result = this.storageManager.getAll(params);
    result.data = result.data.map(e => this.enrichWithCalendarData(e));
    return result;
  }

  getUpcomingEvents(params = {}) {
    const calendarEvents = this.calendarManager.getUpcomingEvents();
    if (!calendarEvents || calendarEvents.length === 0) {
      return [];
    }
    return enrichCalendarEvents(calendarEvents);
  }

  /**
   * Merges calendar events with event items from storage.
   * This function enriches calendar events with additional data from the event items.
   * @param {*} calendarEvents 
   * @returns  {Array} An array of enriched calendar events.
   */
  enrichCalendarEvents(calendarEvents) {
    const upcomingEvents = calendarEvents.map(ce => {
      const eventItem = this.storageManager.getById(ce.eventItemId());
      if (!response || !response.data || response.data.length === 0) {
        return null;
      }
      ce.eventItem = eventItem;
      return ce;
    });
    return upcomingEvents.filter(e => e !== null);
  }
  getPastEvents() {
    const response = this.storageManager.getFiltered(event => event.isPast());
    response.data = response.data.map(e => this.enrichWithCalendarData(e));
    return response;
  }
  getAvailableEvents() {
    const response = this.storageManager.getFiltered(event => event.isAvailable());
    response.data = response.data.map(e => this.enrichWithCalendarData(e));
    return response;
  }
  getEventById(eventId) {
    const result = this.storageManager.getById(eventId);
    if (result?.data) {
      result.data = this.enrichWithCalendarData(result.data);
    }
    return result;
  }
  getEventsByHost(host) {
    return this.storageManager.getFiltered(event => event.host === host);
  }
  getEventsByDate(date) {
    return this.storageManager.getFiltered(event => event.date.toDateString() === new Date(date).toDateString());
  }
  getEventsByLocation(location) {
    return this.storageManager.getFiltered(event => event.location === location);
  }
  getEventsBySizeLimit(sizeLimit) {
    return this.storageManager.getFiltered(event => event.sizeLimit === sizeLimit);
  }
  getEventsByAttendee(attendeeEmail) {
    return this.storageManager.getFiltered(event => event.attendees.includes(attendeeEmail));
  }

  addEvent(eventData) {
    try {
      let eventItem = {};
      if (eventData.eventItem && eventData.eventItem.id) {
        eventItem = this.updateEvent(eventData);
      } else {
        eventItem = this.addItemEvent(eventData);
      }
      if (!eventItem) {
        throw new Error('Failed to create event item.');
      }
      // Add the event to the calendar
      eventData.eventItem = eventItem;
      const calendarEvent = this.addCalendarEvent(eventData);

      return {
        success: true,
        message: 'Event added successfully!',
        data: eventItem
      };
    } catch (err) {
      console.error('Failed to create event:', err);
      return { success: false, message: 'Failed to create event.', error: err.toString() };
    }
  }

  addItemEvent(eventData) {
    const event = this.storageManager.createNew(eventData);
    return this.storageManager.add(event);
  }

  addCalendarEvent(calendarEvent) {
    return this.calendarManager.createEvent(calendarEvent);
  }


  updateEvent(calendarEvent) {
    try {

      this.calendarManager.update(calendarEvent);
    } catch (err) {
      console.error('Failed to update calendar event:', err);
      return { success: false, message: 'Failed to update calendar event.', error: err.toString() };
    }
    const eventId = updatedData.id;
    return this.storageManager.update(eventId, updatedData);
  }
  deleteEvent(eventId) {
    const event = this.storageManager.getById(eventId);
    if (!event) {
      return { success: false, message: 'Event not found.' };
    }
    this.storageManager.delete(eventId);
    return { success: true, message: 'Event deleted successfully!' };
  }

  createEvent(data = {}) {
    return this.storageManager.create(data);
  }

  /**
   * Sign up a member to an event
   * @param {*} eventId 
   * @param {*} memberId 
   * @returns Response(EventConfirmation) 
   */
  signup(eventId, memberId) {
    const eventResponse = this.storageManager.getById(eventId);
    if (!(eventResponse && eventResponse.data)) {
      return { success: false, error: 'Event not found.' };
    }
    const event = eventResponse.data;
    // Prevent duplicate signups
    if (Array.isArray(event.attendees) && event.attendees.includes(memberId)) {
      return { success: false, error: 'Member already signed up for this event.' };
    }

    // Check if event is full (if sizeLimit is set)
    if (event.sizeLimit && event.attendees && event.attendees.length >= event.sizeLimit) {
      return { success: false, error: 'Event is full.' };
    }


    // Add member to attendees
    event.attendees = Array.isArray(event.attendees) ? event.attendees : [];
    event.attendees.push(memberId);

    const updatedEvent = this.storageManager.create({ id: event.id, attendees: event.attendees })
    // Persist the updated event
    this.storageManager.update(eventId, updatedEvent);

    return {
      success: true, data: { message: `You are successfully signed up successfully for: ${event.name}`, eventId: eventId }
    }
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
}
