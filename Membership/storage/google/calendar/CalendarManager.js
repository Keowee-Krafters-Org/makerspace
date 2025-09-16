/**
 * Service managing calendars (Google)
 * Provides the CRUD operations to sync Events to the Calendar
 * 
 */

class CalendarManager extends StorageManager {

  constructor(calendarId = null) {
    super();
    this.calendar = calendarId
      ? CalendarApp.getCalendarById(calendarId)
      : CalendarApp.getDefaultCalendar();
  }

  /**
   * Creates a calendar event and returns the calendar event ID
   * @param {Object} event 
   * @returns {string} calendarEventId
   */
  add(calendarEvent, eventItem) {

    const calendarRecord = this.toRecord(calendarEvent); 
    const event = this.calendar.createEvent( 
      calendarRecord.title || 'Untitled Class',
      calendarRecord.start,
      calendarRecord.end,
  
    );
    // Set the description with the event item link
    event.setDescription(CalendarManager.updateDescription(event.getId(), eventItem.id)); 
    event.addGuest(calendarRecord.location.email); // Add the room as a guest
    return this.fromRecord(event);
  }

  /**
   * Converts a Google Calendar event to a CalendarEvent instance
   * @param {GoogleAppsScript.Calendar.CalendarEvent} googleEvent 
   * @returns {CalendarEvent}
   */
  fromRecord(googleEvent) {
    const newCalendarEvent =  CalendarEvent.fromRecord(googleEvent);
    const locationEmail = newCalendarEvent.location || '';
    if (locationEmail) {
      const calendarLocation = this.getLocationByEmail(locationEmail);
      newCalendarEvent.location = calendarLocation; // Store the room email for later use
    }
    return newCalendarEvent;
  }

  /**
   * Converts a CalendarEvent instance to a Google Calendar event record
   * @param {CalendarEvent} calendarEvent 
   * @returns {Object} Google Calendar event record
   */ 
  toRecord(calendarEvent) {
    if (calendarEvent.location && !calendarEvent.location.email) {
      const eventLocation = this.getLocationById(calendarEvent.location.id);
      calendarEvent.location = eventLocation;
    }
    return calendarEvent.toRecord();
  }

  
/**
 * Finds a calendar resource by its email address 
 * @param {string} email - The email address of the calendar resource
 */
getLocationByEmail(email) {
  return this.getCalendarResources().find(r => r.email === email);
}

  /**
   * Finds a calendar resource by its ID
   * @param {string} id - The ID of the calendar resource
   */
  getLocationById(id) {
    return this.getCalendarResources().find(r => r.id === id);
  }

  /**
   * Updates an existing calendar event using a CalendarEvent object
   * @param {CalendarEvent} calendarEvent - The event to update (must contain a valid `id`)
   * @returns {CalendarEvent}
   */
  create(eventData) {
    return CalendarEvent.createNew(eventData); 
  }
  /**
   * Updates an existing calendar event using a CalendarEvent object
   * @param {CalendarEvent} calendarEvent - The event to update (must contain a valid `id`)
   * @returns {CalendarEvent}
   */
  update(id, calendarEvent) {
    const event = this.calendar.getEventById(id);
    if (!event) {
        throw new Error(`No calendar event found for ID: ${calendarEvent.id}`);
    }

    const calendarEventRecord = calendarEvent.toRecord();
    event.setTitle(calendarEvent.title || event.getTitle());
    event.setTime(calendarEventRecord.start || event.getStartTime(), calendarEventRecord.end || event.getEndTime());
    event.setDescription(CalendarManager.updateDescription(calendarEventRecord.id, calendarEvent.eventItem.id));

    // Check if the location (room) has changed
    const currentEvent = this.fromRecord(event); 
    const currentLocation = currentEvent.location; 
    
    const newLocation = this.getLocationById(calendarEvent.location.id); 
    if (newLocation && currentLocation.id !== newLocation.id) {
        // Remove the original location if it exists
        if (currentLocation) {
            event.removeGuest(currentLocation.email);
        }

        // Add the new location
        event.addGuest(newLocation.email);
    }

    return this.fromRecord(event);
  }

