/**
 * Service managing calendars (Google)
 * Provides the CRUD operations to sync Events to the Calendar
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
  add(calendarEvent) {

    const calendarRecord = calendarEvent.toRecord(); 
    const calendarEventRecord = this.calendar.createEvent( 
      calendarRecord.title || 'Untitled Class',
      calendarRecord.start,
      calendarRecord.end,
      {
        description: calendarRecord.description,
        location: calendarRecord.location,
        guests: calendarRecord.attendees,
      }
    );
    return CalendarEvent.fromRecord(calendarEventRecord);
  }

  create(eventData) {
    return CalendarEvent.createNew(eventData); 
  }
  /**
   * Updates an existing calendar event using a CalendarEvent object
   * @param {CalendarEvent} calendarEvent - The event to update (must contain a valid `id`)
   * @returns {CalendarEvent}
   */
  update(calendarEvent) {
    const event = this.calendar.getEventById(calendarEvent.id);
    if (!event) {
      throw new Error(`No calendar event found for ID: ${calendarEvent.id}`);
    }

    const start = new Date(calendarEvent.start);
    const durationHours = Number(calendarEvent.duration) || 2;
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    event.setTitle(calendarEvent.title || 'Untitled Class');
    event.setTime(start, end);
    event.setLocation(calendarEvent.location || '');
    event.setDescription(updateDescription(calendarEvent.description, calendarEvent.eventItemId));
    this.calendar.updateEvent(event);
    return new CalendarEvent(event);
  }

  /**
   * Creates the eventItem  link  for the event
   * @param {CalendarEvent} calendarEvent - The event to update (must contain a valid `id`)
   * @returns {CalendarEvent}
   */
  updateDescription(description, eventItemId) {

    // Update the description with the event item link
    const updatedDescription = `${description}\nView Details: ${SharedConfig.baseUrl}/event?eventId=${eventItemId}`;
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
    return event ? new CalendarEvent(event) : null;
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
    return events.map(event => CalendarEvent.fromRecord(event));
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
      return resources.map(resource => ({
        id: resource.resourceId,
        name: resource.resourceName,
        email: resource.resourceEmail
      }));
    } catch (e) {
      Logger.log('Error fetching calendar resources: ' + e);
      return [];
    }
  }
}
