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
    const enriched = calendarEvents.map(ce => {
      const result = this.storageManager.getById(ce.eventItemId);
      if (!result || !result.data) {
        return null;
      }
      ce.eventItem = result.data;
      return ce;
    });
    return enriched.filter(e => e !== null);
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
    const result = this.calendarManager.getById(eventId);
    if (result?.data) {
      result.data = result.data.map(e => this.enrichCalendarEvents(e));
    }
    return result;
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
      let eventItem = eventData.eventItem;
      if (eventItem && eventItem.id) {
        eventItem = this.updateEvent(eventItem);
      } else {
        eventItem = this.addEventItem(eventItem);
      }
      if (!eventItem) {
        throw new Error('Failed to create event item.');
      }
      
      eventData.eventItem = eventItem;
      // Add the event to the calendar
      const calendarEvent = this.calendarManager.create(eventData); 
      const newCalendarEvent = this.addCalendarEvent(calendarEvent);
      newCalendarEvent.eventItem = eventItem; 
      return {success: true, data:newCalendarEvent}; 
    } catch (err) {
      console.error('Failed to create event:', err);
      return { success: false, message: 'Failed to create event.', error: err.toString() };
    }
  }

  addEventItem(eventItem) {
    const event = this.storageManager.createNew(eventItem);
    return this.storageManager.add(event);
  }

  addCalendarEvent(calendarEvent) {
    return this.calendarManager.add(calendarEvent);
  }


  updateEvent(calendarEvent) {
    try {
      this.calendarManager.update(calendarEvent);
      if (calendarEvent.eventItem) {
        return this.storageManager.update(calendarEvent.eventItem.id, calendarEvent.eventItem);
      }
      return { success: true };
    } catch (err) {
      console.error('Failed to update calendar event:', err);
      return { success: false, message: 'Failed to update calendar event.', error: err.toString() };
    }
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
    this.calendarManager.delete(event.id); 
  }
  createEvent(data = {}) {
    return this.calendarManager.create(data);
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