  /**
   * Creates the eventItem  link  for the event
   * @param {CalendarEvent} calendarEvent - The event to update (must contain a valid `id`)
   * @returns {CalendarEvent}
   */
  static updateDescription(eventId, eventItemId) {

   // Update the description with the event item link
      const updatedDescription = `<a href="${getConfig().baseUrl}?view=event&eventId=${eventId}&eventItemId=${eventItemId}">View Details</a>`;
      return updatedDescription;

  }
  /**
   * Deletes a calendar event by ID
   * @param {string} calendarId
   * @returns {boolean} true if the event was deleted, false otherwise        
   * @throws {Error} if the event does not exist  
   */
  delete(calendarId) {
    const event = this.calendar.getEventById(calendarId);
    if (!event) {
      throw new Error(`No calendar event found for ID: ${calendarId}`);
    }
    event.deleteEvent();
    return true;
  }
  /**
   * Retrieves a calendar event by ID and returns a CalendarEvent instance
   * @param {string} calendarId 
   * @returns {CalendarEvent|null}
   */
  getEvent(calendarId) {
    const event = this.calendar.getEventById(calendarId);
    return event ? this.fromRecord(event) : null;
  }

  getUpcomingEvents(daysAhead = 14) {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + daysAhead);
    return this.getEventsInRange(now, endDate);
  }
  /**     * Retrieves all calendar events within a date range
   * @param {Date} start - Start date of the range
   * @param {Date} end - End date of the range
   * @returns {CalendarEvent[]} Array of CalendarEvent instances
   */
  getEventsInRange(start, end) {
    if (!(start instanceof Date) || !(end instanceof Date)) {
      throw new Error('Start and end must be Date objects.');
    }
    if (start >= end) {
      throw new Error('Start date must be before end date.');
    }

    const events = this.calendar.getEvents(start, end);
    return events.map(event => this.fromRecord(event));
  }

  /**
   * Complies with StorageManager.getById
   */
  getById(id) {
    return this.getEvent(id);
  }

  /**
   * Complies with StorageManager.getAll
   */
  getAll(params = {}) {
    return this.getUpcomingEvents(365); // or configurable range
  }

  /**
   * Complies with StorageManager.getFiltered
   */
  getFiltered(filterFn) {
    const all = this.getAll();
    return all.filter(filterFn);
  }

  /**
   * Overload to match StorageManager.update(id, object)
   */
  updateById(id, calendarEvent) {
    if (!calendarEvent || id !== calendarEvent.id) {
      throw new Error('Invalid calendar event or mismatched ID');
    }
    return this.update(calendarEvent);
  }

  /**
   * Returns an array of Google Calendar resources (rooms, equipment, etc.)
   * Requires AdminDirectory advanced service to be enabled and admin privileges.
   * @returns {Array} Array of resource objects: { id, name, email }
   */
  
  getCalendarResources() {
    // 'my_customer' works for most Google Workspace domains
    const customerId = 'my_customer';
    try {
      const resources = AdminDirectory.Resources.Calendars.list(customerId).items || [];
      return resources.map(resource => CalendarLocation.fromRecord(resource));
    } catch (e) {
      Logger.log('Error fetching calendar resources: ' + e);
      return [];
    }
  }

  addAttendee(id, emailAddress) {
    
    const event = this.calendar.getEventById(id);
    if (!event) {
      throw new Error(`No calendar event found for ID: ${calendarId}`);
    }
    event.addGuest(emailAddress); 
    return this.fromRecord(event); 
  }

  /**
   * Unregister an attendee from an event
   * @param {string} eventId - The ID of the event
   * @param {string} email - The email of the attendee to remove
   * @returns {Object} Response indicating success or failure
   */
  unregisterAttendee(eventId, email) {
    const event = this.calendar.getEventById(eventId);
    if (!event) {
      return { success: false, error: 'Event not found.' };
    }

    try {
        // Remove the attendee from the guest list
        event.removeGuest(email);

        return {
            success: true,
             message: `Attendee with email ${email} has been successfully unregistered from: ${event.getTitle()}`, eventId: eventId, 
             data: this.fromRecord(event)
        };
    } catch (error) {
        return { success: false, error: `Failed to unregister attendee: ${error.message}` };
    }
  }
}
