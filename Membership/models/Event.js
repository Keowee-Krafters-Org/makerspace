/**
 * Event class representing an event with attendees, host, location, and other details.
 * Extends the base Entity class for common entity functionality.   
 * @extends Entity
 * @property {string} id - Unique identifier for the event
 * @property {string} title - Title of the event
 * Data transport is handled in the subclasses (e.g., ZohoEvent) 
 * Most use cases involve using the subclass directly. 
 */
class Event extends Entity {
    constructor(data = {}) {
        super(data);
    }

    /**
     * Factory method for creating a fully initialized new Event.
     * Ensures required fields like attendees and title have sensible defaults.
     * @param {Object} data - Source object for initialization
     * @returns {Event}
     */
    static createNew(data = {}) {
        return new Event({
            ...data,
            attendees: Array.isArray(data.attendees) ? data.attendees : [],
            title: typeof data.title === 'string' && data.title.trim() !== '' ? data.title : 'Untitled Event'
        });
    }

    // Event-specific logic only below

    isAvailable() {
        return !this.isFull();
    }

    addAttendee(attendee) {
        if (!this.attendees) this.attendees = [];
        if (!this.attendees.includes(attendee)) {
            this.attendees.push(attendee);
        }
    }

    removeAttendee(attendee) {
        if (!this.attendees) this.attendees = [];
        this.attendees = this.attendees.filter(a => a !== attendee);
    }

    getAttendeeCount() {
        return this.attendees ? this.attendees.length : 0;
    }

    isFull() {
        return this.sizeLimit > 0 && this.getAttendeeCount() >= this.sizeLimit;
    }

    setLocation(location) {
        if (typeof location !== 'string' || location.trim() === '') {
            throw new Error('Location must be a non-empty string.');
        }
        this.location = location;
    }

    setDescription(description) {
        if (typeof description !== 'string') {
            throw new Error('Description must be a string.');
        }
        this.description = description;
    }

    setSizeLimit(limit) {
        if (typeof limit !== 'number' || limit < 0) {
            throw new Error('Size limit must be a non-negative number.');
        }
        this.sizeLimit = limit;
    }

    toObject() {
        return {
            ...this,
            isAvailable: this.isAvailable(),
        };
    }

    getAttendees() {
        return this.attendees ? this.attendees.slice() : [];
    }

    getHost() {
        return this.host;
    }

    getName() {
        return this.name;
    }

    getDate() {
        return this.date;
    }

    getLocation() {
        return this.location;
    }

    getSizeLimit() {
        return this.sizeLimit;
    }

    getDescription() {
        return this.description;
    }

    isUpcoming() {
        const now = new Date();
        return this.date > now;
    }

    toString() {
        return `${this.name} at ${this.location} on ${this.date ? this.date.toDateString() : ''}`;
    }


}

// Make the class globally accessible in Google Apps Script
this.Event = Event;
