class Event {
    constructor(data = {}) {
        
        Object.keys(data).forEach( key =>  {
            this[key] = data[key]; 
        }); 
    
    }

    newConstructor() {
        this.host = undefined;
        this.title = '';
        this.type = 'Class'; // Default type is 'Class'
        this.date = new Date();
        this.location = '';
        this.attendees = [];
        this.id = undefined;
        this.price = 0; // Default price is 0
        this.cost = undefined;
        this.summary = '';
        this.description = '';
        this.sizeLimit = 0;
        this.instructorName = '';
        this.instructorEmail = '';
        this.costDescription = '';
    }

    convertDataToRecord(toRecordMap) {
        const record = {};
        Object.keys(this).forEach( key =>  {
            record[toRecordMap[key]] = this[key]; 
        }); 
    }

    static convertRecordToData(record = {}, fromRecordMap ) {
        const data = {};
        Object.keys(record).forEach(key => {
            if (fromRecordMap[key]) {
            data[fromRecordMap[key]] = record[key];
            }
        });
        return data;
    }

    static getfromRecordMap() {
        // Must be implemented in subclass
        throw new Error('Must be implemented in subclass'); 
    }

    static getToRecordMap() {
        // Must be implemented in subclass
        throw new Error('Must be implemented in subclass');
    }
    isAvailable() {
        return !this.isFull();
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

    static fromRecord(record) {
        throw new Error('fromRecord method implemented in subclass');
    }

    toRecord() {
        throw new Error('toRecord method implemented in subclass');
    }

}

// Make the class globally accessible in Google Apps Script
this.Event = Event;
