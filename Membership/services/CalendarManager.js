/**
 * Service managing calendars (Google)
 * Provides the CRUD operations to sync Events to the Calendar
 */

class CalendarManager extends StorageManager {
    constructor(calendarId = null) {
        this.calendar = calendarId
            ? CalendarApp.getCalendarById(calendarId)
            : CalendarApp.getDefaultCalendar();
    }

    /**
     * Creates a calendar event and returns the calendar event ID
     * @param {Object} eventData 
     * @returns {string} calendarEventId
     */
    add(eventData) {
        const start = eventData.start;
        const durationHours = Number(eventData.duration) || 2;
        const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

        const calendarEvent = this.calendar.createEvent(
            eventData.title || 'Untitled Class',
            start,
            end,
            {
                description: updateDescription(calendarEvent.description ,calendarEvent.eventItemId),
                location: eventData.location || '',
                guests: eventData.attendees, 
            }
        );

        return new CalendarEvent(calendarEvent);
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
        event.setDescription(updateDescription(calendarEvent.description ,calendarEvent.eventItemId));
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
        return events.map(event => new CalendarEvent(event));
    }
}     
