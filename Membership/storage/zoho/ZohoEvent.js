class ZohoEvent extends Event {
    constructor(data = {}) {
        super(data);
    }

    static getResourceNameSingular() { return 'item'; }
    static getResourceNamePlural() { return 'items'; }
    static getFilter() { return { cf_type: 'Event', cf_event_type: 'Class' }; }

    static getToRecordMap() {
        return {
            id: 'item_id',
            title: 'name',
            name: 'item_name',
            date: 'cf_scheduled_date_unformatted',
            cost: 'purchase_rate',
            costDescription: 'purchase_description',
            price: 'rate',
            host: 'cf_host',
            location: 'cf_location',
            duration: 'cf_duration_hrs',
            description: 'cf_event_description',
            summary: 'description',
            sizeLimit: 'cf_attendance_limit',
            type: 'cf_event_type'
        }
    };


    static fromRecord(record) {
        const data = ZohoEvent.convertRecordToData(record, ZohoEvent.getFromRecordMap());
        // Create a new ZohoEvent instance from the record data
        // Convert any dates from string to Date object
        if (data.date) {
            data.date = new Date(data.date);
        }

        return new ZohoEvent(data);
    }

    toRecord() {
        return this.convertDataToRecord(ZohoEvent.getToRecordMap())
    }

}

