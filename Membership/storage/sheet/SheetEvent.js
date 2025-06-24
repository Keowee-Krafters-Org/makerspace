/**
 * Class representing an Event stored in a Google Sheet.
 * Extends the base Event class.
 */
class SheetEvent extends Event {
    constructor(data = {}) {

       super(data);
    }

    static getResourceNameSingular() { return 'Event List'; }  
    static getResourceNamePlural() { throw new Error('Not implemented'); }
    static getResourceId() { return '1revNbHEK6W4C5KkxvNIQiOk-_VmkOCZabR5OyKwwc6I'; }

    static fromRecord(record) {
        return new Event({...record, 
            id: record.id || record.event_id || '',
            name: record.name || '',
            date: record.date ? new Date(record.date) : new Date(),
    });
    }

    toRecord() {
        return {...this}; 
    }

}

// Make the class globally accessible in Google Apps Script
this.Event = Event;
