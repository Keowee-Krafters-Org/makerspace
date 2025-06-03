class EventManager {
    
    constructor() {
        this.storageManager = new StorageManager('events');
    }

    getEventList() {
        return this.storageManager.getAll(Event);
    }

    getUpcomingEvents() {
        const allEvents = this.storageManager.getFiltered(Event, event => Event.isUpcoming(event));
        return allEvents.sort((a, b) => a.date - b.date);
    }
    getAvailableEvents() {
        const allEvents = this.storageManager.getFiltered(Event, event => Event.isAvailable(event));
        return allEvents.sort((a, b) => a.date - b.date);
    }   
    getEventById(eventId) {
        return this.storageManager.getById(Event, eventId);
    }
    getEventsByHost(host) {
        return this.storageManager.getFiltered(Event, event => event.host === host);
    }
    getEventsByDate(date) {
        return this.storageManager.getFiltered(Event, event => event.date.toDateString() === new Date(date).toDateString());
    }  
    getEventsByLocation(location) {
        return this.storageManager.getFiltered(Event, event => event.location === location);
    }
    getEventsBySizeLimit(sizeLimit) {
        return this.storageManager.getFiltered(Event, event => event.sizeLimit === sizeLimit);
    }   
    getEventsByAttendee(attendeeEmail) {
        return this.storageManager.getFiltered(Event, event => event.attendees.includes(attendeeEmail));
    }
    addEvent(eventData) {
        const event = new Event(eventData);
        this.storageManager.save(event);
        return { success: true, message: 'Event added successfully!', eventId: event.id };
    }
    updateEvent(eventId, updatedData) {
        const event = this.storageManager.getById(Event, eventId);
        if (!event) {
            return { success: false, message: 'Event not found.' };
        }
        Object.assign(event, updatedData);
        this.storageManager.save(event);
        return { success: true, message: 'Event updated successfully!' };
    }
    deleteEvent(eventId) {
        const event = this.storageManager.getById(Event, eventId);
        if (!event) {
            return { success: false, message: 'Event not found.' };
        }
        this.storageManager.delete(eventId);
        return { success: true, message: 'Event deleted successfully!' };
    }
    
    signup(formData) {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Signups');
        sheet.appendRow([
            formData.name,
            formData.email,
            formData.classId,
            new Date()
        ]);
        return { success: true, message: 'Signup successful!' };
    }
    
}


