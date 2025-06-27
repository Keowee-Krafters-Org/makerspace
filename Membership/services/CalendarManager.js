/**
 * Service managing calendars (Google)
 * Provides the CRUD operations to sync Events to the Calendar
 */

class CalendarManager {
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
    createEvent(eventData) {
        const start = new Date(eventData.date);
        const durationHours = Number(eventData.duration) || 2;
        const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

        const calendarEvent = this.calendar.createEvent(
            eventData.title || 'Untitled Class',
            start,
            end,
            {
                description: eventData.description || '',
                location: eventData.location || '',
                guests: eventData.host || ''
            }
        );

        return calendarEvent.getId();
    }

    /**
     * Updates an existing calendar event by ID
     * @param {string} calendarId 
     * @param {Object} eventData 
     */
    updateEvent(calendarId, eventData) {
        const event = this.calendar.getEventById(calendarId);
        if (!event) {
            throw new Error(`No calendar event found for ID: ${calendarId}`);
        }

        const start = new Date(eventData.date);
        const durationHours = Number(eventData.duration) || 2;
        const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

        event.setTitle(eventData.title || 'Untitled Class');
        event.setTime(start, end);
        event.setLocation(eventData.location || '');
        event.setDescription(eventData.description || '');
    }
}
