/**
 * Represents a location in the Google Calendar system.
 * This class extends the base Location class to include additional properties
 * and methods specific to Google Calendar locations.
 * It includes methods for creating a new location, converting to a record,
 * and mapping fields to Google Calendar record fields.     
 */
class CalendarLocation extends Location {
  constructor(data = {}) {
    super(data);
  }

  createNew(data = {}) {
    const location = super.createNew(data);
    location.name = data.name || '';
    location.address = data.address || '';
    location.capacity = data.capacity || 0;
    return location;
  }

  static getToRecordMap() {
    return {
      id: 'resourceId',
      name: 'resourceName',
      email: 'resourceEmail',
      capacity: 'capacity'
    };
  }


  static fromRecord(record) {
    const data = {
      email: record.resourceEmail || record.email || '',
      name: record.resourceName || record.displayName || '',
      id: record.email || ''
    };
    return new CalendarLocation(data);
    }
  }