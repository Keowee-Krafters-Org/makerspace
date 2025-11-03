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

  getEventByTitle(title, timeMin = new Date(), timeMax = new Date(Date.now() + 365*24*60*60*1000)) {
    const calendarId = this.calendar.getId();
    const res = Calendar.Events.list(calendarId, {
      q: String(title),
      singleEvents: true,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 10,
    });
    const item = (res.items || []).find(i => String(i.summary || '').trim() === String(title).trim());
    if (!item) throw new Error(`Event Not Found for title: ${title}`);
    // Fetch Apps Script event to reuse fromRecord pipeline
    const event = this.calendar.getEventById(item.id);
    return event ? this.fromRecord(event) : this.fromRecord(this.calendar.createAllDayEvent(item.summary, new Date(item.start.date || item.start.dateTime)));
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

  static matchInstanceByStart_(inst, start) {
    const s = (start instanceof Date) ? start : new Date(start);
    const dt =
      inst.originalStartTime?.dateTime ||
      inst.originalStartTime?.date ||
      inst.start?.dateTime ||
      inst.start?.date;
    return dt && new Date(dt).getTime() === s.getTime();
  }

  addAttendee(eventOrId, emailAddress, startTime) {
    const isObj = eventOrId && typeof eventOrId === 'object';
    const id = isObj ? eventOrId.id : String(eventOrId);
    const start = (isObj ? (eventOrId.start || eventOrId.date) : startTime);
    if (!id) throw new Error('addAttendee requires an event id');
    if (!start) throw new Error('addAttendee requires the occurrence start time for recurring events');

    const series = this.calendar.getEventById(id);
    if (!series) throw new Error(`No calendar event found for ID: ${id}`);

    const calendarId = this.calendar.getId();
    const windowStart = (start instanceof Date) ? start : new Date(start);
    const windowEnd = new Date(windowStart.getTime() + 24 * 60 * 60 * 1000);

    // Only use Advanced Calendar API; no series-level fallback
    const res = Calendar.Events.instances(calendarId, series.getId(), {
      timeMin: windowStart.toISOString(),
      timeMax: windowEnd.toISOString(),
      maxResults: 25,
      singleEvents: true,
    });

    const match = (res.items || []).find(inst => CalendarManager.matchInstanceByStart_(inst, windowStart));
    if (!match) throw new Error('Occurrence not found for provided start time');

    const list = Array.isArray(match.attendees) ? match.attendees.slice() : [];
    const exists = list.some(a => (a.email || '').toLowerCase() === String(emailAddress).toLowerCase());
    if (!exists) list.push({ email: emailAddress });

    Calendar.Events.patch({ attendees: list }, calendarId, match.id);
    return this.fromRecord(series);
  }

  unregisterAttendee(eventOrId, email, startTime) {
    const isObj = eventOrId && typeof eventOrId === 'object';
    const id = isObj ? eventOrId.id : String(eventOrId);
    const start = (isObj ? (eventOrId.start || eventOrId.date) : startTime);
    if (!id) throw new Error('unregisterAttendee requires an event id');
    if (!start) throw new Error('unregisterAttendee requires the occurrence start time for recurring events');

    const series = this.calendar.getEventById(id);
    if (!series) return { success: false, error: 'Event not found.' };

    const calendarId = this.calendar.getId();
    const windowStart = (start instanceof Date) ? start : new Date(start);
    const windowEnd = new Date(windowStart.getTime() + 24 * 60 * 60 * 1000);

    const res = Calendar.Events.instances(calendarId, series.getId(), {
      timeMin: windowStart.toISOString(),
      timeMax: windowEnd.toISOString(),
      maxResults: 25,
      singleEvents: true,
    });

    const match = (res.items || []).find(inst => CalendarManager.matchInstanceByStart_(inst, windowStart));
    if (!match) return { success: false, error: 'Occurrence not found for provided start time.' };

    const list = (match.attendees || []).filter(a => (a.email || '').toLowerCase() !== String(email).toLowerCase());
    Calendar.Events.patch({ attendees: list }, calendarId, match.id);

    return {
      success: true,
      message: `Attendee ${email} removed from this occurrence.`,
      eventId: id,
      data: this.fromRecord(series),
    };
  }
}
