class EventManager {
    
    constructor(storageManager) {
        this.storageManager = storageManager;
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
        const event = new Event(eventData);
        this.storageManager.save(event);
        return { success: true, message: 'Event added successfully!', eventId: event.id };
    }
     updateEvent(eventId, updatedData) {
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
    
    signup(formData) {
       
        return { success: false, error: 'Signup not implemented!' };
    }
    
}


