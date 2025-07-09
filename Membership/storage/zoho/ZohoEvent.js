
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
      cost: 'purchase_rate',
      costDescription: 'purchase_description',
      price: 'rate',
      _hostId: 'cf_host',
      location: 'cf_location',
      duration: 'cf_duration_hrs',
      description: 'cf_event_description',
      summary: 'description',
      sizeLimit: 'cf_attendance_limit',
      type: 'cf_type',
      eventType: 'cf_event_type',
      enabled: 'cf_enabled'
    }
  };


  static fromRecord(record) {
    const data = ZohoEvent.convertRecordToData(record, ZohoEvent.getFromRecordMap());
    // Create a new ZohoEvent instance from the record data
    // Convert cf_scheduled_date_unformatted date from string to Date object
    if (record.cf_scheduled_date_unformatted) {
      data.date = new Date(record.cf_scheduled_date_unformatted);
    }

    if (record.cf_host) {
      data.host = new Member({name: record.cf_host, id: record.cf_host_unformatted}); 
    }
    
    if (data._attendees) {
      data.attendees = JSON.parse(data._attendees);
    }
    return new ZohoEvent(data);
  }

  toRecord() {
  
    // Flatten the host record to id only
    this._hostId = this.host?this.host.id:'';
    const record = this.convertDataToRecord(ZohoEvent.getToRecordMap())
    record.product_type = 'service';
    return record; 
  }

  static createNew(data = {}) {
    return super.createNew(data); 
  }
}

