
class CalendarEvent extends Event {
    constructor(eventData = {}) {
        if(!eventData.eventItem) {
            eventData.eventItem = {};
        }
        super(eventData);
    }

    get description() {
        return this.eventItem.description || '';
    }
    set description(value) {
        this.eventItem.description = value;
    }
    get title() {
        return this.eventItem.title || '';
    }
    set title(value) {
        this.eventItem.title = value;
    }
    get price() {
        return this.eventItem.price || 0;
    }
    set price(value) {
        this.eventItem.price = value;
    }
    get cost() {
        return this.eventItem.cost || 0;
    }
    set cost(value) {
        this.eventItem.cost = value;
    }
    get costDescription() {
        return this.eventItem.costDescription || '';
    }
    set costDescription(value) {
        this.eventItem.costDescription = value;
    }
    get location() {
        return this.eventItem.location || '';
    }
    set location(value) {
        this.eventItem.location = value;
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

    static getToRecordMap() {
        return {
            id: 'id',
            title: 'title',
            _description: 'description',
            date: 'start',
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

    static fromRecord(googleEvent) {

        const record = {
            id: googleEvent.getId(),
            title: googleEvent.getTitle(),
            description: googleEvent.getDescription(),
            start: googleEvent.getStartTime(),
            end: googleEvent.getEndTime(),
            location: googleEvent.getLocation(),
            attendees: googleEvent.getGuestList().map(g => g.getEmail()),
            creator: googleEvent.getCreators()?.[0] || '',
            visibility: googleEvent.getVisibility(), 
            
        };
        const data = {eventItem:{},...super.convertRecordToData(record, CalendarEvent.getFromRecordMap())};
        // Create a new CalendarEvent instance from the record data
        if (record.start) {
            data.date = new Date(record.start);
        }
        if (data._end) {
            data.duration = (new Date(record._end) - data.start) / (1000 * 60 * 60); // duration in hours
        }
        if (data._attendees) {
            data.attendees = data._attendees.split(',').map(a => a.trim());
        } else {
            data.attendees = [];
        }
 
  
        // Extract the eventItemId from the description if it exists
        if (data._description) {
            const match = data._description.match(/eventItemId=(\d*)/);
            if (match) {
                data.eventItem.id = match[1];
            }
        }
        
        return new CalendarEvent(data);
    }


    toRecord() {
        this._attendees = this.attendees.join(', '); // Convert attendees array to a comma-separated string
        this._eventItemId = this.eventItem.id; // Store eventItemId directly
        const start = this.date;
        const durationHours = Number(this.eventItem.duration) || 2;
        this._end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
        this._description = this.updateDescription(this.eventItem.description, this.eventItem.id)
        return super.convertDataToRecord(CalendarEvent.getToRecordMap());
    }

    /**
 * Creates the eventItem  link  for the event
 * @param {CalendarEvent} calendarEvent - The event to update (must contain a valid `id`)
 * @returns {CalendarEvent}
 */
    updateDescription(description, eventItemId) {

        // Update the description with the event item link
        const updatedDescription = `${description}\nView Details: ${SharedConfig.baseUrl}/event?eventItemId=${eventItemId}`;
        return updatedDescription;

    }

}
