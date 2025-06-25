
class ZohoEvent extends Event {
  constructor(data = {}) {
    super(data);
  }

  static getResourceNameSingular() { return 'item'; }
  static getResourceNamePlural() { return 'items'; }
  static getFilter() { return { type: 'Event', eventType: 'Class', enabled: 'true' }; }

  static getToRecordMap() {
    return {
      id: 'item_id',
      title: 'name',
      _date: 'cf_scheduled_date',
      cost: 'purchase_rate',
      costDescription: 'purchase_description',
      price: 'rate',
      host: 'cf_host',
      location: 'cf_location',
      duration: 'cf_duration_hrs',
      description: 'cf_event_description',
      summary: 'description',
      sizeLimit: 'cf_attendance_limit',
      type: 'cf_type',
      eventType: 'cf_event_type',
      enabled: 'cf_enabled',
      _attendees: 'cf_attendees' // custom text field for attendees

    }
  };


  static fromRecord(record) {
    const data = ZohoEvent.convertRecordToData(record, ZohoEvent.getFromRecordMap());
    // Create a new ZohoEvent instance from the record data
    // Convert cf_scheduled_date_unformatted date from string to Date object
    if (record.cf_scheduled_date_unformatted) {
      data.date = new Date(record.cf_scheduled_date_unformatted);
    }

    if (data._attendees) {
      data.attendees = JSON.parse(data._attendees);
    }
    return new ZohoEvent(data);
  }

  toRecord() {
    this._attendees = JSON.stringify(this.attendees);
    // Update the date only if there is one - zoho allows partial updates
    if (this.date) {
        this._date = Utilities.formatDate(this.date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'); 
    }
    return this.convertDataToRecord(ZohoEvent.getToRecordMap())
  }
}

