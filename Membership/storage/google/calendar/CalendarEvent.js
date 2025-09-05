/**
 * CalendarEvent.js
 * Represents a calendar event with additional properties for event items.
 * Extends the base Event class to include event item details.
 */
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
        return this.eventItem.title || this.title ||'';
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


    toObject() {
        return {
            id: this.id,
            date: this.start,
            duration: this.duration,
            location: this.location,
            room: this.room, // <-- Add this line
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
            attendees: 'guests',
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
        // Map Google Event getter/setter methods to object
        const record = {
            id: googleEvent.getId(),
            title: googleEvent.getTitle(),
            description: googleEvent.getDescription(),
            start: googleEvent.getStartTime(),
            end: googleEvent.getEndTime(),
            location: googleEvent.getGuestList().filter(g => CalendarEvent.resourceFilter(g)).map(g => g.getEmail())[0] || '', 
            guests: googleEvent.getGuestList().filter(g => !CalendarEvent.resourceFilter(g)).map(g => 
                CalendarContact.fromRecord({email: g.getEmail()})),
            creator: googleEvent.getCreators()?.[0] || '',
            visibility: googleEvent.getVisibility(),
        };

        const data = { eventItem: {}, ...super.convertRecordToData(record, CalendarEvent.getFromRecordMap()) };

        // Create a new CalendarEvent instance from the record data
        if (record.start) {
            data.date = new Date(record.start);
        }
        if (data._end) {
            data.duration = (new Date(record._end) - data.start) / (1000 * 60 * 60); // duration in hours
        }
         
        
  
        // Extract the eventItemId from the description if it exists
        if (data._description) {
            const match = data._description.match(/eventItemId=(\d*)/);
            if (match) {
                data.eventItem.id = match[1];
            } else {
              // No id here - just description
              data.eventItem.description = data._description
              data.eventItem.type = 'Event'; // Default type if not specified
              data.eventItem.eventType = 'Meeting'; // Default eventType if not specified
            }
        }
        
        return new CalendarEvent(data);
    }


    toRecord() {
       this._eventItemId = this.eventItem.id; // Store eventItemId directly
        const start = this.date;
        const durationHours = Number(this.eventItem.duration) || 2;
        this._end = start ? new Date(start.getTime() + durationHours * 60 * 60 * 1000) : undefined;
        this._description = this.id ? this.updateDescription() : undefined;
        return super.convertDataToRecord(CalendarEvent.getToRecordMap());
    }

    static resourceFilter(guest) {
        return (guest.getEmail().includes('resource.calendar.google.com')); 
    }

    /**
 * Creates the eventItem  link  for the event
 * @param {CalendarEvent} calendarEvent - The event to update (must contain a valid `id`)
 * @returns {CalendarEvent}
 */
    updateDescription() {
        return CalendarManager.updateDescription(this.id, this.eventItem.id)
    }

   
}
