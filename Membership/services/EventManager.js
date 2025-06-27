class EventManager {

    constructor(storageManager, calendarManager = new CalendarManager()) {
        this.storageManager = storageManager;
        this.calendarManager = calendarManager;
    }

    getEventList(params = {}) {
        return this.storageManager.getAll(params);
    }

    getUpcomingEvents(params = {}) {
        const response = this.storageManager.getFiltered(event => event.isUpcoming(), params);
        response.data = response.data.sort((a, b) => a.date - b.date);
        return response;
    }
    getAvailableEvents() {
        const response = this.storageManager.getFiltered(event => event.isAvailable());
        return response;
    }
    getEventById(eventId) {
        return this.storageManager.getById(eventId);
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
            const calendarId = this.calendarManager.createEvent(eventData);
            eventData.calendarId = calendarId;
        } catch (err) {
            console.error('Failed to create calendar event:', err);
            return { success: false, message: 'Failed to create calendar event.', error: err.toString() };
        }
        const event = new Event(eventData);
                this.storageManager.save(event);
                return { success: true, message: 'Event added successfully!', eventId: event.id, calendarId: eventData.calendarId };
    }
    updateEvent(updatedData) {
        try {
            if (updatedData.calendarId) {
                this.calendarManager.updateEvent(updatedData.calendarId, updatedData);
            }
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

        const updatedEvent = this.storageManager.create({id: event.id, attendees: event.attendees})
        // Persist the updated event
        this.storageManager.update(eventId, updatedEvent);

        return {
            success: true,  data: {message: `You are successfully signed up successfully for: ${event.name}`, eventId: eventId }
        }
    }
}
