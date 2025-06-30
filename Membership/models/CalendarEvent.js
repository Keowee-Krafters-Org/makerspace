
class CalendarEvent extends Event {
    constructor(eventData = {}) {
        super(eventData);
    }

    set eventItem(eventItem) {
        this.event = eventItem;
    }
    get eventItem() {
        return this.event;
    }

    get description() {
        return this.event.description || '';
    }
    set description(value) {
        this.event.description = value;
    }
    get title() {
        return this.event.title || '';
    }
    set title(value) {
        this.event.title = value;
    }
    get date() {
        return this.start || new Date();
    }
    set date(value) {
        this.start = new Date(value);
    }

    get price() {
        return this.event.price || 0;
    }
    set price(value) {
        this.event.price = value;
    }
    get cost() {
        return this.event.cost || 0;
    }
    set cost(value) {
        this.event.cost = value;
    }
    get costDescription() {
        return this.event.costDescription || '';
    }
    set costDescription(value) {
        this.event.costDescription = value;
    }
    get location() {
        return this.event.location || '';
    }
    set location(value) {
        this.event.location = value;
    } 
    get attendees() {
        return this.attendees || [];
    }   
    set attendees(value) {
        if (Array.isArray(value)) {
            this.attendees = value;
        } else if (typeof value === 'string') {
            this.attendees = value.split(',').map(email => email.trim());
        } else {
            throw new Error('Attendees must be an array or a comma-separated string');
        }
    }

    get creator() {
        return this.creator || null;
    }
    set creator(value) {
        if (typeof value === 'string') {
            this.creator = { email: value };
        } else if (value && typeof value === 'object') {
            this.creator = value;
        } else {
            throw new Error('Creator must be a string or an object');
        }
    }
    get status() {
        return this.status || 'confirmed'; // Default status
    }
    set status(value) {
        const validStatuses = ['confirmed', 'tentative', 'cancelled'];
        if (validStatuses.includes(value)) {
            this.status = value;
        } else {
            throw new Error(`Invalid status: ${value}. Valid statuses are: ${validStatuses.join(', ')}`);
        }
    }
    get id() {
        return this.id || null; // Ensure id is always defined
    }
    set id(value) {
        if (typeof value === 'string' || typeof value === 'number') {
            this.id = String(value);
        } else {
            throw new Error('ID must be a string or a number');
        }
    }
    toObject() {
        return {
            id: this.id,
            date: this.start,
            duration: this.duration,
            location: this.location,
            attendees: this.attendees,
            creator: this.creator,
            status: this.status,
            eventItem: this.eventItem.toObject()
        };
    }

    static getFromRecordMap() {
        return {
            id: 'id',
            title: 'title',
            description: 'description',
            start: 'start',
            _end: 'end',
            location: 'location',
            _attendees: 'guests',
            creator: 'creator',
            status: 'status',
            _eventItemId: 'eventItemId'
        };
    }
    get eventItemId() {
        const match = this.description?.match(/[?&]itemId=([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    }

    static fromRecord(record) {
        const data = super.convertRecordToData(record, CalendarEvent.getFromRecordMap());
        // Create a new CalendarEvent instance from the record data
        if (record.start) {
            data.start = new Date(record.start);
        }
        if (record._end) {
            data.duration = (new Date(record._end) - data.start) / (1000 * 60 * 60); // duration in hours
        }
        if (record.attendees) {
            data.attendees = this._attendees.split(',').map(email => email.trim());
        }
        return new CalendarEvent(data);
    }


    toRecord() {
        this._attendees = this.attendees.join(', '); // Convert attendees array to a comma-separated string
        this._eventItemId = this.eventItem.id; // Store eventItemId directly
        return super.convertDataToRecord(CalendarEvent.getToRecordMap());
    }
}
