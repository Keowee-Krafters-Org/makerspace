class Event {
    constructor(data = {}) {

        this.host = data.host || '';
        this.title = data.title || '';
        this.date = data.startDate?new Date(data.startDate):data.preferredDate;
        this.location = data.location || '';
        this.attendees = [];
        this.id = data.id;
        this.cost = data.cost; 
        this.description = data.description || '';
        this.sizeLimit = data.sizeLimit || 0;
        this.instructorName = data.instructorName || '';
        this.instructorEmail = data.instructorEmail || '';
    }

    static isAvailable(event) {
        return !event.isFull();
    }

    static isUpcoming(event) {
        return event.isUpcoming();
    }

    addAttendee(attendee) {
        if (!this.attendees.includes(attendee)) {
            this.attendees.push(attendee);
        }
    }

    removeAttendee(attendee) {
        this.attendees = this.attendees.filter(a => a !== attendee);
    }

    getAttendeeCount() {
        return this.attendees.length;
    }

    isFull() {
        return this.sizeLimit > 0 && this.attendees.length >= this.sizeLimit;
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

    getDetails() {
        return {
            id: this.id,
            title: this.title,
            date: this.date,
            host: this.host,
            location: this.location,
            attendees: this.attendees,
            description: this.description,
            sizeLimit: this.sizeLimit
        };
    }

    getAttendees() {
        return this.attendees.slice(); // Return a copy of the attendees list
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

    getId() {
        return this.id;
    }

    
    isUpcoming() {
        const now = new Date();
        return this.date > now;
    }

    toString() {
        return `${this.name} at ${this.location} on ${this.date.toDateString()}`;
    }

    static fromRow(row) {
        return new Event({...row}
        );
    }

    toRow() {
        return {...this}; 
    }

}

// Make the class globally accessible in Google Apps Script
this.Event = Event;
